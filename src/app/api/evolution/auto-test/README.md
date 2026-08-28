# Auto-Test Runner Architecture

## Overview
The Auto-Test Runner acts as the 'Coherence Gate' for the DARLEK CANN v3.0 system. It ensures that any automated code mutation adheres to strict syntax, security, and architectural standards before integration.

## Workflow
1. **Ingestion**: Receives `proposedCode` and `originalCode`.
2. **Diagnostic Suite**: Runs regex-based static analysis.
3. **Gatekeeping**: If any `high` severity `fail` status is returned, the mutation is rejected.
4. **Telemetry**: Results are logged to the evolution dashboard.

## Integration
This module is called by the `MutationEngine` after every generation cycle.