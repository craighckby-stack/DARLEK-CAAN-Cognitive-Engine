# OMEGA ARCHITECTURE SECURITY PROTOCOL

## Overview
This protocol defines the boundary between the mutable self-improving agent core and the immutable version-controlled repository.

## Governance Rules
1. **No State Persistence:** Any file ending in `.consciousness.dump` or `.quantum.data` must NEVER be committed. These contain volatile agent states.
2. **Secret Rotation:** All `.vault` and `.key` files are managed by the `sovereign-kernel` and must remain local to the runtime environment.
3. **Evolution History:** `.evolution.history` files are for local diagnostic analysis only. They contain the 'thought process' of the agent and are considered sensitive intellectual property.

## Integration
This manifest is enforced by the `DARLEK CANN v3.0` evolution engine to ensure that self-refactoring loops do not pollute the global repository state.









































