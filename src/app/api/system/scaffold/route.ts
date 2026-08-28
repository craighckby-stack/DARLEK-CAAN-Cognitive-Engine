import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SystemStatusResponse {
  status: 'online';
  service: string;
}

interface ScaffoldSuccessResponse {
  success: true;
  message: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
  timestamp: string;
}

export async function GET(): Promise<NextResponse<SystemStatusResponse>> {
  return NextResponse.json({
    status: 'online',
    service: 'SYSTEM_SCAFFOLD_API',
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<ScaffoldSuccessResponse | ErrorResponse>> {
  try {
    // Optional request body consumption/validation hook for future extensibility
    await req.json().catch(() => null);

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