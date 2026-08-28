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

export const DEFAULT_HEADERS = (token: string): GitHubHeaders => {
  if (!token || typeof token !== 'string') {
    throw new TypeError('A valid string token is required to construct GitHub API headers.');
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
};