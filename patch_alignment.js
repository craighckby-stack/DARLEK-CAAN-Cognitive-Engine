const fs = require('fs');
let code = fs.readFileSync('src/utils/agi-engine.ts', 'utf8');

code = code.replace(/public overseer = new OverseerQueue\(\);/g, "public overseer = new OverseerQueue();\n  public edgeGovernance = new EdgeGovernanceGatekeeper();");

code = code.replace(/this\.totalChecks\+\+;/g, "this.totalChecks++;\n\n    // Layer 0: Edge Governance AST & Memory Gatekeeper\n    if (!this.edgeGovernance.validateAST(name) || !this.edgeGovernance.enforceMemoryLimit(name.length)) {\n      this.blockedCount++;\n      return {\n        allowed: false,\n        severity: 1.0,\n        explanation: { humanReadable: `L0 Edge Governance Blocked: Prototype-climbing / Memory limit exceeded.` }\n      };\n    }");

fs.writeFileSync('src/utils/agi-engine.ts', code);
