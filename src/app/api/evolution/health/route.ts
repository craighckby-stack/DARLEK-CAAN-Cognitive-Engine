import { NextRequest, NextResponse } from 'next/server';
import type { HealthCheckResult, SaturationMetrics } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type MutationStatus = 'pending' | 'applied' | 'rejected' | string;

interface MutationInput {
  readonly status?: MutationStatus;
  readonly affectedFiles?: readonly unknown[];
}

interface RequestBody {
  readonly mutations?: readonly MutationInput[];
}

interface ErrorResponse {
  readonly metrics: null;
  readonly overallHealth: 'critical';
  readonly error: string;
}

const ROUND_TWO = 2;
const ROUND_THREE = 3;

export async function POST(req: NextRequest): NextResponse<HealthCheckResult | ErrorResponse> {
  let body: RequestBody = {};
  try {
    const text = await req.text();
    if (text) {
      body = JSON.parse(text) as RequestBody;
    }
  } catch {
    // Fallback to empty body on parse error
  }

  const mutations = Array.isArray(body?.mutations) ? body.mutations : [];
  const mutationCount = mutations.length;

  let pendingMutations = 0;
  let appliedMutations = 0;
  let rejectedMutations = 0;
  let totalAffectedFiles = 0;

  for (let i = 0; i < mutationCount; i++) {
    const m = mutations[i];
    const status = m?.status;
    if (status === 'pending') {
      pendingMutations++;
    } else if (status === 'applied') {
      appliedMutations++;
    } else if (status === 'rejected') {
      rejectedMutations++;
    }

    if (Array.isArray(m?.affectedFiles)) {
      totalAffectedFiles += m.affectedFiles.length;
    }
  }

  const structuralChange = Math.min(5, 0.5 + appliedMutations * 0.4);
  const semanticSaturation = Math.min(1.0, 0.05 + mutationCount * 0.02 + pendingMutations * 0.05);
  const velocity = Math.min(5, 1.0 + appliedMutations * 0.3 + rejectedMutations * 0.1);
  const identityPreservation = Math.max(0.1, 1.0 - appliedMutations * 0.05);
  const capabilityAlignment = Math.min(5, 1.5 + appliedMutations * 0.5);
  const crossFileImpact = Math.min(5, 0.3 + totalAffectedFiles * 0.2);

  const metrics: SaturationMetrics = {
    structuralChange: Number(structuralChange.toFixed(ROUND_TWO)),
    semanticSaturation: Number(semanticSaturation.toFixed(ROUND_THREE)),
    velocity: Number(velocity.toFixed(ROUND_TWO)),
    identityPreservation: Number(identityPreservation.toFixed(ROUND_TWO)),
    capabilityAlignment: Number(capabilityAlignment.toFixed(ROUND_TWO)),
    crossFileImpact: Number(crossFileImpact.toFixed(ROUND_TWO)),
  };

  let warningCount = 0;
  let criticalCount = 0;

  if (metrics.structuralChange > 4) {
    criticalCount++;
  } else if (metrics.structuralChange > 3) {
    warningCount++;
  }

  if (metrics.semanticSaturation > 0.28) {
    criticalCount++;
  } else if (metrics.semanticSaturation > 0.21) {
    warningCount++;
  }

  if (metrics.velocity > 4) {
    criticalCount++;
  } else if (metrics.velocity > 3) {
    warningCount++;
  }

  if (metrics.identityPreservation < 0.2) {
    criticalCount++;
  } else if (metrics.identityPreservation < 0.4) {
    warningCount++;
  }

  if (metrics.capabilityAlignment > 4) {
    criticalCount++;
  } else if (metrics.capabilityAlignment > 3) {
    warningCount++;
  }

  if (metrics.crossFileImpact > 2.4) {
    criticalCount++;
  } else if (metrics.crossFileImpact > 1.8) {
    warningCount++;
  }

  let overallHealth: 'healthy' | 'warning' | 'critical';
  if (criticalCount >= 2) {
    overallHealth = 'critical';
  } else if (warningCount >= 2 || criticalCount >= 1) {
    overallHealth = 'warning';
  } else {
    overallHealth = 'healthy';
  }

  const result: HealthCheckResult = {
    metrics,
    overallHealth,
  };

  return NextResponse.json(result);
}