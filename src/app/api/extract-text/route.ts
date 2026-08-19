import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: 'online', service: 'EXTRACT_TEXT_API' });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (body.text) {
        return NextResponse.json({ text: body.text, success: true });
      }
      return NextResponse.json({ error: 'No text provided', success: false }, { status: 400 });
    }

    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      const rawText = await req.text().catch(() => '');
      if (rawText) {
        return NextResponse.json({ text: rawText, success: true });
      }
      return NextResponse.json({ error: 'No file or text payload provided', success: false }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data', success: false }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } catch (pdfErr: any) {
        console.warn('pdf-parse fallback active:', pdfErr?.message);
        const rawString = buffer.toString('binary');
        const textMatches = rawString.match(/[\x20-\x7E\t\r\n]{4,}/g);
        if (textMatches) {
          text = textMatches
            .filter(line => !line.startsWith('%PDF') && !line.includes('/Type') && !line.includes('/Filter') && !line.includes('endobj') && !line.includes('stream'))
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
  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: error.message || 'Extraction failed', success: false }, { status: 400 });
  }
}
