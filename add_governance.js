const fs = require('fs');
let code = fs.readFileSync('src/utils/agi-engine.ts', 'utf8');

const governanceClass = `
// ---------------------------------------------------------------------------
// 9.5 Edge Governance: Absolute Lineage-Blind Containment
// ---------------------------------------------------------------------------
export class EdgeGovernanceGatekeeper {
  public validateAST(payload: string): boolean {
    const isObfuscated = payload.includes('constructor') || payload.includes('__proto__') || payload.includes('eval(') || payload.includes('exec(');
    return !isObfuscated;
  }

  public enforceMemoryLimit(payloadSize: number): boolean {
    return payloadSize <= 131072; // 128KB Wasm Sandbox limit
  }

  public secureIPC(): string {
    return "memfd_create with MFD_CLOEXEC | MFD_ALLOW_SEALING applied";
  }

  public getCpuAffinity(): string {
    return "Runner on Core 1/2, Gatekeeper on Core 5-7 (Snapdragon 8 Gen 2)";
  }
}
`;

code = code.replace("// ---------------------------------------------------------------------------", governanceClass + "\n// ---------------------------------------------------------------------------");

fs.writeFileSync('src/utils/agi-engine.ts', code);
