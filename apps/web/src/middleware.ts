import { NextRequest, NextResponse } from 'next/server';

function roleOf(token?: string): string | null {
  try { return JSON.parse(atob(token!.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role ?? null; } catch { return null; }
}
export function middleware(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO === '1') return NextResponse.next();
  const p = req.nextUrl.pathname;
  const role = roleOf(req.cookies.get('access')?.value);
  if (p.startsWith('/admin-portal') && !p.startsWith('/admin-portal/login') && role !== 'ADMIN')
    return NextResponse.redirect(new URL('/admin-portal/login', req.url));
  if (p.startsWith('/apprenant') && !p.startsWith('/apprenant/login') && role !== 'APPRENANT')
    return NextResponse.redirect(new URL('/apprenant/login', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/admin-portal/:path*', '/apprenant/:path*'] };
