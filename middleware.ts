import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isDevelopmentEnvironment } from './lib/shared/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  const isLoggedIn = !!token;
  const userStatus = token?.status as string | undefined;

  if (pathname.startsWith('/chat/')) {
    return NextResponse.next();
  }

  // Redirect removed users to create-clinic page
  if (userStatus === 'removed') {
    if (
      !pathname.startsWith('/create-clinic') &&
      !pathname.startsWith('/api/user/delete') &&
      !pathname.startsWith('/api/clinic') &&
      !pathname.startsWith('/api/user/clinic-invitations')
    ) {
      return NextResponse.redirect(new URL('/create-clinic', request.url));
    }
  }

  if (['/login', '/register'].includes(pathname)) {
    if (isLoggedIn) {
      // Redirect invited users to change password page
      if (userStatus === 'invited') {
        return NextResponse.redirect(new URL('/change-password', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/create-clinic' && userStatus !== 'removed') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow invited users to access change-password page
  if (pathname === '/change-password') {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If user is already active, redirect to dashboard
    if (userStatus !== 'invited') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard and all other routes from invited users
  if (isLoggedIn && userStatus === 'invited') {
    return NextResponse.redirect(new URL('/change-password', request.url));
  }

  if (['/dashboard'].includes(pathname)) {
    return !isLoggedIn
      ? NextResponse.redirect(new URL('/login', request.url))
      : NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|help/).*)',
  ],
};
