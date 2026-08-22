export const GitHubClient = { 
  async request(token: string, url: string, options: RequestInit = {}) {
    const customHeaders = options?.headers ? (options.headers as Record<string, string>) : {};
    return fetch(`https://api.github.com/${url}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...customHeaders,
      }
    });
  }
};