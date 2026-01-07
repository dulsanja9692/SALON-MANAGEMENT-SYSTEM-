import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MiddlewareFactory } from './compose';

export const withAuth: MiddlewareFactory = (next) => {
  return async (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    // Public paths that don't need login
    const publicPaths = ['/login', '/register', '/api/auth', '/_next'];
    if (publicPaths.some((path) => pathname.startsWith(path))) return next(req);

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }
    return next(req);
  };
};