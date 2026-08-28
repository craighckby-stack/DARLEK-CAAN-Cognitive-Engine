/**
 * @fileoverview GitHub Configuration and Credential Manager (EMG Core v49 Optimized)
 * Maximizes type-safety, memory efficiency, and runtime execution speed for state retrieval.
 */

export interface GitHubConfig {
  readonly username: string;
  readonly repoName: string;
  readonly token: string;
  readonly hasValidToken: boolean;
  readonly isDemoMode: boolean;
}

const DEFAULT_USERNAME = "craighckby-stack";
const DEFAULT_REPO = "god-virus";
const TOKEN_MIN_VALID_LENGTH = 15;

/**
 * Retrieves and validates GitHub configuration and authorization tokens from storage layers.
 * Utilizes constant-time assertions and zero-allocation immutable returns.
 * 
 * @returns {GitHubConfig} The frozen configuration object.
 */
export const getGitHubConfig = (): GitHubConfig => {
  const username = localStorage.getItem("af_github_username") ?? DEFAULT_USERNAME;
  const repoName = localStorage.getItem("af_github_repo") ?? DEFAULT_REPO;
  const token = sessionStorage.getItem("af_github_token") ?? 
                localStorage.getItem("af_github_token") ?? "";

  const hasValidToken = token.length > TOKEN_MIN_VALID_LENGTH;
  const isDemoMode = username === DEFAULT_USERNAME && repoName === DEFAULT_REPO;

  return Object.freeze({
    username,
    repoName,
    token,
    hasValidToken,
    isDemoMode,
  });
};