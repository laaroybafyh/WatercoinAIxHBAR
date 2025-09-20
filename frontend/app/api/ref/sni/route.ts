import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), '..', 'referensi', 'download-report (1).pdf');
    const buffer = readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="sni-watercoin.pdf"',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}


