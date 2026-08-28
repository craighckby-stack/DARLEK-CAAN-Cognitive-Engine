import { NextRequest, NextResponse } from 'next/server';
import type { ReadFileBody } from '@/lib/types';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

const DEFAULT_TIMEOUT = 15000;
const HEAD_TIMEOUT = 10000;
const RAW_TIMEOUT = 20000;
const LARGE_FILE_THRESHOLD = 1000000;

interface GitHubContentResponse {
  sha: string;
  name: string;
  size: number;
  encoding?: string;
  content?: string;
  type?: string;
}

async function fetchWithTimeout(
  url: string,
  options: Omit<RequestInit, 'signal'>,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'GITHUB_READ_FILE_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: ReadFileBody = await safeReqJson(req, {} as ReadFileBody);
    const { token, owner, repo, branch, path: filePath } = body;

    if (!token || !owner || !repo || !branch || !filePath) {
      return NextResponse.json(
        { error: 'Missing required parameters: token, owner, repo, branch, or path.' },
        { status: 400 }
      );
    }

    const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

    const standardHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    };

    const rawHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3.raw',
    };

    let metaRes: Response;
    try {
      metaRes = await fetchWithTimeout(url, { headers: standardHeaders }, DEFAULT_TIMEOUT);
    } catch (fetchError: unknown) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Network timeout or failure';
      return NextResponse.json({ error: `GitHub API connection failed: ${errorMsg}` }, { status: 504 });
    }

    if (!metaRes.ok) {
      if (metaRes.status === 403) {
        let headRes: Response | null = null;
        try {
          headRes = await fetchWithTimeout(url, { method: 'HEAD', headers: standardHeaders }, HEAD_TIMEOUT);
        } catch {
          // Fallback if HEAD request fails
        }

        const etag = headRes?.headers.get('etag');
        const sha = etag ? etag.replace(/W\//, '').replace(/"/g, '') : '';
        const size = parseInt(headRes?.headers.get('content-length') || '0', 10);

        let rawRes: Response;
        try {
          rawRes = await fetchWithTimeout(url, { headers: rawHeaders }, RAW_TIMEOUT);
        } catch (rawError: unknown) {
          const errorMsg = rawError instanceof Error ? rawError.message : 'Timeout reading raw content';
          return NextResponse.json({ error: `Large file read timeout: ${errorMsg}` }, { status: 504 });
        }

        if (!rawRes.ok) {
          const rawErr = await rawRes.text();
          return NextResponse.json(
            { error: `Large file read failed: ${rawErr}` },
            { status: rawRes.status }
          );
        }

        const textContent = await rawRes.text();
        return NextResponse.json({
          content: textContent,
          sha,
          name: cleanPath.split('/').pop() || '',
          size,
        });
      }

      const err = await metaRes.text();
      return NextResponse.json(
        { error: `GitHub API error: ${err}` },
        { status: metaRes.status }
      );
    }

    const data: GitHubContentResponse | GitHubContentResponse[] = await metaRes.json();

    if (Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Selected path is a directory, not a file.' },
        { status: 400 }
      );
    }

    if (data.size && data.size >= LARGE_FILE_THRESHOLD) {
      let rawRes: Response;
      try {
        rawRes = await fetchWithTimeout(url, { headers: rawHeaders }, RAW_TIMEOUT);
      } catch (rawError: unknown) {
        const errorMsg = rawError instanceof Error ? rawError.message : 'Timeout reading raw content';
        return NextResponse.json({ error: `Large file content read timeout: ${errorMsg}` }, { status: 504 });
      }

      if (!rawRes.ok) {
        const rawErr = await rawRes.text();
        return NextResponse.json(
          { error: `Large file content read failed: ${rawErr}` },
          { status: rawRes.status }
        );
      }

      const textContent = await rawRes.text();
      return NextResponse.json({
        content: textContent,
        sha: data.sha,
        name: data.name,
        size: data.size,
      });
    }

    if (data.encoding === 'base64' && data.content) {
      const buffer = Buffer.from(data.content, 'base64');
      const lowerPath = filePath.toLowerCase();
      
      try {
        if (lowerPath.endsWith('.pdf')) {
          const pdfParseModule = await import('pdf-parse');
          const pdfParse = (pdfParseModule as { default?: (buf: Buffer) => Promise<{ text: string }> }).default || pdfParseModule;
          const pdfData = await (pdfParse as (buf: Buffer) => Promise<{ text: string }>)(buffer);
          return NextResponse.json({
            content: `[PDF CONTENT EXTRACTED]\n\n${pdfData.text}`,
            sha: data.sha,
            name: data.name,
            size: data.size,
          });
        }
        
        if (lowerPath.endsWith('.docx')) {
          const mammothModule = await import('mammoth');
          const mammoth = mammothModule.default;
          const docxData = await mammoth.extractRawText({ buffer });
          return NextResponse.json({
            content: `[DOCX CONTENT EXTRACTED]\n\n${docxData.value}`,
            sha: data.sha,
            name: data.name,
            size: data.size,
          });
        }
        
        if (lowerPath.endsWith('.zip')) {
          return NextResponse.json({
            content: '[ZIP FILE - CANNOT EXTRACT TEXT DIRECTLY]',
            sha: data.sha,
            name: data.name,
            size: data.size,
          });
        }
      } catch (parseError: unknown) {
         const parseErrorMsg = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
         console.error('Failed to parse docx/pdf:', parseError);
         return NextResponse.json({
           content: `[ERROR PARSING DOCUMENT: ${parseErrorMsg}]`,
           sha: data.sha,
           name: data.name,
           size: data.size,
         });
      }

      const content = buffer.toString('utf-8');
      return NextResponse.json({
        content,
        sha: data.sha,
        name: data.name,
        size: data.size,
      });
    }

    let rawRes: Response;
    try {
      rawRes = await fetchWithTimeout(url, { headers: rawHeaders }, RAW_TIMEOUT);
    } catch (rawError: unknown) {
      const errorMsg = rawError instanceof Error ? rawError.message : 'Timeout reading raw content fallback';
      return NextResponse.json({ error: `Raw content fetch timeout: ${errorMsg}` }, { status: 504 });
    }

    if (rawRes.ok) {
      const textContent = await rawRes.text();
      return NextResponse.json({
        content: textContent,
        sha: data.sha,
        name: data.name,
        size: data.size,
      });
    }

    return NextResponse.json(
      { error: 'Unable to decode file content. File may be binary.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Read file error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}