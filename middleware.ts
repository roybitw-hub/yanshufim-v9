import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, authEnabled, verifyToken } from './lib/session';

export async function middleware(req: NextRequest) {
  if (!authEnabled()) return NextResponse.next();
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login') || pathname.startsWith('/api/login')) return NextResponse.next();
  if (await verifyToken(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icon.svg|apple-touch-icon.png|icon-192.png|icon-512.png|manifest.webmanifest|favicon.ico).*)'],
};
