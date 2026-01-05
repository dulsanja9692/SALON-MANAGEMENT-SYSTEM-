import { compose } from './middleware/compose';
import { withAuth } from './middleware/auth';
import { withAccountStatus } from './middleware/accountStatus';
import { withRoleProtection } from './middleware/role';

export const middleware = compose([
  withAuth,            // 1. Must be logged in
  withAccountStatus,   // 2. Must be Approved (14-day rule)
  withRoleProtection,  // 3. Must have correct Permissions
]);

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/api/:path*', 
    '/booking/:path*', 
    '/onboarding/:path*'
  ],
};