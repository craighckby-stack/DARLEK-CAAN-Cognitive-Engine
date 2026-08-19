import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'SYSTEM_SCAFFOLD_API' });
}

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'System scaffold initialized successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
