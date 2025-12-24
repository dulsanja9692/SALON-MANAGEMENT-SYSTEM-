"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Scissors } from "lucide-react";

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
      <Card className="w-96 border-t-4 border-primary shadow-xl">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="p-3 bg-rose-100 rounded-full text-primary">
            <Scissors size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Luxe Salon</h1>
          <p className="text-sm text-slate-500">System Access</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                    type="email" 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    className="focus-visible:ring-primary"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input 
                    type="password" 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    className="focus-visible:ring-primary"
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-rose-700">
              {loading ? "Verifying..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}