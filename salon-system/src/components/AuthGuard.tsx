'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Back Button Security (BF Cache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    // 2. Auth Logic
    if (status === 'loading') return;

    // A. Not Logged In? -> Kick to Login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // B. Logged In but PENDING? -> Lock in Profile Page
    const userStatus = session?.user?.status;
    const isPending = userStatus === 'PENDING_DETAILS' || userStatus === 'PENDING_APPROVAL';
    
    // If user is PENDING and tries to go anywhere EXCEPT the profile page...
    if (isPending && pathname !== '/dashboard/complete-profile') {
      router.push('/dashboard/complete-profile');
    }

    // C. User is ACTIVE but tries to go to Profile Page? -> Send to Dashboard
    if (userStatus === 'ACTIVE' && pathname === '/dashboard/complete-profile') {
        router.push('/dashboard');
    }

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [status, session, router, pathname]);

  return null;
}