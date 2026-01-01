"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Store, Check, X, Eye } from "lucide-react"; // Added Eye icon

interface Salon {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface User {
  role: string;
}

export default function AdminSalonsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as User).role !== "SuperAdmin") {
      router.push("/dashboard");
      return;
    }
    if (status === "authenticated") fetchSalons();
  }, [status, session, router]);

  const fetchSalons = async () => {
    try {
      const res = await fetch(`/api/admin/salons?t=${Date.now()}`);
      if (res.ok) setSalons(await res.json());
    } catch { console.error("Failed to load"); } 
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, newStatus: "Active" | "Rejected") => {
    setSalons((current) => current.map(s => s._id === id ? { ...s, status: newStatus } : s));
    await fetch("/api/admin/salons", {
      method: "PATCH",
      body: JSON.stringify({ salonId: id, status: newStatus }),
    });
    fetchSalons();
  };

  // 🚀 NEW FUNCTION: Redirect to dashboard with the specific salon ID
  const viewSalonDashboard = (salonId: string) => {
    router.push(`/dashboard?viewSalonId=${salonId}`);
  };

  if (loading) return <div className="p-8">Loading requests...</div>;
  if ((session?.user as User).role !== "SuperAdmin") return null;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">All Salons</h2>
      <div className="grid gap-4">
        {salons.map((salon) => (
          <div key={salon._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-full"><Store size={24} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{salon.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    salon.status === "Active" ? "bg-green-100 text-green-700" : 
                    salon.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                  }`}>{salon.status}</span>
                  <span className="text-xs text-slate-500">{new Date(salon.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {/* 🚀 IF ACTIVE: Show View Button */}
              {salon.status === "Active" && (
                <button 
                  onClick={() => viewSalonDashboard(salon._id)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
                >
                  <Eye size={16} className="mr-2" /> View Dashboard
                </button>
              )}

              {/* IF PENDING: Show Approve/Reject */}
              {salon.status === "Pending" && (
                <>
                  <button onClick={() => updateStatus(salon._id, "Active")} className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    <Check size={16} className="mr-1" /> Approve
                  </button>
                  <button onClick={() => updateStatus(salon._id, "Rejected")} className="flex items-center px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                    <X size={16} className="mr-1" /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}