import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';
import { getDefaultGeminiKey } from '@/lib/llm-provider';
import ZAI from 'z-ai-web-dev-sdk';
import { safeReqJson } from '@/lib/safe-json';

export const maxDuration = 300;

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'GITHUB_CREATE_SYSTEM_REPO_API' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await safeReqJson(req, {});
    const { token, repoName, description, blueprintName, blueprintContent, prompt, apiKeys } = body;

    if (!token || !repoName) {
      return NextResponse.json({ error: 'GitHub Token and Repository Name are required.' }, { status: 400 });
    }

    const userGeminiKey = apiKeys?.gemini;
    const geminiKey = userGeminiKey || getDefaultGeminiKey();

    if (!geminiKey) {
      return NextResponse.json({ error: 'Gemini API Key is required for compiling specifications.' }, { status: 400 });
    }

    // Step 1: Validate GitHub Token
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'GitHub Token validation failed.' }, { status: 401 });
    }

    const userData = await userRes.json();
    const owner = userData.login;

    // Step 2: Instruct Gemini to compile the blueprint into a beautiful Next.js structure
    const systemPrompt = `You are DALEK CAAN's Deep System Compiler.
Your function is to strictly focus on code enhancement and extension for this specific repository. Read the user specification/blueprint document, analyze it rigorously, and synthesize a COMPLETE, highly-polished, fully-functional code enhancement.
You must output a raw, parseable JSON object satisfying the structured JSON schema.

For extreme efficiency, generate highly-polished, high-density, and concise code. Rely on expressive, elegant Tailwind classes.

IMPORTANT: DO NOT generate just a generic generic 5-file template. You MUST generate the FULL system as defined in the blueprint, breaking the code down into logical files.
Generate all necessary files including:
1. "package.json": include all necessary React/Next.js dependencies (React 19, Next.js 15, "lucide-react", "framer-motion", "recharts", etc.) + any other libraries required by the blueprint.
2. "README.md": detailing the design specs and system flow.
3. "src/app/globals.css": styles with absolute minimal lines (@import "tailwindcss";).
4. "src/app/layout.tsx": RootLayout.
5. "src/app/page.tsx": the primary workspace interface, importing necessary components.
6. "src/components/...": All necessary UI components, charts, layout sections.
7. "src/lib/...": Utilities, types, constants.
8. "src/app/api/...": Any necessary Next.js backend API routes for the logic described.

- Use a stunning dark-mode futuristic sci-fi aesthetic ("Dalek Caan Cyber slate" or elegant off-black with glowing blue/neon-cyan details, soft shadows, and deep red highlights).
- Replace any mock simulations with REAL logic or fully implemented mock data functions that behave realistically.
- State management: Use robust hooks or context to manage records.
- Be incredibly thorough. The code must be 100% syntactically valid TypeScript, compilation-ready, with no truncation, no comments like "implement here", and no syntax errors. EXTERMINATE all lazy placeholders!`;

    const userPrompt = `System/Repository Name: ${repoName}
Description: ${description || 'No description provided'}
Attached Specification Document: "${blueprintName}"
Document Content:
"""
${blueprintContent || 'No document content provided.'}
"""

User Extra Customization Instructions:
"${prompt || 'Compile the blueprint directly with absolute fidelity.'}"

Synthesize the files JSON structure now. Remember, output ONLY valid raw JSON with exact {"files": [...]} signature representing the compiled Next.js structure. Write dense, beautiful, clean code with zero redundant boilerplate to stay perfectly compact.`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        files: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              path: { type: 'STRING' },
              content: { type: 'STRING' }
            },
            required: ['path', 'content']
          }
        }
      },
      required: ['files']
    };

    let generatedText: string | null = null;
    let fallbackUsed = false;
    let useDeterministicFallback = false;

    try {
      generatedText = await callGemini(systemPrompt, userPrompt, geminiKey, {
        maxTokens: 8192,
        temperature: 0.2, // low temperature for precise JSON generation
        responseMimeType: 'application/json',
        responseSchema,
      });
    } catch (geminiError: any) {
      console.warn('[Create repo] Gemini call failed, attempting fallback to Z-AI SDK:', geminiError.message || geminiError);
      try {
        const zai = await ZAI.create();
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 8192,
          thinking: { type: 'disabled' },
        });
        generatedText = completion.choices?.[0]?.message?.content || null;
        fallbackUsed = true;
      } catch (sdkError: any) {
        console.error('[Create repo] Fallback SDK failed:', sdkError.message || sdkError);
useDeterministicFallback = true;
      }
    }

    const safeParseJson = (str: string): any => {
      let repaired = '';
      let inString = false;
      let escape = false;
      const stack: ('{' | '[')[] = [];

      for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (escape) {
          repaired += char;
          escape = false;
          continue;
        }

        if (char === '\\') {
          repaired += char;
          if (inString) {
            escape = true;
          }
          continue;
        }

        if (char === '"') {
          inString = !inString;
          repaired += char;
          continue;
        }

        if (inString) {
          if (char === '\n') {
            repaired += '\\n';
          } else if (char === '\r') {
            repaired += '\\r';
          } else {
            repaired += char;
          }
        } else {
          repaired += char;
          if (char === '{' || char === '[') {
            stack.push(char);
          } else if (char === '}') {
            if (stack[stack.length - 1] === '{') {
              stack.pop();
            }
          } else if (char === ']') {
            if (stack[stack.length - 1] === '[') {
              stack.pop();
            }
          }
        }
      }

      if (inString) {
        repaired += '"';
      }

      repaired = repaired.trimEnd();

      if (repaired.endsWith(',')) {
        repaired = repaired.slice(0, -1).trimEnd();
      } else if (repaired.endsWith(':')) {
        repaired += ' ""';
      }

      while (stack.length > 0) {
        const last = stack.pop();
        if (last === '{') {
          repaired += '}';
        } else if (last === '[') {
          repaired += ']';
        }
      }

      return JSON.parse(repaired);
    };

    let compilation: { files: Array<{ path: string; content: string }> };
    if (useDeterministicFallback) {
compilation = generateDeterministicFallbackStructure(repoName, description, blueprintName, blueprintContent);
    } else {
      if (!generatedText) {
        throw new Error('Gemini API returned empty compilation output.');
      }
      generatedText = generatedText.trim();
      try {
        compilation = safeParseJson(generatedText);
      } catch (parseErr: any) {
        console.error('Failed to parse compiled JSON. Raw text was:', generatedText);
        // Attempt a fallback extraction
        const jsonMatch = generatedText.match(/{[\s\S]*}/);
        if (jsonMatch) {
          try {
            compilation = safeParseJson(jsonMatch[0]);
          } catch (matchErr: any) {
            throw new Error(`Gemini output could not be parsed as safety JSON schema. Spec compilation broke with error: ${matchErr?.message || matchErr}`);
          }
        } else {
          throw new Error(`Gemini output could not be parsed as standard files schema. Parsing error: ${parseErr?.message || parseErr}`);
        }
      }
    }

    if (!compilation.files || !Array.isArray(compilation.files)) {
      throw new Error('Invalid compilation output format: files array is missing.');
    }

    // Automatically use the attached specification/blueprint .md file as the exact README.md of the created repository
    if (blueprintContent) {
      const readmeIndex = compilation.files.findIndex(f => f.path.toLowerCase() === 'readme.md');
      if (readmeIndex !== -1) {
        compilation.files[readmeIndex].content = blueprintContent;
      } else {
        compilation.files.push({
          path: 'README.md',
          content: blueprintContent
        });
      }
    }

    // Step 3: Create GitHub Repository
    // Check if it already exists
    const existingCheck = await fetch(`https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let repoCreated = existingCheck.ok;
    let defaultBranch = 'main';

    if (!repoCreated) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName,
          description: description || `Compiled with Dalek Caan AGI Evolution Engine based on "${blueprintName}" blueprint`,
          auto_init: true,
          private: false,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(`Failed to create repository on GitHub: ${errData.message || createRes.statusText}`);
      }
      repoCreated = true;
    } else {
      const repoData = await existingCheck.json();
      defaultBranch = repoData.default_branch || 'main';
    }

    // Give GitHub half a second to initialize the branch tree
    await new Promise(r => setTimeout(r, 1000));

    // Get branch reference (or tree SHA) to create commit tree, or just push single files
    // Step 4: Serialized push to GitHub
    const pushedFiles: string[] = [];
    const failedFiles: Array<{ file: string; error: string }> = [];

    for (const file of compilation.files) {
      try {
        const base64Content = Buffer.from(file.content, 'utf-8').toString('base64');
        const encodedPath = file.path.split('/').map(encodeURIComponent).join('/');
        
        // Check if file exists to fetch its SHA
        const fileCheckUrl = `https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}/contents/${encodedPath}?ref=${defaultBranch}`;
        const checkRes = await fetch(fileCheckUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        let fileSha: string | undefined;
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          fileSha = checkData.sha;
        }

        const putBody: Record<string, unknown> = {
          message: `[DALEK CAAN COMPILER] Spawn spec file: ${file.path}`,
          content: base64Content,
          branch: defaultBranch,
        };

        if (fileSha) {
          putBody.sha = fileSha;
        }

        const putRes = await fetch(`https://api.github.com/repos/${owner}/${encodeURIComponent(repoName)}/contents/${encodedPath}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(putBody),
        });

        if (putRes.ok) {
          pushedFiles.push(file.path);
        } else {
          const errText = await putRes.text();
          failedFiles.push({ file: file.path, error: errText });
        }
      } catch (err) {
        failedFiles.push({ file: file.path, error: err instanceof Error ? err.message : 'Unknown write error' });
      }
      // Brief rate-limit safety pause
      await new Promise(r => setTimeout(r, 200));
    }

    return NextResponse.json({
      success: true,
      repoName,
      repoUrl: `https://github.com/${owner}/${repoName}`,
      fullName: `${owner}/${repoName}`,
      pushedFiles,
      failedFiles,
      totalFiles: compilation.files.length,
      fallbackUsed: useDeterministicFallback,
    });

  } catch (error) {
    console.error('Create system repo error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown local compilation error'
    }, { status: 500 });
  }
}

