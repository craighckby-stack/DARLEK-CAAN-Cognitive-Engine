# OMEGA ARCHITECTURE SECURITY PROTOCOL

## Overview
This protocol defines the boundary between the mutable, self-improving agent core and the immutable, version-controlled repository within the Omega Architecture.

## Governance Rules

### 1. No State Persistence
Any file ending in `.consciousness.dump` or `.quantum.data` must **NEVER** be committed to the repository. These files contain volatile agent states and runtime memory constructs.

### 2. Secret Rotation & Management
All `.vault` and `.key` files are managed exclusively by the `sovereign-kernel` and must remain strictly local to the execution runtime environment.

### 3. Evolution History Protection
`.evolution.history` files are designated for local diagnostic analysis only. They capture the internal decision-making processes and "thought traces" of the agent, and are classified as sensitive intellectual property.

## Integration & Enforcement
This security manifest is actively enforced by the `DARLEK CANN v3.0` evolution engine to ensure that automated self-refactoring loops do not compromise or pollute the global repository state.

```yaml
# Enforced Exclusion Pattern Example
exclusion_rules:
  - "*.consciousness.dump"
  - "*.quantum.data"
  - "*.vault"
  - "*.key"
  - "*.evolution.history"
```