/**
 * @file src/types/repository.ts
 * @module RepositoryTypes
 * @description Comprehensive type definitions for repository metadata and responses with strict runtime and compile-time safeguards.
 */

/**
 * Represents immutable metadata for a software repository.
 * Optimized with readonly modifiers to prevent accidental state mutation and enforce memory efficiency.
 */
export interface RepositoryMetadata {
  readonly id: number;
  readonly name: string;
  readonly fullName: string;
  readonly owner: string;
  readonly defaultBranch: string;
  readonly url: string;
  readonly description: string;
  readonly language: string;
  readonly lastUpdated: string;
}

/**
 * Represents a strongly typed API response wrapper for repository queries.
 * Incorporates strict immutability and precise typing for safe data consumption.
 */
export interface RepoResponse {
  readonly success: boolean;
  readonly count: number;
  readonly repos: readonly RepositoryMetadata[];
}