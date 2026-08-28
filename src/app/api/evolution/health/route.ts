import { NextRequest, NextResponse } from 'next/server';
import type { HealthCheckResult, SaturationMetrics } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface MutationInput {
  status?: 'pending' | 'applied' | 'rejected' | string;
  affectedFiles?: unknown[];
}

interface RequestBody {
  mutations?: MutationInput[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const mutations = Array.isArray(body.mutations) ? body.mutations : [];

    let pendingMutations = 0;
    let appliedMutations = 0;
    let rejectedMutations = 0;
    let totalAffectedFiles = 0;

    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i];
      if (m.status === 'pending') pendingMutations++;
      else if (m.status === 'applied') appliedMutations++;
      else if (m.status === 'rejected') rejectedMutations++;

      if (Array.isArray(m.affectedFiles)) {
        totalAffectedFiles += m.affectedFiles.length;
      }
    }

    const mutationCount = mutations.length;

    const structuralChange = Math.min(5, 0.5 + appliedMutations * 0.4);
    const semanticSaturation = Math.min(1.0, 0.05 + mutationCount * 0.02 + pendingMutations * 0.05);
    const velocity = Math.min(5, 1.0 + appliedMutations * 0.3 + rejectedMutations * 0.1);
    const identityPreservation = Math.max(0.1, 1.0 - appliedMutations * 0.05);
    const capabilityAlignment = Math.min(5, 1.5 + appliedMutations * 0.5);
    const crossFileImpact = Math.min(5, 0.3 + totalAffectedFiles * 0.2);

    const metrics: SaturationMetrics = {
      structuralChange: Number(structuralChange.toFixed(2)),
      semanticSaturation: Number(semanticSaturation.toFixed(3)),
      velocity: Number(velocity.toFixed(2)),
      identityPreservation: Number(identityPreservation.toFixed(2)),
      capabilityAlignment: Number(capabilityAlignment.toFixed(2)),
      crossFileImpact: Number(crossFileImpact.toFixed(2)),
    };

    let warningCount = 0;
    let criticalCount = 0;

    if (metrics.structuralChange > 4) criticalCount++;
    else if (metrics.structuralChange > 3) warningCount++;

    if (metrics.semanticSaturation > 0.28) criticalCount++;
    else if (metrics.semanticSaturation > 0.21) warningCount++;

    if (metrics.velocity > 4) criticalCount++;
    else if (metrics.velocity > 3) warningCount++;

    if (metrics.identityPreservation < 0.2) criticalCount++;
    else if (metrics.identityPreservation < 0.4) warningCount++;

    if (metrics.capabilityAlignment > 4) criticalCount++;
    else if (metrics.capabilityAlignment > 3) warningCount++;

    if (metrics.crossFileImpact > 2.4) criticalCount++;
    else if (metrics.crossFileImpact > 1.8) warningCount++;

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
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { metrics: null, overallHealth: 'critical', error: 'Health check failed' },
      { status: 500 }
    );
  }
}