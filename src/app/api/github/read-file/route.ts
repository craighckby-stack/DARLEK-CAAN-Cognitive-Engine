import { NextRequest, NextResponse } from 'next/server';
import type { ReadFileBody } from '@/lib/types';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_READ_FILE_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body: ReadFileBody = await safeReqJson(req, {} as ReadFileBody);
    const { token, owner, repo, branch, path: filePath } = body;

    const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let metaRes: Response;
    try {
      metaRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    // If 403 or too large, fetch metadata via HEAD first, then read raw content
    if (!metaRes.ok) {
      if (metaRes.status === 403) {
        // Retrieve file SHA and content-length using a lightweight HEAD request
        const headController = new AbortController();
        const headTimeout = setTimeout(() => headController.abort(), 10000);
        let headRes: Response;
        try {
          headRes = await fetch(url, {
            method: 'HEAD',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
            signal: headController.signal,
          });
        } finally {
          clearTimeout(headTimeout);
        }

        const etag = headRes.headers.get('etag');
        const sha = etag ? etag.replace(/W\//, '').replace(/"/g, '') : '';
        const size = parseInt(headRes.headers.get('content-length') || '0', 10);

        // Fetch raw content
        const rawController = new AbortController();
        const rawTimeout = setTimeout(() => rawController.abort(), 20000);
        let rawRes: Response;
        try {
          rawRes = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3.raw',
            },
            signal: rawController.signal,
          });
        } finally {
          clearTimeout(rawTimeout);
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

    const data = await metaRes.json();

    if (Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Selected path is a directory, not a file.' },
        { status: 400 }
      );
    }

    // If size exceeds 1MB, we MUST fetch raw content to prevent GitHub limitation block
    if (data.size && data.size >= 1000000) {
      const rawController = new AbortController();
      const rawTimeout = setTimeout(() => rawController.abort(), 20000);
      let rawRes: Response;
      try {
        rawRes = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3.raw',
          },
          signal: rawController.signal,
        });
      } finally {
        clearTimeout(rawTimeout);
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
          const pdfParseModule = (await import('pdf-parse')) as any;
          const pdfParse = pdfParseModule.default || pdfParseModule;
          const pdfData = await pdfParse(buffer);
          return NextResponse.json({
            content: `[PDF CONTENT EXTRACTED]\n\n${pdfData.text}`,
            sha: data.sha,
            name: data.name,
            size: data.size,
          });
        }
        
        if (lowerPath.endsWith('.docx')) {
          const mammoth = (await import('mammoth')).default;
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
            content: `[ZIP FILE - CANNOT EXTRACT TEXT DIRECTLY]`,
            sha: data.sha,
            name: data.name,
            size: data.size,
          });
        }
      } catch (err: any) {
         console.error('Failed to parse docx/pdf:', err);
         return NextResponse.json({
           content: `[ERROR PARSING DOCUMENT: ${err.message}]`,
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

    // Default raw read fallback for non-base64 text files
    const rawController = new AbortController();
    const rawTimeout = setTimeout(() => rawController.abort(), 20000);
    let rawRes: Response;
    try {
      rawRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3.raw',
        },
        signal: rawController.signal,
      });
    } finally {
      clearTimeout(rawTimeout);
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
  } catch (error) {
    console.error('Read file error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

