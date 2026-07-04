// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'غير مخوّل' }, { status: 401 });
  }

  const { path: pathToRevalidate, tag } = await request.json().catch(() => ({}));

  if (tag) revalidateTag(tag);
  if (pathToRevalidate) revalidatePath(pathToRevalidate);
  if (!tag && !pathToRevalidate) revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
