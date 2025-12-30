"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Store } from "lucide-react";

interface Salon {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function AdminSalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSalons(); }, []);

  const fetchSalons = async () => {
    try {
      const res = await fetch("/api/admin/salons");
      const data = await res.json();
      setSalons(data);
    } catch { console.error("Failed to load salons"); } 
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: "Active" | "Rejected") => {
    await fetch("/api/admin/salons", {
      method: "PATCH",
      body: JSON.stringify({ salonId: id, status }),
    });
    fetchSalons();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Salon Requests</h2>
      <div className="grid gap-4">
        {salons.map((salon) => (
          <Card key={salon._id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-full"><Store size={24} /></div>
              <div>
                <h3 className="font-bold text-lg">{salon.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={salon.status === "Active" ? "default" : "secondary"}>{salon.status}</Badge>
                  <span className="text-xs text-slate-500">Registered: {new Date(salon.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {salon.status === "Pending" && (
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(salon._id, "Active")}>
                  <Check size={16} className="mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus(salon._id, "Rejected")}>
                  <X size={16} className="mr-1" /> Reject
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}