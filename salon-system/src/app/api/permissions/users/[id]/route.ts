import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Define the type for Params as a Promise
type Params = Promise<{ id: string }>;

// Define the type for User update data
interface UpdateUserData {
  email: string;
  contactNumber: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  passwordHash?: string;
}

// 1. PUT: Update User
export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 👇 FIX: Await the params object first
    const { id } = await params;

    const { username, mobile, role, status, password } = await req.json();

    await connectDB();

    // Prepare update data
    const updateData: UpdateUserData = {
      email: username,
      contactNumber: mobile,
      role,
      status: status ? 'ACTIVE' : 'INACTIVE'
    };

    // Only update password if a new one is provided
    if (password && password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    return NextResponse.json({ success: true, user: updatedUser });

  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// 2. DELETE: Remove User
export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    // RBAC: Only Super Admin or Salon Owner can delete
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'SALON_OWNER')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 👇 FIX: Await the params object first
    const { id } = await params;

    await connectDB();
    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}