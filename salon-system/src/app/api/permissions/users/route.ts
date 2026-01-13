import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 👇 IMPORTANT: This line stops the caching issue!
export const dynamic = 'force-dynamic';

// 1. GET: Fetch Users for the List
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    let query = {};

    if (session.user.role === 'SUPER_ADMIN') {
      query = {}; 
    } else if (session.user.role === 'SALON_OWNER') {
      query = { salonId: session.user.id }; 
    } else {
      return NextResponse.json({ error: "Permission Denied" }, { status: 403 });
    }

    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    
    // 👇 Add headers to tell the browser not to cache this either
    return NextResponse.json(users, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });

  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// ... (Your POST function remains the same, no changes needed there) ...
import bcrypt from "bcryptjs"; // Ensure imports are correct for POST if you copy/paste the whole file
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { username, mobile, password, role, status } = await req.json();
    const requesterRole = session.user.role;

    if (requesterRole !== 'SUPER_ADMIN' && requesterRole !== 'SALON_OWNER') {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    if (requesterRole === 'SALON_OWNER') {
      const forbiddenRoles = ['SUPER_ADMIN', 'SALON_OWNER'];
      if (forbiddenRoles.includes(role)) {
        return NextResponse.json({ error: "Cannot create this role." }, { status: 403 });
      }
    }

    await connectDB();

    const existingUser = await User.findOne({ $or: [{ email: username }, { contactNumber: mobile }] });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedSalonId = requesterRole === 'SALON_OWNER' ? session.user.id : null; 

    const newUser = new User({
      name: username.split('@')[0], 
      email: username,
      contactNumber: mobile,
      passwordHash: hashedPassword,
      role: role,
      salonId: assignedSalonId,
      status: status ? 'ACTIVE' : 'INACTIVE',
    });

    await newUser.save();

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}