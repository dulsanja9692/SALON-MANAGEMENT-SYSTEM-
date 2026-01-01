"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Store, Users, LogOut, Calendar, CreditCard } from "lucide-react";

interface UserSession {
  role?: string;
  name?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as UserSession)?.role || "";

  // 1. Define permissions for each page
  const allMenuItems = [
    { 
      name: "Overview", 
      href: "/dashboard", 
      icon: LayoutDashboard,
      roles: ["SuperAdmin", "SalonOwner", "Manager", "Staff", "Cashier"] 
    },
    { 
      name: "Salon Requests", 
      href: "/dashboard/admin", 
      icon: Store,
      roles: ["SuperAdmin"] // 🔒 SuperAdmin ONLY
    },
    { 
      name: "Staff", 
      href: "/dashboard/staff", 
      icon: Users,
      roles: ["SalonOwner", "Manager"] // 🔒 Owners & Managers ONLY
    },
    { 
      name: "Appointments", 
      href: "/dashboard/appointments", 
      icon: Calendar,
      roles: ["SalonOwner", "Manager", "Staff", "Cashier"] 
    },
    { 
      name: "Checkout (POS)", 
      href: "/dashboard/pos", 
      icon: CreditCard,
      roles: ["SalonOwner", "Manager", "Cashier"] // 🔒 Cashiers & Owners ONLY
    },
  ];

  // 2. Filter the menu
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wider text-rose-500">LUXE<span className="text-white">SALON</span></h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 px-4">
            <p className="text-xs text-slate-500 uppercase">Logged in as</p>
            <p className="text-sm font-bold text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-rose-400 capitalize">{userRole}</p>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/30"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}