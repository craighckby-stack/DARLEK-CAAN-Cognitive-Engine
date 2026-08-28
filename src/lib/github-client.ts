/**
 * @file src/lib/github-client.ts
 * @version v49.0.0-EMG-SOVEREIGN
 * @description Optimized, type-safe, and memory-efficient GitHub API client.
 */

export interface GitHubRequestOptions extends RequestInit {
  headers?: Record<string, string> | Headers;
}

export interface GitHubClientInterface {
  request(token: string, url: string, options?: GitHubRequestOptions): Promise<Response>;
}

export const GitHubClient: GitHubClientInterface = {
  async request(token: string, url: string, options: GitHubRequestOptions = {}): Promise<Response> {
    if (!token) {
      throw new TypeError('EMG-CORE-ERR: Authentication token is required for GitHubClient requests.');
    }
    if (!url) {
      throw new TypeError('EMG-CORE-ERR: Target URL path is required for GitHubClient requests.');
    }

    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const endpoint = `https://api.github.com/${cleanUrl}`;

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/vnd.github.v3+json');

    const mergedOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      return await fetch(endpoint, mergedOptions);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`[EMG-CORE] GitHubClient network failure for endpoint "${endpoint}": ${errorMessage}`);
    }
  },
};