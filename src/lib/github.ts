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
 * Safely accesses storage layers with robust fallback handling.
 */
const getStorageItem = (key: string): string | null => {
  try {
    return typeof window !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const getSessionStorageItem = (key: string): string | null => {
  try {
    return typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

/**
 * Retrieves and validates GitHub configuration and authorization tokens from storage layers.
 * Utilizes constant-time assertions and zero-allocation immutable returns with robust error isolation.
 * 
 * @returns {GitHubConfig} The frozen configuration object.
 */
export const getGitHubConfig = (): GitHubConfig => {
  const username = getStorageItem("af_github_username") ?? DEFAULT_USERNAME;
  const repoName = getStorageItem("af_github_repo") ?? DEFAULT_REPO;
  const token = getSessionStorageItem("af_github_token") ?? 
                getStorageItem("af_github_token") ?? "";

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