"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Store, Users, LogOut } from "lucide-react";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Salon Requests", href: "/dashboard/admin", icon: Store },
  { name: "Staff", href: "/dashboard/staff", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wider text-rose-500">LUXE<span className="text-white">SALON</span></h1>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} /> {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/30">
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </div>
  );
}