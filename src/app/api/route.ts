import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface ApiResponse {
  readonly success: boolean;
  readonly message: string;
  readonly timestamp: string;
}

const DEFAULT_HEADERS = Object.freeze({
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
} as const);

export async function GET(_request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const responsePayload: ApiResponse = {
      success: true,
      message: "Hello, world!",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: DEFAULT_HEADERS,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    
    const errorPayload: ApiResponse = {
      success: false,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorPayload, {
      status: 500,
      headers: DEFAULT_HEADERS,
    });
  }
}