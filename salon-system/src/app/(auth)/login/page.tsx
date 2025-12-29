"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ✅ Added Link import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Scissors, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { 
      email: form.email, 
      password: form.password, 
      redirect: false 
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard"); 
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-100 border-t-4 border-primary shadow-xl">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="p-3 bg-rose-100 rounded-full text-primary">
            <Scissors size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Luxe Salon</h1>
          <p className="text-sm text-slate-500">System Access</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded text-center">{error}</div>}
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                    type="email" 
                    placeholder="admin@salon.com"
                    onChange={e => setForm({...form, email: e.target.value})} 
                    className="focus-visible:ring-primary"
                    required
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input 
                    type="password" 
                    placeholder="••••••••"
                    onChange={e => setForm({...form, password: e.target.value})} 
                    className="focus-visible:ring-primary"
                    required
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-rose-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* ✅ The New Registration Link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            New to Luxe?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register your salon
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}