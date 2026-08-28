<!--
# ARCHITECTURAL HEADER: ENTERPRISE PULL REQUEST TEMPLATE (EVOLVED)
# Engine: EMG Core v49 Neural Code and Documentation Optimizer
# Role: Enforces strict quality gates, architectural compliance, and automated verification.
# Integration: Aligns PR submissions with the Zero-Leak Sandbox, Dynamic Consensus Weighting (DCW), and Diagnostic Engine.
# Version: 2.1.0-DIAGNOSTIC-ENFORCED
-->

## 🧩 Description & Context

Provide a comprehensive overview of the proposed code mutation. Detail how this change integrates into the core system architecture and enumerate all affected modules.

**Related Issue(s):** Fixes #<!-- insert issue number -->

---

## 🛡️ Architectural Compliance Checklist

This repository enforces strict architectural guarantees. Submissions failing any of these checks will be automatically rejected by the CI Gatekeeper.

### 1. Zero-Leak Sandbox Compliance
- [ ] **Isolation:** Changes do not introduce global state mutations or unhandled memory allocations.
- [ ] **Teardown:** All event listeners, stream subscriptions, and timers are explicitly registered for cleanup.
- [ ] **Memory Management:** Cache layers utilize `WeakMap` or `WeakSet` primitives to allow non-blocking garbage collection.
- [ ] **Telemetry:** Verified memory usage stability using the `DiagnosticEngine`.

### 2. Dynamic Consensus Weighting (DCW)
- [ ] **Logic Mutation:** This PR modifies agent decision-making algorithms or consensus logic.
  > *If checked, detail the weight calculation algorithm and validation strategy below:*
  ```text
  [Provide weight calculation algorithm details and validation methodology]
  ```
- [ ] **Liveness:** Verified that agent weight mutations do not induce consensus deadlocks, livelocks, or resource starvation.

### 3. Diagnostic Engine Integration
- [ ] **Registry:** New modules and components are registered in `diagnostic_registry.py` (or language-equivalent registry).
- [ ] **Interface:** Implemented the `DiagnosticResult` interface across all newly exported functions.
- [ ] **Local Validation:** Executed the local diagnostic suite (`npm run diag` or `python diagnostic_engine.py`).

---

## 🛠️ Type of Change

Select all applicable classifications:

- [ ] **CRITICAL BUG FIX:** Non-breaking change fixing a system-level regression.
- [ ] **EVOLUTIONARY FEATURE:** Non-breaking change adding high-value functionality.
- [ ] **ARCHITECTURAL BREAK:** Fix or feature altering core system interfaces (requires Lead Architect approval).
- [ ] **SANDBOXED MODULE:** New isolated module introduced under `modules/`.
- [ ] **TELEMETRY/DIAGNOSTIC:** Enhancements to system visibility, health metrics, or diagnostics.

---

## 🧪 Verification & Testing

### Automated Quality Checks
- [ ] **Linting & Formatting:** Code strictly adheres to repository standards (`npm run lint` / `ruff check`).
- [ ] **Unit Tests:** Included comprehensive tests proving feature correctness and edge-case handling.
- [ ] **Integration:** All unit and integration tests pass locally (`npm run test` / `pytest`).

### 📊 Diagnostic Telemetry Output

Paste the console output from the `run_system_diagnostics()` execution below.  
*Note: Submissions returning a `CRITICAL_FAILURE` status will not be accepted for review.*

```json
{
  "status": "PASS",
  "timestamp": "<YYYY-MM-DDTHH:MM:SSZ>",
  "diagnostic_results": {
    "sandbox_leak_check": "PASSED",
    "dcw_liveness_check": "PASSED"
  },
  "raw_output": "[Paste diagnostic engine output here]"
}
```