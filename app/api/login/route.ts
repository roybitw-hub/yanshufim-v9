import { NextResponse } from 'next/server';
import { COOKIE, makeToken, samePassword } from '@/lib/session';

export async function POST(req: Request) {
  const form = await req.formData();
  const pass = String(form.get('password') || '');
  const next = String(form.get('next') || '/');
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const expected = process.env.APP_PASSWORD || '';
  if (!expected || !samePassword(pass, expected)) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.redirect(new URL(`/login?error=1&next=${encodeURIComponent(safeNext)}`, req.url), 303);
  }
  const res = NextResponse.redirect(new URL(safeNext, req.url), 303);
  res.cookies.set(COOKIE, await makeToken(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 60 });
  return res;
}
