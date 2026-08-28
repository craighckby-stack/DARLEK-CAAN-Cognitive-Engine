import { runAstDiffGate, AstDiffResult } from './ast-diff-gate';
import { validateStructuralSanity, StructuralSanityResult } from './structural-sanity-guard';

/**
 * Represents a generic repository or code file structure.
 */
export interface CodeFile {
  path: string;
  content: string;
  [key: string]: unknown;
}

/**
 * Worker Pool Pattern Implementation
 * Manages concurrent background tasks to prevent event loop blockages
 * during heavy AST/complexity analysis.
 */
export class MainWorkerPool {
  private readonly concurrencyLimit: number;
  private activeCount = 0;
  private readonly queue: Array<() => Promise<void>> = [];

  constructor(concurrencyLimit = 4) {
    this.concurrencyLimit = Math.max(1, Math.floor(concurrencyLimit));
  }

  /**
   * Enqueues a task and returns a promise that resolves with the result.
   */
  private async enqueue<T>(taskFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedTask = async (): Promise<void> => {
        try {
          // Yield to event loop using setImmediate if available for optimal micro-task interleaving
          if (typeof setImmediate === 'function') {
            await new Promise<void>((r) => setImmediate(r));
          } else {
            await new Promise<void>((r) => setTimeout(r, 0));
          }
          const result = await taskFn();
          resolve(result);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        } finally {
          this.activeCount--;
          this.processNext();
        }
      };

      this.queue.push(wrappedTask);
      this.processNext();
    });
  }

  private processNext(): void {
    while (this.activeCount < this.concurrencyLimit && this.queue.length > 0) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        this.activeCount++;
        void nextTask();
      }
    }
  }

  /**
   * Offloads AST Diff Gate analysis to the worker pool.
   */
  public async analyzeAstDiff(
    originalCode: string,
    proposedCode: string,
    filePath: string
  ): Promise<AstDiffResult> {
    return this.enqueue(async () => {
      return runAstDiffGate(originalCode, proposedCode, filePath);
    });
  }

  /**
   * Offloads Structural Sanity Validation to the worker pool.
   */
  public async validateSanity(
    originalCode: string,
    proposedCode: string,
    filePath: string,
    repoFiles: CodeFile[],
    newFiles: CodeFile[]
  ): Promise<StructuralSanityResult> {
    return this.enqueue(async () => {
      return validateStructuralSanity(originalCode, proposedCode, filePath, repoFiles, newFiles);
    });
  }
}

// Export singleton instance
export const mainWorker = new MainWorkerPool();