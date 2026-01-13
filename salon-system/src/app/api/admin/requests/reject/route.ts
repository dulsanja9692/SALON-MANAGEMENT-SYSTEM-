import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Security Check: Only Super Admin can reject/delete
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectDB();

    // 2. DELETE the User completely
    // Instead of updating status to 'REJECTED', we wipe the record.
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Request rejected and data removed from system." 
    });

  } catch (error) {
    console.error("Reject Error:", error);
    return NextResponse.json({ error: "Failed to reject request" }, { status: 500 });
  }
}