function generateDeterministicFallbackStructure(
  repoName: string,
  description: string,
  blueprintName: string,
  blueprintContent: string
) {
  const escapedRepoName = repoName.replace(/"/g, '\\"');
  const escapedDescription = (description || '').replace(/"/g, '\\"');
  const escapedBlueprintName = (blueprintName || '').replace(/"/g, '\\"');
  const escapedBlueprintContent = (blueprintContent || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');

  const packageJson = `{
  "name": "${repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "framer-motion": "^11.11.11",
    "lucide-react": "^0.468.0",
    "recharts": "^2.15.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "4.0.0-alpha.31"
  }
}`;

  const readmeMd = `# ${repoName}

\${description || "System compiled and optimized under Dalek Caan control."}

## Specifications
- **Blueprint file**: \${blueprintName}
- **Framework**: Next.js 15 with Tailwind CSS
- **Interactions**: Autonomous Evolution Interface enabled

## Quick Start
\\\`\\\`\\\`bash
npm install
npm run dev
\\\`\\\`\\\``;

  const globalsCss = `@import "tailwindcss";
@import "tw-animate-css";`;

  const layoutTsx = `'use client';

import React from 'react';
import './globals.css';

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;

  return {
    files: [
      { path: 'package.json', content: packageJson },
      { path: 'README.md', content: readmeMd },
      { path: 'src/app/globals.css', content: globalsCss },
      { path: 'src/app/layout.tsx', content: layoutTsx }
    ]
  };
}
