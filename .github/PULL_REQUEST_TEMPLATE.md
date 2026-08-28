<!--
# ARCHITECTURAL HEADER: ENTERPRISE PULL REQUEST TEMPLATE (EVOLVED)
# Engine: EMG Core v49 Neural Code and Documentation Optimizer Engine
# Role: Enforces strict quality gates, architectural compliance, and automated verification.
# Integration: Aligns PR submissions with the Zero-Leak Sandbox, Dynamic Consensus Weighting (DCW), and Diagnostic Engine.
# Version: 2.1.2-DIAGNOSTIC-ENFORCED
-->

## ⚡ Executive Summary

| Attribute | Summary Details |
| :--- | :--- |
| **PR Classification** | `[ Fix | Feature | Breaking | Sandbox | Telemetry ]` |
| **Affected Subsystems** | `[ Subsystem / Module Names ]` |
| **Related Issues** | Fixes #<!-- Insert issue number --> |
| **Compliance Status** | `[ ] Zero-Leak Sandbox` \| `[ ] DCW Verified` \| `[ ] Diagnostic Registered` |

---

## 📑 Table of Contents
- [1. Description \& Context](#1-description--context)
- [2. Type of Change](#2-type-of-change)
- [3. Architectural Compliance Checklist](#3-architectural-compliance-checklist)
  - [3.1 Zero-Leak Sandbox Compliance](#31-zero-leak-sandbox-compliance)
  - [3.2 Dynamic Consensus Weighting (DCW)](#32-dynamic-consensus-weighting-dcw)
  - [3.3 Diagnostic Engine Integration](#33-diagnostic-engine-integration)
- [4. Verification \& Testing](#4-verification--testing)
  - [4.1 Automated Quality Checks](#41-automated-quality-checks)
  - [4.2 Diagnostic Telemetry Output](#42-diagnostic-telemetry-output)

---

## 1. Description & Context

> **Overview:** Provide a concise overview of proposed code mutations, core architecture integration, and affected modules.

### Scope Breakdown
- **Mutation Overview:** 
- **Architectural Integration:** 
- **Affected Modules:** 

**Related Issue(s):** Fixes #<!-- Insert issue number -->

---

## 2. Type of Change

*Select all applicable classifications:*

- [ ] **CRITICAL BUG FIX:** Non-breaking change fixing a system-level regression.
- [ ] **EVOLUTIONARY FEATURE:** Non-breaking change adding high-value functionality.
- [ ] **ARCHITECTURAL BREAK:** Fix or feature altering core system interfaces (requires Lead Architect approval).
- [ ] **SANDBOXED MODULE:** New isolated module introduced under `modules/`.
- [ ] **TELEMETRY/DIAGNOSTIC:** Enhancements to system visibility, health metrics, or diagnostics.

---

## 3. Architectural Compliance Checklist

> ⚠️ Submissions failing any of these checks will be automatically rejected by the CI Gatekeeper.

### 3.1 Zero-Leak Sandbox Compliance
- [ ] **Isolation:** Changes do not introduce global state mutations or unhandled memory allocations.
- [ ] **Teardown:** All event listeners, stream subscriptions, and timers are explicitly registered for cleanup.
- [ ] **Memory Management:** Cache layers utilize `WeakMap` or `WeakSet` primitives to allow non-blocking garbage collection.
- [ ] **Telemetry:** Verified memory usage stability using the `DiagnosticEngine`.

### 3.2 Dynamic Consensus Weighting (DCW)
- [ ] **Logic Mutation:** This PR modifies agent decision-making algorithms or consensus logic.
  > *If checked, detail the weight calculation algorithm and validation strategy below:*
  ```text
  [Provide weight calculation algorithm details and validation methodology]
  ```
- [ ] **Liveness:** Verified that agent weight mutations do not induce consensus deadlocks, livelocks, or resource starvation.

### 3.3 Diagnostic Engine Integration
- [ ] **Registry:** New modules and components are registered in `diagnostic_registry.py` (or language-equivalent registry).
- [ ] **Interface:** Implemented the `DiagnosticResult` interface across all newly exported functions.
- [ ] **Local Validation:** Executed the local diagnostic suite (`npm run diag` or `python diagnostic_engine.py`).

---

## 4. Verification & Testing

### 4.1 Automated Quality Checks
- [ ] **Linting & Formatting:** Code strictly adheres to repository standards (`npm run lint` / `ruff check`).
- [ ] **Unit Tests:** Included comprehensive tests proving feature correctness and edge-case handling.
- [ ] **Integration:** All unit and integration tests pass locally (`npm run test` / `pytest`).

### 4.2 Diagnostic Telemetry Output

> ℹ️ Paste console output from `run_system_diagnostics()`. *Submissions returning a `CRITICAL_FAILURE` status will not be accepted for review.*

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