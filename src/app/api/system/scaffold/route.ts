import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SystemStatusResponse {
  readonly status: 'online';
  readonly service: string;
}

interface ScaffoldSuccessResponse {
  readonly success: true;
  readonly message: string;
  readonly timestamp: string;
}

interface ErrorResponse {
  readonly error: string;
  readonly timestamp: string;
}

export async function GET(): Promise<NextResponse<SystemStatusResponse>> {
  return NextResponse.json({
    status: 'online',
    service: 'SYSTEM_SCAFFOLD_API',
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<ScaffoldSuccessResponse | ErrorResponse>> {
  try {
    if (req.body) {
      await req.json().catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: 'System scaffold initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during system scaffold initialization';
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}