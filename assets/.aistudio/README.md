# AI Studio Configuration & Governance

## Overview
This directory serves as the control plane for the **DARLEK CANN v3.0** evolution engine. It manages environment-specific configurations, agent state persistence, and security policies for the repository.

---

## Architectural Blueprints
- **State Management**: Agent memory dumps are isolated in `*.memory.json` to prevent state corruption during continuous integration and deployment (CI/CD) cycles.
- **Security**: Sensitive environment variables and cryptographic keys are strictly ignored via `.gitignore` to maintain compliance with `psr-governance` standards.
- **Integration**: This studio configuration is designed to interface seamlessly with `darlek-cann-v3` and `unitary-core` for multi-dimensional analysis.

---

## Operational Workflow
1. **Initialization**: Ensure `.env.example` is populated with the required schema.
2. **Execution**: Run agent simulations using the local `assets/.aistudio` context.
3. **Cleanup**: Use `npm run clean:artifacts` to purge ephemeral simulation buffers.

---

## Recent System Updates & Changelog

- **Stability Fixes**: Resolved undefined `currentStep` crashes during initialization.
- **Repository Targeting**: Updated default GitHub repository targets to `Darlek-Caan-vs-Jesus-Chess` on the `main` branch to prevent `404` tree scanning errors.
- **Global Siphon Integration**: Added the *Automatic Global Repository Siphon*, fetching elite reference architectures from Microsoft, IBM, DeepMind, Firebase, Google, and Vercel alongside the user's own repositories to augment the evolution engine's context.
- **Zero-Truncation Mandate**: Fixed an issue where the evolution engine was over-pruning and aggressively truncating code, implementing a strict zero-truncation mandate and increasing input buffers to 35,000 characters.
- **Database Mutation Memory**: Connected the Database Mutation History to the Propose and Debate AI pipelines. The system now retrieves the most recent applied mutations via `sessionId` and injects them into the enhancer's context, allowing the AI to learn from past changes.
- **Architectural Header Mandate**: Added a mandate to the AI evolution loop (Propose and Debate Synthesis) to dynamically inject and maintain descriptive architectural header comments at the top of every mutated file to persist logical context.
- **Architectural Genesis Pass**: Engineered the Genesis Pass, dedicating evolution cycle 1 (`evolutionCycle === 1`) exclusively to generating JSDoc structural headers across the codebase without altering logic, enabling aggressive deep-enhancement in subsequent cycles.