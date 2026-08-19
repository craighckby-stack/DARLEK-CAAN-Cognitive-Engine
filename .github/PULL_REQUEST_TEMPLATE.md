<!--
# ARCHITECTURAL HEADER: ENTERPRISE PULL REQUEST TEMPLATE (EVOLVED)
# Role: Enforces strict quality gates, architectural compliance, and automated verification.
# Integration: Aligns PR submissions with the Zero-Leak Sandbox, Dynamic Consensus Weighting, and Diagnostic Engine.
# Version: 2.1.0-DIAGNOSTIC-ENFORCED
-->

## 🧩 Description & Context
Provide a comprehensive overview of the mutation. Explain how this change integrates with the core system architecture and which specific modules are affected.

**Related Issue:** Fixes # (issue)

---

## 🛡️ Architectural Compliance Checklist
This repository enforces strict architectural guarantees. PRs failing these checks will be automatically rejected by the CI Gatekeeper.

### 1. Zero-Leak Sandbox Compliance
- [ ] **Isolation:** My changes do not introduce global state or memory leaks.
- [ ] **Teardown:** All event listeners, subscriptions, and timers are captured in cleanup effects/unsubscribes.
- [ ] **Memory Management:** Cache layers utilize `WeakMap` or `WeakSet` to allow proper garbage collection.
- [ ] **Telemetry:** I have verified memory usage stability using the `DiagnosticEngine`.

### 2. Dynamic Consensus Weighting (DCW)
- [ ] **Logic Mutation:** This PR modifies agent decision-making or consensus logic.
  - *If yes, explain the weight calculation algorithm and validation strategy:*
- [ ] **Liveness:** I have verified that agent weight mutations do not lead to consensus deadlock or starvation.

### 3. Diagnostic Engine Integration
- [ ] **Registry:** New modules/components have been registered in `diagnostic_registry.py` or equivalent.
- [ ] **Interface:** I have implemented the `DiagnosticResult` interface for all new exported functions.
- [ ] **Local Validation:** I have run the local diagnostic suite (`npm run diag` or `python diagnostic_engine.py`).

---

## 🛠️ Type of Change
- [ ] **CRITICAL BUG FIX:** Non-breaking change fixing a system-level regression.
- [ ] **EVOLUTIONARY FEATURE:** Non-breaking change adding high-value functionality.
- [ ] **ARCHITECTURAL BREAK:** Fix or feature that alters core interfaces (requires Lead Architect approval).
- [ ] **SANDBOXED MODULE:** New module added under `modules/` with strict isolation.
- [ ] **TELEMETRY/DIAGNOSTIC:** Improvements to system visibility and health monitoring.

---

## 🧪 Verification & Testing

### Automated Tests
- [ ] **Linting:** Code follows the style guidelines (`npm run lint` / `ruff check`).
- [ ] **Unit Tests:** Added tests proving the fix is effective or the feature works.
- [ ] **Integration:** All tests pass locally (`npm run test` / `pytest`).

### 📊 Diagnostic Telemetry Output
Paste the output of the `run_system_diagnostics()` execution below. **PRs with 'CRITICAL_FAILURE' status will not be reviewed.**
