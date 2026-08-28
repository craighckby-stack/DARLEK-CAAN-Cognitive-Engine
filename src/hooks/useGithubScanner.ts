import { useState, useRef, useCallback, useEffect } from 'react';
import { sanitizeContent, Finding, isSkippableFile } from '@/lib/scanner';

export interface ScanResult {
  file: string;
  findings: Finding[];
  content?: string;
  sanitized?: string;
}

interface GitHubTreeItem {
  path: string;
  type: string;
  sha?: string;
  size?: number;
  url: string;
}

interface GitHubBlobResponse {
  content?: string;
  encoding?: string;
}

// Safe base64 decoding supporting newlines and multi-byte UTF-8
function safeBase64Decode(base64Str: string): string {
  try {
    const clean = base64Str.replace(/\s+/g, '');
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    try {
      return atob(base64Str.replace(/\s+/g, ''));
    } catch {
      return '';
    }
  }
}

export function useGithubScanner() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const abortController = useRef<AbortController | null>(null);

  // Stats
  const [filesScanned, setFilesScanned] = useState(0);
  const [filesSkipped, setFilesSkipped] = useState(0);
  const [scanDuration, setScanDuration] = useState(0);
  const startTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Live timer effect during scan
  useEffect(() => {
    if (isScanning) {
      timerRef.current = setInterval(() => {
        if (startTime.current > 0) {
          setScanDuration(Math.floor((Date.now() - startTime.current) / 1000));
        }
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isScanning]);

  const startScan = useCallback(async (token?: string, owner?: string, repo?: string, branch: string = 'main') => {
    setIsScanning(true);
    setResults([]);
    setProgress(0);
    setFilesScanned(0);
    setFilesSkipped(0);
    setScanDuration(0);
    setStatusMessage('Connecting to GitHub API...');
    startTime.current = Date.now();
    
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    try {
      let cleanToken = (token || '').trim();
      let cleanOwner = (owner || '').trim();
      let cleanRepo = (repo || '').trim();
      const initialBranch = (branch || '').trim();

      // Normalize owner & repo if full URL or owner/repo format was provided
      if (cleanOwner.includes('github.com/')) {
        const parts = cleanOwner.replace(/^https?:\/\/github\.com\//i, '').split('/');
        cleanOwner = parts[0] || cleanOwner;
        if (parts[1] && !cleanRepo) cleanRepo = parts[1].replace(/\.git$/i, '');
      } else if (cleanOwner.includes('/')) {
        const parts = cleanOwner.split('/');
        cleanOwner = parts[0];
        if (parts[1] && !cleanRepo) cleanRepo = parts[1];
      }

      if (cleanRepo.includes('github.com/')) {
        const parts = cleanRepo.replace(/^https?:\/\/github\.com\//i, '').split('/');
        if (parts[0] && !cleanOwner) cleanOwner = parts[0];
        if (parts[1]) cleanRepo = parts[1].replace(/\.git$/i, '');
      } else if (cleanRepo.includes('/')) {
        const parts = cleanRepo.split('/');
        if (!cleanOwner) cleanOwner = parts[0];
        if (parts[1]) cleanRepo = parts[1];
      }
      cleanRepo = cleanRepo.replace(/\.git$/i, '');

      if (!cleanOwner || !cleanRepo) {
        throw new Error('Please specify both a valid Repository Owner/Organization and Repository Name.');
      }

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json'
      };
      if (cleanToken) {
        headers.Authorization = `Bearer ${cleanToken}`;
      }
    
      // 1. Resolve commit and tree SHA across candidate branches & repo default branch
      setCurrentFile('Resolving repository branch and commit tree...');

      let commitSha = '';
      let treeSha = '';
      let effectiveBranch = initialBranch || 'main';

      // Candidate list of branch names to check
      const candidates = [
        initialBranch,
        'main',
        'master',
        'develop',
        'trunk',
        'HEAD'
      ].filter((b, idx, arr) => Boolean(b) && arr.indexOf(b) === idx);

      let lastErrorStatus: number | null = null;
      let lastErrorMessage = '';

      // Strategy 1: Check candidate commits directly via /repos/{owner}/{repo}/commits/{ref}
      for (const candidate of candidates) {
        if (signal.aborted) return;
        try {
          const commitRes = await fetch(
            `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${encodeURIComponent(candidate)}`,
            { headers, signal }
          );
          if (commitRes.ok) {
            const commitData = await commitRes.json();
            commitSha = commitData.sha;
            treeSha = commitData.commit?.tree?.sha || commitData.sha;
            effectiveBranch = candidate;
            break;
          } else {
            lastErrorStatus = commitRes.status;
            const errBody = await commitRes.text();
            lastErrorMessage = errBody;
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') throw err;
        }
      }

      // Strategy 2: If candidate commits failed, query repository root metadata for default_branch
      if (!commitSha || !treeSha) {
        try {
          const repoMetaRes = await fetch(
            `https://api.github.com/repos/${cleanOwner}/${cleanRepo}`,
            { headers, signal }
          );
          if (repoMetaRes.ok) {
            const repoData = await repoMetaRes.json();
            const defaultBranch = repoData.default_branch;
            if (defaultBranch) {
              const defCommitRes = await fetch(
                `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${encodeURIComponent(defaultBranch)}`,
                { headers, signal }
              );
              if (defCommitRes.ok) {
                const commitData = await defCommitRes.json();
                commitSha = commitData.sha;
                treeSha = commitData.commit?.tree?.sha || commitData.sha;
                effectiveBranch = defaultBranch;
              }
            }
          } else {
            lastErrorStatus = repoMetaRes.status;
            const errBody = await repoMetaRes.text();
            lastErrorMessage = errBody;
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') throw err;
        }
      }

      // Strategy 3: Try branch references via /repos/{owner}/{repo}/branches
      if (!commitSha || !treeSha) {
        try {
          const branchesListRes = await fetch(
            `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/branches?per_page=10`,
            { headers, signal }
          );
          if (branchesListRes.ok) {
            const branchesList = await branchesListRes.json();
            if (Array.isArray(branchesList) && branchesList.length > 0) {
              const firstBranch = branchesList[0];
              effectiveBranch = firstBranch.name;
              commitSha = firstBranch.commit?.sha;
              if (commitSha) {
                // Fetch commit to get tree SHA
                const cRes = await fetch(
                  `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${encodeURIComponent(commitSha)}`,
                  { headers, signal }
                );
                if (cRes.ok) {
                  const cData = await cRes.json();
                  treeSha = cData.commit?.tree?.sha || commitSha;
                }
              }
            }
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') throw err;
        }
      }

      // Strategy 4: Fallback unauthenticated check for public repos if token was rejected
      if ((!commitSha || !treeSha) && cleanToken && (lastErrorStatus === 404 || lastErrorStatus === 401 || lastErrorStatus === 403)) {
        try {
          const unauthRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, {
            headers: { Accept: 'application/vnd.github.v3+json' },
            signal
          });
          if (unauthRes.ok) {
            const uData = await unauthRes.json();
            const defBranch = uData.default_branch || 'main';
            const uCommitRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/commits/${encodeURIComponent(defBranch)}`, {
              headers: { Accept: 'application/vnd.github.v3+json' },
              signal
            });
            if (uCommitRes.ok) {
              const ucData = await uCommitRes.json();
              commitSha = ucData.sha;
              treeSha = ucData.commit?.tree?.sha || ucData.sha;
              effectiveBranch = defBranch;
              // Clear Authorization header since token was rejected but public repo access works
              delete headers.Authorization;
            }
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') throw err;
        }
      }

      if (!commitSha || !treeSha) {
        if (lastErrorStatus === 404) {
          throw new Error(
            `Repository '${cleanOwner}/${cleanRepo}' not found (404). Check the repository name or verify your GitHub Token has 'repo' permissions for private repositories.`
          );
        }
        if (lastErrorStatus === 401 || lastErrorStatus === 403) {
          throw new Error(
            `GitHub authentication failed (${lastErrorStatus}) for '${cleanOwner}/${cleanRepo}'. Verify your GitHub Personal Access Token.`
          );
        }
        throw new Error(
          `Could not resolve branch '${initialBranch || 'main'}' in repository '${cleanOwner}/${cleanRepo}'. ${lastErrorMessage || ''}`
        );
      }

      // 2. Fetch repository file tree
      setCurrentFile(`Loading complete repository file tree (${effectiveBranch})...`);
      let treeRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees/${treeSha}?recursive=1`,
        { headers, signal }
      );
      if (!treeRes.ok && commitSha !== treeSha) {
        treeRes = await fetch(
          `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees/${commitSha}?recursive=1`,
          { headers, signal }
        );
      }

      if (!treeRes.ok) {
        const errText = await treeRes.text();
        throw new Error(`Tree fetch failed (${treeRes.status}): ${errText}`);
      }
      const treeData = await treeRes.json();

      if (!treeData.tree || !Array.isArray(treeData.tree)) {
        throw new Error('Invalid repository tree returned from GitHub.');
      }

      // Filter tree using comprehensive exclusion rules
      let skippedCount = 0;
      const scanQueue: GitHubTreeItem[] = treeData.tree.filter((item: GitHubTreeItem) => {
        if (item.type !== 'blob') return false;
        if (isSkippableFile(item.path)) {
          skippedCount++;
          return false;
        }
        return true;
      });

      setFilesSkipped(skippedCount);

      if (scanQueue.length === 0) {
        setStatusMessage('No scannable code files found in repository.');
        setIsScanning(false);
        return;
      }

      const CONCURRENCY = 4; // Safe concurrency to prevent triggering GitHub secondary rate limits
      const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB cap
      let completed = 0;
      const allFindings: ScanResult[] = [];

      // Process with cooperative event-loop yields
      for (let i = 0; i < scanQueue.length; i += CONCURRENCY) {
        if (signal.aborted) break;

        const batch = scanQueue.slice(i, i + CONCURRENCY);

        await Promise.all(batch.map(async (file: GitHubTreeItem) => {
          if (signal.aborted) return;
          try {
            setCurrentFile(file.path);

            if (file.size !== undefined && file.size > MAX_FILE_SIZE) {
              skippedCount++;
              setFilesSkipped(skippedCount);
              return;
            }

            const res = await fetch(file.url, { headers, signal });

            // Handle rate limit detection
            const remaining = res.headers.get('X-RateLimit-Remaining');
            const reset = res.headers.get('X-RateLimit-Reset');
            if (res.status === 403 || res.status === 429 || (remaining && parseInt(remaining, 10) < 3)) {
              if (reset) {
                const resetTime = parseInt(reset, 10) * 1000;
                const waitTime = Math.max(1000, resetTime - Date.now() + 1000);
                if (waitTime > 0 && waitTime < 120000) {
                  setStatusMessage(`Rate limit protection: pausing for ${Math.round(waitTime / 1000)}s...`);
                  await new Promise(r => setTimeout(r, waitTime));
                  setStatusMessage('');
                }
              }
            }

            if (!res.ok) return;

            const data: GitHubBlobResponse = await res.json();
            if (data.content && data.encoding === 'base64') {
              const decoded = safeBase64Decode(data.content);
              if (decoded) {
                const { sanitized, findings } = sanitizeContent(decoded);
                if (findings.length > 0) {
                  allFindings.push({
                    file: file.path,
                    findings,
                    content: decoded,
                    sanitized
                  });
                }
              }
            }
          } catch (e: unknown) {
            if (e instanceof Error && e.name !== 'AbortError') {
              console.warn(`File scan skipped for ${file.path}:`, e.message);
            }
          } finally {
            completed++;
            setProgress(Math.round((completed / scanQueue.length) * 100));
            setFilesScanned(completed);
          }
        }));

        // Flush findings update to state
        setResults([...allFindings]);

        // Non-blocking yield to browser event loop to guarantee screen never freezes
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      setScanDuration(Math.floor((Date.now() - startTime.current) / 1000));
      setIsScanning(false);
      setCurrentFile('');
      setStatusMessage(allFindings.length === 0 ? 'Scan completed. No sensitive secrets or PII detected.' : `Scan complete: ${allFindings.length} files with findings.`);

    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('Scan error:', e);
        setStatusMessage(`Scan failed: ${e.message}`);
      }
      setIsScanning(false);
      setCurrentFile('');
    }
  }, []);

  const stopScan = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      setIsScanning(false);
      setCurrentFile('');
      setStatusMessage('Scan stopped by operator.');
      setScanDuration(Math.floor((Date.now() - startTime.current) / 1000));
    }
  }, []);

  return {
    results,
    isScanning,
    progress,
    currentFile,
    statusMessage,
    startScan,
    stopScan,
    filesScanned,
    filesSkipped,
    scanDuration
  };
}