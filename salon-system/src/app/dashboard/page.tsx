'use client';

import { useSession } from 'next-auth/react';

export default function DashboardHomePage() {
  const { data: session } = useSession();

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Velora Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">System Overview</p>
        </div>
        <div className="h-10 w-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
            {session?.user?.name?.[0] || 'A'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-1">Total Bookings</p>
          <h3 className="text-3xl font-bold text-gray-900">0</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-1">Revenue</p>
          <h3 className="text-3xl font-bold text-gray-900">$0.00</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-1">Staff</p>
          <h3 className="text-3xl font-bold text-gray-900">0</h3>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-blue-800 font-bold mb-2">System Status</h3>
        <p className="text-sm text-blue-600">All systems operational.</p>
        <p className="text-xs text-blue-500 mt-2 font-mono">Logged in as: {session?.user?.email}</p>
      </div>
    </div>
  );
}