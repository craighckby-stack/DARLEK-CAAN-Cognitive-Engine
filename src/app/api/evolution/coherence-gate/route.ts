import { NextRequest, NextResponse } from 'next/server';
import type { CoherenceGateResult } from '@/lib/types';
import { SATURATION_THRESHOLDS } from '@/lib/constants';
import { mainWorker } from '@/lib/main-worker';
import { safeReqJson } from '@/lib/safe-json';

interface CoherenceGateBody {
  riskScore?: number;
  saturation?: {
    structuralChange?: number;
    semanticSaturation?: number;
    velocity?: number;
    identityPreservation?: number;
    capabilityAlignment?: number;
    crossFileImpact?: number;
  };
  affectedFiles?: string[];
  bypassGate?: boolean;
  originalCode?: string;
  proposedCode?: string;
  filePath?: string;
  repoFiles?: string[];
  newFiles?: Array<{ path: string; content?: string }>;
}

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'online', service: 'EVOLUTION_COHERENCE_GATE_API' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await safeReqJson<CoherenceGateBody>(req, {});
    const riskScore = typeof body.riskScore === 'number' ? body.riskScore : 0;
    
    const saturation = {
      structuralChange: body.saturation?.structuralChange ?? 0,
      semanticSaturation: body.saturation?.semanticSaturation ?? 0,
      velocity: body.saturation?.velocity ?? 0,
      identityPreservation: body.saturation?.identityPreservation ?? 1,
      capabilityAlignment: body.saturation?.capabilityAlignment ?? 1,
      crossFileImpact: body.saturation?.crossFileImpact ?? 0,
    };
    
    const affectedFiles = Array.isArray(body.affectedFiles) ? body.affectedFiles : [];
    const { bypassGate, originalCode, proposedCode, filePath, repoFiles = [], newFiles = [] } = body;

    const failures: string[] = [];
    let saturationWarning = false;

    // Rule 0: Deterministic Structural Sanity Check (Non-bypassable)
    if (originalCode && proposedCode && filePath) {
      const sanity = await mainWorker.validateSanity(originalCode, proposedCode, filePath, repoFiles, newFiles);
      if (!sanity.passed && Array.isArray(sanity.violations)) {
        for (const v of sanity.violations) {
          if (v.severity === 'high') {
            failures.push(`STRUCTURAL SANITY BLOCK: ${v.message}`);
          }
        }
      }
    }

    if (bypassGate) {
      return NextResponse.json({
        passed: true,
        reason: failures.length > 0
          ? `COHERENCE GATE PASSED (OVERRIDE): Approved by operator with warnings [${failures.join('; ')}].`
          : 'COHERENCE GATE PASSED: Approved by system operator.',
        riskScore,
        saturationWarning: saturationWarning || failures.length > 0,
        failures: failures.length > 0 ? failures : undefined,
      } satisfies CoherenceGateResult & { failures?: string[] });
    }

    // Rule 1: Risk score check — block anything above 7
    const RISK_THRESHOLD = 7;
    if (riskScore > RISK_THRESHOLD) {
      failures.push(`Risk score ${riskScore}/10 exceeds maximum threshold ${RISK_THRESHOLD}. Mutation DENIED.`);
    }

    // Rule 2: Saturation thresholds — check each metric
    const checks = [
      {
        name: 'Structural Change',
        value: saturation.structuralChange,
        threshold: SATURATION_THRESHOLDS.structuralChange.critical,
        max: SATURATION_THRESHOLDS.structuralChange.max,
        inverted: false,
      },
      {
        name: 'Semantic Saturation',
        value: saturation.semanticSaturation,
        threshold: SATURATION_THRESHOLDS.semanticSaturation.critical,
        max: SATURATION_THRESHOLDS.semanticSaturation.max,
        inverted: false,
      },
      {
        name: 'Velocity',
        value: saturation.velocity,
        threshold: SATURATION_THRESHOLDS.velocity.critical,
        max: SATURATION_THRESHOLDS.velocity.max,
        inverted: false,
      },
      {
        name: 'Identity Preservation',
        value: saturation.identityPreservation,
        threshold: SATURATION_THRESHOLDS.identityPreservation.critical,
        max: SATURATION_THRESHOLDS.identityPreservation.max,
        inverted: true,
      },
      {
        name: 'Cross-File Impact',
        value: saturation.crossFileImpact,
        threshold: SATURATION_THRESHOLDS.crossFileImpact.critical,
        max: SATURATION_THRESHOLDS.crossFileImpact.max,
        inverted: false,
      },
    ];

    for (const check of checks) {
      const isOver = check.inverted
        ? check.value <= check.threshold
        : check.value >= check.threshold;

      if (isOver) {
        failures.push(`${check.name} at critical level (${check.value}/${check.max}). System cannot absorb more change.`);
        saturationWarning = true;
      }
    }

    // Rule 3: Cross-file impact — warn if many files affected
    if (affectedFiles.length > 5) {
      failures.push(`Mutation affects ${affectedFiles.length} files — exceeds safe cross-file impact limit of 5.`);
      saturationWarning = true;
    }

    // Rule 4: Cumulative saturation stress — if 3+ metrics at warning level
    const warningChecks = [
      saturation.structuralChange >= SATURATION_THRESHOLDS.structuralChange.warning,
      saturation.semanticSaturation >= SATURATION_THRESHOLDS.semanticSaturation.warning,
      saturation.velocity >= SATURATION_THRESHOLDS.velocity.warning,
      saturation.identityPreservation <= SATURATION_THRESHOLDS.identityPreservation.warning,
      saturation.crossFileImpact >= SATURATION_THRESHOLDS.crossFileImpact.warning,
    ];
    
    const warningCount = warningChecks.filter(Boolean).length;
    if (warningCount >= 3) {
      failures.push(`Cumulative stress: ${warningCount}/5 metrics at warning level. System needs rest.`);
      saturationWarning = true;
    }

    const result: CoherenceGateResult = {
      passed: failures.length === 0,
      reason: failures.length > 0
        ? `COHERENCE GATE BLOCKED:\n${failures.join('\n')}`
        : 'COHERENCE GATE PASSED: All thresholds within safe limits. Mutation authorized.',
      riskScore,
      saturationWarning,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Coherence gate error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { passed: false, reason: `Coherence gate error: ${errorMessage}`, riskScore: 0, saturationWarning: true },
      { status: 500 }
    );
  }
}