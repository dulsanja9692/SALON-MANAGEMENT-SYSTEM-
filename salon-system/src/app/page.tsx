import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // 1. If NOT logged in, go strictly to Login
    redirect("/login");
  } else {
    // 2. If logged in, go to Dashboard
    // (Your middleware.ts will then detect their Role and redirect them further if needed)
    redirect("/dashboard");
  }
}