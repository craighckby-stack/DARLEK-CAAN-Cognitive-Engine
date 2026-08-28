# Style Migration Protocol

## Overview
This module manages the transition of UI tokens from legacy 'Zinc' palettes to the 'Glass-Emergent' design system, as defined in the `darlek-cann-v3` architecture.

## Workflow
1. **Load**: Reads `src/App.tsx`.
2. **Map**: Applies deterministic regex replacements defined in `STYLE_MAPPINGS`.
3. **Commit**: Atomic write to disk.

## Integration
This script is designed to be run as a pre-build hook in the CI/CD pipeline to ensure consistency across the `sovereign-kernel` ecosystem.









































