import { NextRequest, NextResponse } from 'next/server';
import type { TestConnectionBody } from '@/lib/types';
import { callGemini } from '@/lib/gemini';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'TEST_CONNECTION_API' });
}

export async function POST(req: NextRequest) {
  let provider = '';
  try {
    const body: TestConnectionBody = await safeReqJson(req, {} as TestConnectionBody);
    provider = body.provider;
    const key = body.key;

    // Allow using env key if no user key provided
    const effectiveKey = (key && key.trim() !== '') ? key.trim() : (process.env.GEMINI_API_KEY || '');

    if (!effectiveKey) {
      return NextResponse.json({
        success: false,
        message: 'No API key provided.',
      });
    }

    switch (provider) {
      case 'gemini': {
        try {
          const result = await callGemini(
            'System test.',
            'Say "connected" in exactly one word.',
            effectiveKey,
            { maxTokens: 10, temperature: 0.1 }
          );
          if (result && result.trim() !== '') {
            return NextResponse.json({ success: true, message: 'Gemini connected.' });
          }
          return NextResponse.json({ success: false, message: 'Gemini returned empty response.' });
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          if (
            errMsg.includes('location is not supported') ||
            errMsg.includes('Geoblock') ||
            errMsg.includes('location') ||
            errMsg.includes('FAILED_PRECONDITION')
          ) {
            return NextResponse.json({
              success: false,
              message: 'Gemini geoblocked in this region.',
              geoblocked: true,
            });
          }
          return NextResponse.json({
            success: false,
            message: `Gemini error: ${errMsg.slice(0, 200)}`,
          });
        }
      }

      case 'github': {
        const res = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${effectiveKey}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({
            success: true,
            message: `GitHub connected as @${data.login}.`,
          });
        }
        const err = await res.text();
        return NextResponse.json({ success: false, message: `GitHub error: ${err.slice(0, 200)}` });
      }

      default:
        return NextResponse.json({ success: false, message: `Unknown provider: ${provider}` });
    }
  } catch (error) {
    console.error('Test connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('abort') || errorMessage.includes('timeout');
    if (provider === 'gemini' && isTimeout) {
      // Gemini timeout from container = effectively geoblocked
      return NextResponse.json({
        success: false,
        message: 'Gemini unreachable (timeout). Dalek Brain engine active.',
        geoblocked: true,
      });
    }
    return NextResponse.json({ success: false, message: `Connection test failed: ${errorMessage}` });
  }
}
