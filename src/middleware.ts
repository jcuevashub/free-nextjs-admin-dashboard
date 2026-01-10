import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Si es la ruta de login, permitir acceso
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Si es cualquier otra ruta de /admin, verificar sesión
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession || adminSession.value !== 'authenticated') {
      // Redirigir al login si no hay sesión
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
