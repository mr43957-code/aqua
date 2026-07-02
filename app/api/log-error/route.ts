// app/api/log-error/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await logError(body.message ?? 'خطأ في العميل', {
      digest: body.digest,
      stack: body.stack,
      url: request.headers.get('referer'),
    });
  } catch {
    // Swallow - logging must never throw
  }
  return NextResponse.json({ ok: true });
}
