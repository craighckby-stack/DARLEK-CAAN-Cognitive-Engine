# API Gateway Documentation

## Overview
This module serves as the primary gateway for the DARLEK CANN v3.0 system. It implements the OMEGA-Emergent architecture, providing real-time system diagnostics and agent orchestration hooks.

## Endpoints
- `GET /api`: Returns system health, performance metrics, and node status.
- `POST /api`: Accepts agent-orchestration payloads for swarm synchronization.

## Integration
This system is designed to interface with the `sovereign-kernel` and `unitary-core` repositories. Ensure all incoming requests include the `X-Agent-Context` header for proper routing.