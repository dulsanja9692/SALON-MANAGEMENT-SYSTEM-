import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MiddlewareFactory } from './compose';
import { ACCOUNT_STATUS, PENDING_ALLOWED_ENDPOINTS } from '@/config/permissions';

export const withAccountStatus: MiddlewareFactory = (next) => {
  return async (req: NextRequest) => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return next(req);

    // RULE: Only APPROVED users can access the full system
    if (token.status !== ACCOUNT_STATUS.APPROVED) {
      const { pathname } = req.nextUrl;
      const isAllowed = PENDING_ALLOWED_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint));
      
      if (!isAllowed) {
        // Redirect to Onboarding
        return NextResponse.redirect(new URL('/onboarding/profile-setup', req.url));
      }
    }
    return next(req);
  };
};