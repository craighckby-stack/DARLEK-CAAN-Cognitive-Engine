# AI Studio Configuration & Governance

## Overview

This directory serves as the centralized control plane for the **DARLEK CANN v3.0** evolution engine. It governs environment-specific configurations, manages agent state persistence, and enforces strict security protocols across the repository.

---

## Architectural Blueprints

- **State Management**: Agent memory dumps are isolated within `*.memory.json` files to prevent state corruption during Continuous Integration and Continuous Deployment (CI/CD) pipelines.
- **Security & Compliance**: Sensitive environment variables and cryptographic keys are strictly excluded via `.gitignore` configurations to maintain full compliance with `psr-governance` standards.
- **Ecosystem Integration**: This studio configuration interfaces seamlessly with `darlek-cann-v3` and `unitary-core` subsystems to facilitate high-performance, multi-dimensional analysis.

---

## Operational Workflow

1. **Initialization**: Verify and populate `.env.example` with the required schema variables.
2. **Execution**: Execute local agent simulations utilizing the `assets/.aistudio` execution context.
3. **Cleanup**: Run the artifact purging script to clear ephemeral simulation buffers:
   ```bash
   # Clear transient simulation buffers and ephemeral artifact caches
   npm run clean:artifacts
   ```

---

## Recent System Updates & Changelog

- **Stability Fixes**: Resolved undefined `currentStep` runtime crashes during initialization sequences.
- **Repository Targeting**: Updated default GitHub repository targets to `Darlek-Caan-vs-Jesus-Chess` on the `main` branch to eliminate persistent `404` tree scanning errors.
- **Global Siphon Integration**: Introduced the *Automatic Global Repository Siphon*, fetching elite reference architectures from industry leaders (Microsoft, IBM, DeepMind, Firebase, Google, Vercel) alongside user repositories to dynamically augment evolution engine context.
- **Zero-Truncation Mandate**: Rectified over-pruning issues by enforcing a strict zero-truncation protocol and expanding input buffers to 35,000 characters.
- **Database Mutation Memory**: Integrated Database Mutation History directly into the Propose and Debate AI pipelines. The system now retrieves recent applied mutations via `sessionId` and injects them into the enhancer context for continuous machine learning.
- **Architectural Header Mandate**: Enforced a new rule within the AI evolution loop (Propose and Debate Synthesis) to dynamically inject and maintain descriptive architectural header comments across all mutated files, ensuring persistent logical context.
- **Architectural Genesis Pass**: Engineered the Genesis Pass, dedicating evolution cycle 1 (`evolutionCycle === 1`) exclusively to establishing JSDoc structural headers across the codebase without mutating underlying business logic, unlocking deep-enhancement capabilities in subsequent cycles.