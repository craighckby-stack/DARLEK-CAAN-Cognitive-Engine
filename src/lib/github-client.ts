export const GitHubClient = { 
  async request(token: string, url: string, options: RequestInit) {
    return fetch(`https://api.github.com/${url}`, {
      ...options,
      headers: { ...options.headers, 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
  }
};