"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";

interface SessionUser {
  role?: string;
  salonId?: string;
}

export default function DashboardOverview() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  
  // 1. Check if we are trying to view a specific salon (Admin Feature)
  const viewSalonId = searchParams.get("viewSalonId");
  const userRole = (session?.user as SessionUser)?.role;
  const isSuperAdmin = userRole === "SuperAdmin";
  
  // 2. Decide which ID to show data for
  const userSalonId = (session?.user as SessionUser)?.salonId;
  const activeSalonId = (isSuperAdmin && viewSalonId) ? viewSalonId : userSalonId;

  if (status === "loading") return <div className="p-8">Loading Dashboard...</div>;

  // 3. SUPER ADMIN VIEW (Default System Overview)
  if (isSuperAdmin && !viewSalonId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-medium text-slate-600">System Status</h3>
            <div className="flex items-center gap-2 mt-2 text-green-600 font-bold text-xl">
              <CheckCircle /> Operational
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-medium text-slate-600">Quick Actions</h3>
             <div className="mt-4">
                <Link href="/dashboard/admin" className="text-blue-600 hover:underline text-sm">
                    View Salon Requests &rarr;
                </Link>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. SALON DASHBOARD VIEW (Owners & Cashiers)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome to Luxe Salon System</p>
        </div>

        {isSuperAdmin && viewSalonId && (
            <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="text-sm text-blue-800">
                    <span className="font-bold">Admin Mode:</span> Viewing Salon ID <span className="font-mono bg-white px-1 rounded">{viewSalonId.slice(0,6)}...</span>
                </div>
                <Link href="/dashboard/admin" className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 underline">
                    <EyeOff size={14} /> Exit View
                </Link>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Today's Appointments</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">$0.00</p>
        </div>
      </div>
      
      {/* Security Verification */}
      <div className="p-4 bg-slate-100 rounded text-xs text-slate-500 font-mono mt-8 border border-slate-200">
        <p className="font-bold mb-1">🔍 SYSTEM DIAGNOSTICS</p>
        <p>User Role: {userRole}</p>
        <p>Linked Salon ID: <span className="text-blue-600 font-bold">{String(activeSalonId || "None")}</span></p>
      </div>
    </div>
  );
}