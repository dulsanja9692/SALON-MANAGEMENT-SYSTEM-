import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Security Check
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await connectDB();

    // Prepare the update object with the profile data (name, address, etc.)
    const updateData: Record<string, unknown> = { ...data };

    // 🔒 LOGIC ONLY FOR SALON OWNERS 🔒
    // If the user is a Salon Owner, move them to 'PENDING_APPROVAL' so Admin can check them.
    // If the user is Staff/Manager, DO NOT change their status (they stay ACTIVE).
    if (session.user.role === 'SALON_OWNER') {
      updateData.status = 'PENDING_APPROVAL';
    }

    // 2. Perform the Update
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true } // Return the updated user document
    );

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}