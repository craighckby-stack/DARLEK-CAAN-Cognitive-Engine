export const GITHUB_API_BASE = 'https://api.github.com';
export const DEFAULT_HEADERS = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
});

export interface DeploymentResult {
  file: string;
  success: boolean;
  error?: string;
}