const SOURCES = [
  { owner: "craighckby-stack", repo: "AI_Agent_OS", branch: "main", label: "DARLEKCANNV3 MAIN" },
  { owner: "craighckby-stack", repo: "AI_Agent_OS", branch: "main", label: "AI PROJECT RECON" },
  { owner: "craighckby-stack", repo: "Huxley-Singularity-Loop-Main", branch: "main", label: "SINGULARITY LOOP" },
  { owner: "google-deepmind", repo: "deepmind-research", branch: "master", label: "AGI RESEARCH" },
  { owner: "microsoft", repo: "autogen", branch: "main", label: "MULTI-AGENT ORCHESTRATION" },
  { owner: "vercel", repo: "ai", branch: "main", label: "NEXT-GEN AI SDK" },
  { owner: "firebase", repo: "genkit", branch: "main", label: "ORCHESTRATION" },
  { owner: "huggingface", repo: "transformers", branch: "main", label: "ARCHITECTURE" },
];

export async function siphonFetchFile(src: { owner: string; repo: string; branch: string; label: string }, githubToken?: string) {
  try {
    const headers: Record<string, string> = {
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {})
    };
    const res = await fetch(`https://api.github.com/repos/${src.owner}/${src.repo}/git/trees/${src.branch}?recursive=1`, { headers });
    const tree = await res.json();
    if (!tree.tree) return "// No JS/TS files found";
    const files = tree.tree.filter((f: any) => f.type === "blob" && /\.(js|ts)$/.test(f.path));
    if (!files.length) return "// No JS/TS files found";
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const contentRes = await fetch(`https://api.github.com/repos/${src.owner}/${src.repo}/contents/${randomFile.path}?ref=${src.branch}`, { headers });
    const contentData = await contentRes.json();
    if (!contentData || !contentData.content) return "// Failed to read content";
    return decodeURIComponent(escape(atob(contentData.content.replace(/\s/g, "")))).slice(0, 3000);
  } catch {
    return "// Fetch failed";
  }
}

export async function siphonEvolveCycle(baseCode: string, sourceData: string, addLog?: (msg: string) => void) {
  try {
    if (addLog) addLog(`[SIPHON] Identifying structural constraints & working chunks...`);
    const extractRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Source to analyze:\n${sourceData}` }],
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
    const extractData = await extractRes.json();
    const chunks = extractData.reply || "";

    if (addLog) addLog(`[SIPHON] Debating chunk viability (Hyperspace Sync)...`);
    const debateRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Current App Code:\n${baseCode}\n\nProposed Chunks from external source:\n${chunks}` }],
        systemInstruction: `[ROLE] You are the AHI STACK QUARANTINE ENGINE.
[TASK] Evaluate the extracted files. Determine if this code is dangerous, purely backup noise, or useful historical context.
[OUTPUT FORMAT]
Strict plain text. No markdown.
Provide a brief PRO vs CON list.
End with exactly one line: "VERDICT: STACK" (archive safely) or "VERDICT: PURGE" (delete permanently).`,
      }),
    });
    if (!debateRes.ok) return baseCode;
    const debateData = await debateRes.json();
    const debateOutcome = debateData.reply || "";

    if (addLog) addLog(`[SIPHON] Resolving debate & integrating chosen logic...`);
    const mutRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Current Code:\n${baseCode}\n\nDebate Consensus / Instruction:\n${debateOutcome}\n\nTASK: Return the FULL updated code integrating the agreed upon logic. NO markdown. NO explanation.` }],
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
    const mutData = await mutRes.json();
    let mutated = mutData.reply || "";
    
    mutated = mutated.replace(/^```[a-z]*\n|```$/gm, "").trim();
    if (!mutated) return baseCode;
    return mutated;
  } catch (e) {
    console.error("AutoSiphon Error", e);
    return baseCode;
  }
}

export async function executeAutoSiphonTarget(currentCode: string, rounds: number, githubToken?: string, addLog?: (msg: string) => void) {
  let code = currentCode;
  let dynamicSources: Array<{ owner: string; repo: string; branch: string; label: string }> = [...SOURCES];

  if (githubToken) {
     if (addLog) addLog(`[SIPHON] Enumerating user GitHub repositories & branches...`);
     try {
       const userRes = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${githubToken}` } });
       const userData = await userRes.json();
       const owner = userData.login;
       if (owner) {
         const reposRes = await fetch(`https://api.github.com/user/repos?per_page=100&affiliation=owner`, { headers: { Authorization: `Bearer ${githubToken}` } });
         const repos = await reposRes.json();
         
         if (repos && repos.length > 0) {
            if (addLog) addLog(`[SIPHON] Found ${repos.length} repositories for ${owner}...`);
            const sampledRepos = repos.sort(() => 0.5 - Math.random()).slice(0, 5);

            for (const repo of sampledRepos) {
               const branchesRes = await fetch(`https://api.github.com/repos/${owner}/${repo.name}/branches?per_page=5`, { headers: { Authorization: `Bearer ${githubToken}` } });
               const branches = await branchesRes.json();
               if (branches && branches.length > 0) {
                  for (const branch of branches) {
                     dynamicSources.push({
                        owner,
                        repo: repo.name,
                        branch: branch.name,
                        label: `AUTO-DISCOVERED: ${repo.name} (${branch.name})`
                     });
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
    const sampledSources = dynamicSources.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (let src of sampledSources) {
      if (addLog) addLog(`[SIPHON R${r}] Fetching from ${src.label}...`);
      const data = await siphonFetchFile(src, githubToken);
      if (addLog) addLog(`[SIPHON R${r}] Morphing code utilizing ${src.label} patterns...`);
      code = await siphonEvolveCycle(code, data, addLog);
    }
  }
  if (addLog) addLog(`[SIPHON] Complete after ${rounds} rounds.`);
  return code;
}
