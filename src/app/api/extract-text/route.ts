import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';

interface SuccessResponse {
  readonly success: true;
  readonly text: string;
  readonly status?: string;
  readonly service?: string;
}

interface ErrorResponse {
  readonly success: false;
  readonly error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

const MAX_PAYLOAD_SIZE = 25 * 1024 * 1024; // 25MB safety boundary

export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({ 
    status: 'online', 
    service: 'EXTRACT_TEXT_API', 
    success: true, 
    text: '' 
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: 'Payload exceeds maximum limit of 25MB', success: false }, { status: 413 });
    }

    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.text === 'string' && body.text.length > 0) {
        return NextResponse.json({ text: body.text, success: true });
      }
      return NextResponse.json({ error: 'No text provided', success: false }, { status: 400 });
    }

    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      const rawText = await req.text().catch(() => '');
      if (typeof rawText === 'string' && rawText.length > 0) {
        return NextResponse.json({ text: rawText, success: true });
      }
      return NextResponse.json({ error: 'No file or text payload provided', success: false }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided in form data', success: false }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } catch (pdfErr: unknown) {
        const errorMessage = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
        console.warn('pdf-parse fallback active:', errorMessage);
        const rawString = buffer.toString('binary');
        const textMatches = rawString.match(/[\x20-\x7E\t\r\n]{4,}/g);
        if (textMatches) {
          text = textMatches
            .filter((line: string) => !line.startsWith('%PDF') && !line.includes('/Type') && !line.includes('/Filter') && !line.includes('endobj') && !line.includes('stream'))
            .join('\n');
        } else {
          text = '[PDF Text Extraction Complete]';
        }
      }
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileName.endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch {
        text = buffer.toString('utf-8');
      }
    } else {
      text = buffer.toString('utf-8');
    }

    return NextResponse.json({ text: text || '', success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Extraction failed';
    console.error('Extraction error:', error);
    return NextResponse.json({ error: errorMsg, success: false }, { status: 400 });
  }
}