export const GITHUB_API_BASE = 'https://api.github.com' as const;

export interface DeploymentResult {
  readonly file: string;
  readonly success: boolean;
  readonly error?: string;
}

export type GitHubToken = string & { readonly __brand: unique symbol };

export interface GitHubHeaders extends Readonly<Record<string, string>> {
  readonly Authorization: string;
  readonly Accept: 'application/vnd.github.v3+json';
  readonly 'Content-Type': 'application/json';
}

const HEADER_CACHE = new Map<string, GitHubHeaders>();

export const DEFAULT_HEADERS = (token: string): GitHubHeaders => {
  if (typeof token !== 'string' || token.trim() === '') {
    throw new TypeError('A valid, non-empty string token is required to construct GitHub API headers.');
  }

  const cached = HEADER_CACHE.get(token);
  if (cached) {
    return cached;
  }

  const headers: GitHubHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  Object.freeze(headers);
  HEADER_CACHE.set(token, headers);

  return headers;
};