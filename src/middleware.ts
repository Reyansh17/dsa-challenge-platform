import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { ADMIN_CREDENTIALS } from './config/admin';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (token?.email !== ADMIN_CREDENTIALS.email) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}; 