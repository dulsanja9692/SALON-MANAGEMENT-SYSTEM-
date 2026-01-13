'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userStatus = session?.user?.status;

  // 🔒 LOCKED VIEW: If user is Pending
  if (userStatus !== 'ACTIVE') {
    return (
      <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-wider text-center text-gray-400">VELORA</h1>
        </div>
        <nav className="flex-1 px-4 py-6 text-center text-gray-500 text-sm">
           <div className="mt-10 p-4 border border-gray-700 rounded bg-slate-800">
             <p className="text-yellow-500 font-bold mb-2">⚠ Action Required</p>
             <p>Please complete your profile to unlock the dashboard.</p>
           </div>
        </nav>
      </aside>
    );
  }

  // ✅ FULL VIEW: Active Users
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wider text-center">VELORA</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
          Dashboard
        </Link>
        
        {/* SUPER ADMIN ONLY LINKS */}
        {userRole === 'SUPER_ADMIN' && (
           <div className="mt-4 mb-4 pt-4 border-t border-slate-700">
            <p className="px-4 text-xs text-gray-400 mb-2 font-semibold">ADMIN CONTROLS</p>
            <Link href="/dashboard/salons" className="block px-4 py-2 text-yellow-400 hover:bg-slate-800 transition">
              + Add Salon Owner
            </Link>
            <Link href="/dashboard/admin/approvals" className="block px-4 py-2 text-yellow-400 hover:bg-slate-800 transition">
              📋 Pending Requests
            </Link>
           </div>
        )}

        {/* STANDARD FEATURES */}
        <Link href="/dashboard/appointments" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
          Appointments
        </Link>
        <Link href="/dashboard/staff" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
          Staff Management
        </Link>
        <Link href="/dashboard/services" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
          Services
        </Link>
      </nav>
    </aside>
  );
}