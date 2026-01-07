import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// 👇 POST: Save Profile Details
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // Getting the new data from frontend
    const { name, phone, nicNumber, address, nicImage, businessReg } = body;

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. Update Name
    if (name) user.name = name;

    // 2. Update New Fields to DB
    user.contactNumber = phone;
    user.nicNumber = nicNumber;
    user.address = address;

    // 3. Handle Role-Specific Logic
    if (user.role === 'SUPER_ADMIN') {
      user.verification.nicFront = nicImage;
      user.status = 'ACTIVE'; // Auto-activate Admin
    } else {
      user.verification.nicFront = nicImage;
      user.verification.businessReg = businessReg;
      user.status = 'PENDING_APPROVAL'; // Send Owner to waiting room
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      role: user.role, 
      status: user.status 
    });

  } catch (error: unknown) {
    // Log the actual error to console for debugging
    console.error("Update Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Database update failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// 👇 GET: Fetch Profile Details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id).select('-passwordHash');

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.contactNumber, 
      nicNumber: user.nicNumber, 
      address: user.address,     
      nicImage: user.verification?.nicFront || '',
      businessReg: user.verification?.businessReg || '',
      role: user.role,
      status: user.status
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}