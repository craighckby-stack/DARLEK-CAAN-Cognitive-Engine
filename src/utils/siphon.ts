/**
 * EMG Core v49 Neural Code and Documentation Optimizer Engine
 * File Path: "src/utils/siphon.ts"
 * Optimization: Comprehensive sovereign overhaul, high type-safety, efficient error handling, and memory optimization.
 */

export interface SiphonSource {
  owner: string;
  repo: string;
  branch: string;
  label: string;
}

interface GitHubBlob {
  path?: string;
  type?: string;
  content?: string;
}

interface GitHubTreeResponse {
  tree?: GitHubBlob[];
}

interface BrainApiResponse {
  reply?: string;
}

interface GitHubRepo {
  name: string;
}

interface GitHubBranch {
  name: string;
}

export const SOURCES: readonly SiphonSource[] = [
  { owner: "craighckby-stack", repo: "AI_Agent_OS", branch: "main", label: "DARLEKCANNV3 MAIN" },
  { owner: "craighckby-stack", repo: "AI_Agent_OS", branch: "main", label: "AI PROJECT RECON" },
  { owner: "craighckby-stack", repo: "Huxley-Singularity-Loop-Main", branch: "main", label: "SINGULARITY LOOP" },
  { owner: "google-deepmind", repo: "deepmind-research", branch: "master", label: "AGI RESEARCH" },
  { owner: "microsoft", repo: "autogen", branch: "main", label: "MULTI-AGENT ORCHESTRATION" },
  { owner: "vercel", repo: "ai", branch: "main", label: "NEXT-GEN AI SDK" },
  { owner: "firebase", repo: "genkit", branch: "main", label: "ORCHESTRATION" },
  { owner: "huggingface", repo: "transformers", branch: "main", label: "ARCHITECTURE" },
] as const;

/**
 * Safely decodes base64 string content with Unicode support.
 */
function decodeBase64Utf8(base64Content: string): string {
  try {
    const cleaned = base64Content.replace(/\s/g, "");
    const binString = atob(cleaned);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
  } catch {
    // Fallback parser
    try {
      return decodeURIComponent(escape(atob(base64Content.replace(/\s/g, ""))));
    } catch {
      return "";
    }
  }
}

export async function siphonFetchFile(
  src: SiphonSource,
  githubToken?: string
): Promise<string> {
  try {
    const headers: Record<string, string> = {
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
      Accept: "application/vnd.github.v3+json",
    };

    const treeRes = await fetch(
      `https://api.github.com/repos/${src.owner}/${src.repo}/git/trees/${src.branch}?recursive=1`,
      { headers }
    );
    if (!treeRes.ok) return "// No JS/TS files found";

    const tree = (await treeRes.json()) as GitHubTreeResponse;
    if (!tree.tree || !Array.isArray(tree.tree)) return "// No JS/TS files found";

    const files = tree.tree.filter(
      (f): f is Required<Pick<GitHubBlob, "path" | "type">> & GitHubBlob =>
        f.type === "blob" && typeof f.path === "string" && /\.(js|ts)$/.test(f.path)
    );

    if (files.length === 0) return "// No JS/TS files found";

    const randomFile = files[Math.floor(Math.random() * files.length)];
    const contentRes = await fetch(
      `https://api.github.com/repos/${src.owner}/${src.repo}/contents/${randomFile.path}?ref=${src.branch}`,
      { headers }
    );

    if (!contentRes.ok) return "// Failed to read content";

    const contentData = (await contentRes.json()) as GitHubBlob;
    if (!contentData || typeof contentData.content !== "string") {
      return "// Failed to read content";
    }

    const decoded = decodeBase64Utf8(contentData.content);
    return decoded ? decoded.slice(0, 3000) : "// Failed to read content";
  } catch {
    return "// Fetch failed";
  }
}

