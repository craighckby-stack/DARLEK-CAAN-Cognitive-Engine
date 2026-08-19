import { NextRequest, NextResponse } from 'next/server';
import type { HealthCheckResult, SaturationMetrics } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mutations = Array.isArray(body.mutations) ? body.mutations : [];
    
    // Calculate saturation metrics based on REAL evolution state
    const mutationCount = mutations.length;
    const pendingMutations = mutations.filter((m: any) => m.status === 'pending').length;
    const appliedMutations = mutations.filter((m: any) => m.status === 'applied').length;
    const rejectedMutations = mutations.filter((m: any) => m.status === 'rejected').length;

    const structuralChange = Math.min(5, 0.5 + (appliedMutations * 0.4));
    const semanticSaturation = Math.min(1.0, 0.05 + (mutationCount * 0.02) + (pendingMutations * 0.05));
    const velocity = Math.min(5, 1.0 + (appliedMutations * 0.3) + (rejectedMutations * 0.1));
    const identityPreservation = Math.max(0.1, 1.0 - (appliedMutations * 0.05));
    const capabilityAlignment = Math.min(5, 1.5 + (appliedMutations * 0.5));
    
    // Calculate cross file impact from the mutations
    let totalAffectedFiles = 0;
    mutations.forEach((m: any) => {
      if (Array.isArray(m.affectedFiles)) {
        totalAffectedFiles += m.affectedFiles.length;
      }
    });
    const crossFileImpact = Math.min(5, 0.3 + (totalAffectedFiles * 0.2));

    const metrics: SaturationMetrics = {
      structuralChange: parseFloat(structuralChange.toFixed(2)),
      semanticSaturation: parseFloat(semanticSaturation.toFixed(3)),
      velocity: parseFloat(velocity.toFixed(2)),
      identityPreservation: parseFloat(identityPreservation.toFixed(2)),
      capabilityAlignment: parseFloat(capabilityAlignment.toFixed(2)),
      crossFileImpact: parseFloat(crossFileImpact.toFixed(2)),
    };

    // Calculate overall health
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

