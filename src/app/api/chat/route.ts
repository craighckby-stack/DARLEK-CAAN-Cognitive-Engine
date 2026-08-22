import { NextRequest, NextResponse } from 'next/server';
import { callLlm, getDefaultGeminiKey } from '@/lib/llm-provider';
import { dalekBrainChat } from '@/lib/dalek-brain';
import type { ChatRequestBody, GitHubFile } from '@/lib/types';
import { DALEK_CAAN_SYSTEM_PROMPT } from '@/lib/constants';
import { safeReqJson, safeResponseJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'DALEK_CHAT_API' });
}

async function fetchGithubFile(token: string, owner: string, repo: string, branch: string, path: string): Promise<string> {
  try {
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3.raw',
      },
    });
    if (res.ok) {
      return await res.text();
    }
  } catch (err) {
    console.warn(`[CHAT] Failed to fetch raw file for path ${path}:`, err);
  }
  return '';
}

async function fetchGithubRepoTree(token: string, owner: string, repo: string, branch: string): Promise<Array<{ path: string; size: number }>> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (res.ok) {
      const data = await safeResponseJson(res, {});
      if (Array.isArray(data.tree)) {
        return data.tree
          .filter((item: any) => item.type === 'blob')
          .map((item: any) => ({
            path: item.path,
            size: item.size || 0,
          }));
      }
    }
  } catch (err) {
    console.error('[CHAT] Failed to fetch github repo tree:', err);
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { message, history, systemState, scannedFiles } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ content: '', success: false, error: 'Message is required' }, { status: 400 });
    }

    let processedMessage = message.trim();
    const reversedMsg = processedMessage.split('').reverse().join('');
    const commonWords = ['help', 'create', 'status', 'scan', 'propose', 'abort', 'skip', 'done', 'hello', 'hi', 'exterminate'];
    if (commonWords.includes(reversedMsg.toLowerCase()) && !commonWords.includes(processedMessage.toLowerCase())) {
      processedMessage = reversedMsg;
    }

    const state = systemState || {
      setupComplete: false,
      evolutionCycle: 0,
      repoConfig: { owner: 'unknown', repo: 'unknown', branch: 'unknown' },
      connectionStatus: { github: 'idle' },
      apiKeys: { github: '' },
      saturation: { structuralChange: 0, semanticSaturation: 0, velocity: 0, identityPreservation: 1, capabilityAlignment: 0, crossFileImpact: 0 },
    };

    const token = state.apiKeys?.github;
    const { owner, repo, branch } = state.repoConfig || {};

    const lowerMessage = message.toLowerCase();
    const isReadmeOrAnalysis = 
      lowerMessage.includes('readme') || 
      lowerMessage.includes('read me') || 
      lowerMessage.includes('analyse system') || 
      lowerMessage.includes('analyze system') || 
      lowerMessage.includes('analyse repository') || 
      lowerMessage.includes('analyze repository') || 
      lowerMessage.includes('system analysis') || 
      lowerMessage.includes('repository analysis') || 
      lowerMessage.includes('architecture overview') || 
      lowerMessage.includes('describe the project');

    let systemContext = '';
    let fetchedTreeCount = 0;
    let fetchedFilesCount = 0;

    if (token && owner && repo && branch) {
      if (isReadmeOrAnalysis) {
let filesList: Array<{ path: string; size: number }> = [];

        if (scannedFiles && Array.isArray(scannedFiles) && scannedFiles.length > 0) {
          filesList = scannedFiles.map((f: any) => ({ path: f.path, size: f.size || 0 }));
        } else {
          filesList = await fetchGithubRepoTree(token, owner, repo, branch);
        }

        fetchedTreeCount = filesList.length;

        // Filter out non-essential paths (node_modules, next build folders, hidden files, logs, config binary)
        const filteredFiles = filesList.filter((f) => {
          const excludePatterns = [
            'node_modules/', '.git/', 'dist/', 'build/', '.next/',
            '__pycache__/', '.DS_Store', '.env', '.env.local',
            'package-lock.json', 'yarn.lock', '.svn/',
          ];
          return !excludePatterns.some(p => f.path.includes(p));
        });

        // Select crucial repository files
        const criticalCandidates = [
          'package.json',
          'prisma/schema.prisma',
          'src/db/schema.ts',
          'db/schema.ts',
          'src/app/page.tsx',
          'src/app/layout.tsx',
          'next.config.ts',
          'next.config.js',
          'next.config.mjs',
          'tailwind.config.ts',
          'tailwind.config.js',
          'postcss.config.js',
          'postcss.config.mjs',
          'README.md',
        ];

        // Add other non-binary, non-excluded components or API endpoints to get a comprehensive picture
        const otherRepresentativeFiles = filteredFiles
          .filter(f => {
            const pathLower = f.path.toLowerCase();
            const isCode = 
              pathLower.endsWith('.tsx') || 
              pathLower.endsWith('.ts') || 
              pathLower.endsWith('.js') || 
              pathLower.endsWith('.jsx') || 
              pathLower.endsWith('.prisma') ||
              pathLower.endsWith('.py') ||
              pathLower.endsWith('.md');
            const isCritical = criticalCandidates.includes(f.path);
            return isCode && !isCritical;
          })
          .slice(0, 10) // Select up to 10 matching representative source files
          .map(f => f.path);

        const filesToRead = [
          ...criticalCandidates.filter(p => filteredFiles.some(f => f.path === p)),
          ...otherRepresentativeFiles
        ].slice(0, 15); // cap at maximum 15 files to be absolutely safe with rate limits and token windows
// Fetch file content in parallel
        const fileContents: Record<string, string> = {};
        await Promise.all(
          filesToRead.map(async (path) => {
            const content = await fetchGithubFile(token, owner, repo, branch, path);
            if (content) {
              fileContents[path] = content;
            }
          })
        );

        fetchedFilesCount = Object.keys(fileContents).length;

        // Construct directory / file tree breakdown
        const fileTreeStr = filteredFiles
          .map(f => `- ${f.path} (${(f.size / 1024).toFixed(1)} KB)`)
          .join('\n');

        // Construct file content dump
        let contentsSection = '';
        for (const [path, content] of Object.entries(fileContents)) {
          contentsSection += `\n--- FILE: ${path} ---\n${content.slice(0, 4500)}\n`; // truncate long files at 4500 chars to avoid model context overflow
        }

        systemContext = `
===================================================
[DENSITY INJECTOR] ACTUAL REPOSITORY CODE AND WORKSPACE DESIGN
===================================================
You are analyzing the COMPLETE system. Ensure your thoughts, analysis, and requested README are hyper-tailored to the actual codebase.

Branch: "${branch}"
Repository Path: "${owner}/${repo}"

Workspace File Layout (${filteredFiles.length} files):
${fileTreeStr}

Real Repository Core File Contents:
${contentsSection}
===================================================
`;
      } else {
        // Automatically check & fetch README.md for every chat query to keep DARLEK CANN fully instruction-aware!
const readmeContent = await fetchGithubFile(token, owner, repo, branch, 'README.md');
        if (readmeContent) {
          fetchedFilesCount = 1;
          systemContext = `
===================================================
[INSTRUCTION SAFETY] ACTIVE TARGET REPOSITORY README.md
===================================================
The target repository being analyzed has a root README.md containing core instructions, tech stack design, and specifications.
You MUST read, comprehend, and strictly align your decisions, design logic, and refactor proposals with these instructions of the repository:

${readmeContent.slice(0, 8000)}
===================================================
`;
        }
      }
    }

    const contextInfo = `
State: ${state.setupComplete ? 'OPERATIONAL' : 'SETUP'} | Cycle: ${state.evolutionCycle} | Repo: ${state.repoConfig.owner}/${state.repoConfig.repo} | Branch: ${state.repoConfig.branch}`.trim();

    const enhancedSystemPrompt = `${DALEK_CAAN_SYSTEM_PROMPT}\n\n${contextInfo}${systemContext ? `\n\n${systemContext}` : ''}`;

    const userGeminiKey = (body as unknown as Record<string, unknown>).apiKeys
      ? ((body as unknown as Record<string, Record<string, string>>).apiKeys?.gemini)
      : undefined;
    const geminiKey = userGeminiKey || getDefaultGeminiKey();

    // Unified LLM call: Gemini → SDK → Dalek Brain (local)
    // We increase maxTokens to 4096 to allow detailed, comprehensive README and full-scale architectural writeups.
    const result = await callLlm({
      systemPrompt: enhancedSystemPrompt,
      userPrompt: processedMessage,
      geminiApiKey: geminiKey,
      maxTokens: 4096,
      temperature: 0.7,
    });

    // Final fallback: Dalek Brain chat
    const content = result.text || dalekBrainChat(enhancedSystemPrompt, processedMessage, history || []) || 'Processing error. Try again.';

    return NextResponse.json({
      content,
      success: true,
      provider: result.provider || 'Dalek Brain',
      analyzedFilesCount: fetchedFilesCount,
      totalFilesInRepo: fetchedTreeCount,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { content: '', success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

