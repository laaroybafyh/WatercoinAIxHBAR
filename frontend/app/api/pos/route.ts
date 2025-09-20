import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // stub: return success
  return NextResponse.json({ ok: true, data: body });
}

export async function GET() {
  return NextResponse.json({ ok: true, history: [] });
}


