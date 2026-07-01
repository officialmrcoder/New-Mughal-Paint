import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the custom cookie containing user session info
  const sessionCookie = request.cookies.get('nmp_user_session');

  let userSession: { id: string; email: string; role: 'user' | 'admin' } | null = null;

  if (sessionCookie?.value) {
    try {
      // Decode and parse the session cookie
      userSession = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (e) {
      console.error('Error parsing session cookie in middleware:', e);
    }
  }

  // Define route protections
  const isAccountRoute = pathname.startsWith('/account');
  const isAdminRoute = pathname.startsWith('/admin');

  // Case 1: Account protection (user must be logged in)
  if (isAccountRoute && !userSession) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter for premium user experience
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: Admin protection (user must be logged in and must have role === 'admin')
  if (isAdminRoute) {
    if (!userSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userSession.role !== 'admin') {
      // If logged in but not an admin, redirect to homepage with warning
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized_admin_access');
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" in Next.js docs
export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};