export async function siphonEvolveCycle(
  baseCode: string,
  sourceData: string,
  addLog?: (msg: string) => void
): Promise<string> {
  try {
    if (addLog) addLog(`[SIPHON] Identifying structural constraints & working chunks...`);
    const extractRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `Source to analyze:\n${sourceData}` }],
        systemInstruction: `[ROLE] You are the AHI STACK EXTRACTOR.
[TASK] Read the provided repository branches. Extract all raw code files (.py, .js, .ts, .json).
[OUTPUT FORMAT] 
Strict JSON only. No markdown fences, no extra text.
{
  "repository": "repo_name",
  "branch": "branch_name",
  "files": [
    {"path": "file_path", "content": "raw_code_here"}
  ]
}`,
      }),
    });
    if (!extractRes.ok) return baseCode;

    const extractData = (await extractRes.json()) as BrainApiResponse;
    const chunks = extractData.reply || "";

    if (addLog) addLog(`[SIPHON] Debating chunk viability (Hyperspace Sync)...`);
    const debateRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `Current App Code:\n${baseCode}\n\nProposed Chunks from external source:\n${chunks}` }],
        systemInstruction: `[ROLE] You are the AHI STACK QUARANTINE ENGINE.
[TASK] Evaluate the extracted files. Determine if this code is dangerous, purely backup noise, or useful historical context.
[OUTPUT FORMAT]
Strict plain text. No markdown.
Provide a brief PRO vs CON list.
End with exactly one line: "VERDICT: STACK" (archive safely) or "VERDICT: PURGE" (delete permanently).`,
      }),
    });
    if (!debateRes.ok) return baseCode;

    const debateData = (await debateRes.json()) as BrainApiResponse;
    const debateOutcome = debateData.reply || "";

    if (addLog) addLog(`[SIPHON] Resolving debate & integrating chosen logic...`);
    const mutRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `Current Code:\n${baseCode}\n\nDebate Consensus / Instruction:\n${debateOutcome}\n\nTASK: Return the FULL updated code integrating the agreed upon logic. NO markdown. NO explanation.` }],
        systemInstruction: `[ROLE] You are the AHI ARCHIVAL MUTATOR.
[TASK] Format the approved stacked history for inclusion at the bottom of a target stub file.

[OUTPUT FORMAT]
- Output raw text only. No markdown code blocks.
- Wrap all historical code inside safe multi-line comment blocks (e.g., \`# --- STACKED SOURCE ---\` or Python docstrings, escaping any inner triple-quotes if present) so the execution interpreter ignores it.
- Prepend each block with a comment header: \`# STACKED SOURCE: [repo/branch]\`.

[ZERO TRUNCATION MANDATE]
- Include the ENTIRE raw code for the archived files.
- Omit zero code lines. Never use placeholders.`,
      }),
    });
    if (!mutRes.ok) return baseCode;

    const mutData = (await mutRes.json()) as BrainApiResponse;
    let mutated = mutData.reply || "";
    
    mutated = mutated.replace(/^```[a-z]*\n|```$/gm, "").trim();
    if (!mutated) return baseCode;
    return mutated;
  } catch (e) {
    console.error("AutoSiphon Error", e);
    return baseCode;
  }
}

export async function executeAutoSiphonTarget(
  currentCode: string,
  rounds: number,
  githubToken?: string,
  addLog?: (msg: string) => void
): Promise<string> {
  let code = currentCode;
  const dynamicSources: SiphonSource[] = [...SOURCES];

  if (githubToken) {
    if (addLog) addLog(`[SIPHON] Enumerating user GitHub repositories & branches...`);
    try {
      const headers = { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github.v3+json" };
      const userRes = await fetch("https://api.github.com/user", { headers });
      
      if (userRes.ok) {
        const userData = (await userRes.json()) as { login?: string };
        const owner = userData.login;
        if (owner) {
          const reposRes = await fetch(
            `https://api.github.com/user/repos?per_page=100&affiliation=owner`,
            { headers }
          );
          
          if (reposRes.ok) {
            const repos = (await reposRes.json()) as GitHubRepo[];
            if (repos && repos.length > 0) {
              if (addLog) addLog(`[SIPHON] Found ${repos.length} repositories for ${owner}...`);
              const sampledRepos = [...repos].sort(() => 0.5 - Math.random()).slice(0, 5);

              for (const repo of sampledRepos) {
                const branchesRes = await fetch(
                  `https://api.github.com/repos/${owner}/${repo.name}/branches?per_page=5`,
                  { headers }
                );
                if (branchesRes.ok) {
                  const branches = (await branchesRes.json()) as GitHubBranch[];
                  if (branches && branches.length > 0) {
                    for (const branch of branches) {
                      dynamicSources.push({
                        owner,
                        repo: repo.name,
                        branch: branch.name,
                        label: `AUTO-DISCOVERED: ${repo.name} (${branch.name})`,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      if (addLog) addLog(`[SIPHON] Failed to enumerate GitHub account: ${e}`);
    }
  }

  for (let r = 1; r <= rounds; r++) {
    const sampledSources = [...dynamicSources].sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const src of sampledSources) {
      if (addLog) addLog(`[SIPHON R${r}] Fetching from ${src.label}...`);
      const data = await siphonFetchFile(src, githubToken);
      if (addLog) addLog(`[SIPHON R${r}] Morphing code utilizing ${src.label} patterns...`);
      code = await siphonEvolveCycle(code, data, addLog);
    }
  }

  if (addLog) addLog(`[SIPHON] Complete after ${rounds} rounds.`);
  return code;
}