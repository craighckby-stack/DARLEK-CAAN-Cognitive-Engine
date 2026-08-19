import { runAstDiffGate, AstDiffResult } from './ast-diff-gate';
import { validateStructuralSanity, StructuralSanityResult } from './structural-sanity-guard';

/**
 * Worker Pool Pattern Implementation
 * Manages concurrent background tasks to prevent event loop blockages
 * during heavy AST/complexity analysis.
 */
export class MainWorkerPool {
  private concurrencyLimit: number;
  private activeCount: number = 0;
  private queue: Array<() => Promise<void>> = [];

  constructor(concurrencyLimit: number = 4) {
    this.concurrencyLimit = Math.max(1, concurrencyLimit);
  }

  /**
   * Enqueues a task and returns a promise that resolves with the result.
   */
  private async enqueue<T>(taskFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          // Yield to event loop before starting heavy work
          await new Promise((r) => setTimeout(r, 0));
          const result = await taskFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeCount--;
          this.processNext();
        }
      };

      this.queue.push(wrappedTask);
      this.processNext();
    });
  }

  private processNext() {
    if (this.activeCount < this.concurrencyLimit && this.queue.length > 0) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        this.activeCount++;
        nextTask();
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
      // The actual synchronous heavy lifting is performed here,
      // but managed by the concurrency queue to prevent overwhelming the server.
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
    repoFiles: any[],
    newFiles: any[]
  ): Promise<StructuralSanityResult> {
    return this.enqueue(async () => {
      return validateStructuralSanity(originalCode, proposedCode, filePath, repoFiles, newFiles);
    });
  }
}

// Export singleton instance
export const mainWorker = new MainWorkerPool();
