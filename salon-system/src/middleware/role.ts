import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MiddlewareFactory } from './compose';
import { PERMISSIONS, SYSTEM_ROLES } from '@/config/permissions';

export const withRoleProtection: MiddlewareFactory = (next) => {
  return async (req: NextRequest) => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return next(req);

    const { pathname } = req.nextUrl;
    const permissions = (token.permissions as string[]) || [];
    const role = token.role;

    // 1. CLIENT RESTRICTION (Users cannot see Dashboard)
    if (pathname.startsWith('/dashboard')) {
      if (role === SYSTEM_ROLES.USER) {
        return NextResponse.redirect(new URL('/profile', req.url));
      }
    }

    // 2. SUPER ADMIN GUARD
    if (pathname.startsWith('/admin')) {
      if (role !== SYSTEM_ROLES.SUPER_ADMIN) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // 3. FINANCE GUARD (Check: finance:view)
    if (pathname.startsWith('/dashboard/finance')) {
      if (!permissions.includes(PERMISSIONS.FINANCE_VIEW)) {
         // If unauthorized, send them to a safe page (e.g., Schedule)
         return NextResponse.redirect(new URL('/dashboard/schedule', req.url));
      }
    }

    // 4. POS GUARD (Check: pos:access)
    if (pathname.startsWith('/dashboard/pos')) {
      if (!permissions.includes(PERMISSIONS.POS_ACCESS)) {
         return NextResponse.json({ error: "No POS Access" }, { status: 403 });
      }
    }

    // 5. STAFF MANAGEMENT (Check: staff:manage)
    if (pathname.startsWith('/dashboard/employees/manage')) {
      if (!permissions.includes(PERMISSIONS.STAFF_MANAGE)) {
         return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return next(req);
  };
};