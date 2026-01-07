'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Calendar, Users, FileText, Settings, Scissors } from "lucide-react"; 

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userRole = session?.user?.role;
  const userStatus = session?.user?.status; 

  const allNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "SALON_OWNER"] },
    { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, roles: ["SALON_OWNER", "STAFF"] },
    
    // 👇 FIXED LINK: Matches the folder name "requests"
    { name: "Pending Requests", href: "/dashboard/requests", icon: FileText, roles: ["SUPER_ADMIN"] }, 
    
    { name: "Staff", href: "/dashboard/staff", icon: Users, roles: ["SALON_OWNER", "SUPER_ADMIN"] },
    { name: "Services", href: "/dashboard/services", icon: Scissors, roles: ["SALON_OWNER"] },
  ];

  // Filter Links based on Role AND Status
  const navItems = allNavItems.filter((item) => {
    // 1. Check Role
    if (!item.roles.includes(userRole as string)) return false;

    // 2. RESTRICTION: If Salon Owner is NOT Active, hide everything except Dashboard (which shows pending msg)
    if (userRole === 'SALON_OWNER' && userStatus !== 'ACTIVE') {
       return false; 
    }

    return true;
  });

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-slate-100">VELORA</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        
        {/* Special Message for Pending Users */}
        {userRole === 'SALON_OWNER' && userStatus !== 'ACTIVE' && (
           <div className="p-4 bg-slate-800 rounded-lg text-center">
             <p className="text-xs text-slate-400 mb-2">Account Pending</p>
             <div className="text-sm font-bold text-yellow-500">Waiting for Approval ⏳</div>
           </div>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-200">{session?.user?.name}</p>
            <p className="text-slate-500 capitalize">{userRole?.replace('_', ' ').toLowerCase()}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}