/**
 * File Path: "src/middleware/SecurityMiddleware.ts"
 * EMG Core v49 Neural Code and Documentation Optimizer Engine
 * Sovereign Overhaul: Performance, Type-Safety, Memory Efficiency, and Error Resilience.
 */

/**
 * SecurityMiddleware: Enforces OMEGA ARCHITECTURE SECURITY PROTOCOL
 * Prevents volatile state leakage into the repository.
 */
export class SecurityMiddleware {
  private static readonly FORBIDDEN_EXTENSIONS: readonly string[] = Object.freeze([
    '.consciousness.dump',
    '.quantum.data'
  ]);

  /**
   * Validates staged files against OMEGA ARCHITECTURE SECURITY PROTOCOL.
   * Maximizes performance and memory efficiency via pre-compiled checks and optimized iteration.
   * 
   * @param stagedFiles Readonly array of file paths to validate.
   * @returns boolean indicating if the commit passes security constraints.
   */
  public static validateCommit(stagedFiles: readonly string[]): boolean {
    if (!Array.isArray(stagedFiles) || stagedFiles.length === 0) {
      return true;
    }

    const extensions = SecurityMiddleware.FORBIDDEN_EXTENSIONS;
    const violations: string[] = [];

    for (let i = 0, len = stagedFiles.length; i < len; i++) {
      const file = stagedFiles[i];
      if (typeof file !== 'string') {
        continue;
      }

      for (let j = 0, extLen = extensions.length; j < extLen; j++) {
        if (file.endsWith(extensions[j])) {
          violations.push(file);
          break;
        }
      }
    }

    if (violations.length > 0) {
      // Maintained error format and signature contract
      console.error('SECURITY_VIOLATION_CODE_0x00: Forbidden files detected:', violations);
      return false;
    }

    return true;
  }
}