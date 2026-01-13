import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Security: Only Super Admin can use this
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch users who are 'SALON_OWNER' and 'ACTIVE'
    const salons = await User.find({ 
      role: 'SALON_OWNER', 
      status: 'ACTIVE' 
    }).select('_id name email').sort({ name: 1 });

    return NextResponse.json(salons);

  } catch  {
    return NextResponse.json({ error: "Failed to fetch salons" }, { status: 500 });
  }
}