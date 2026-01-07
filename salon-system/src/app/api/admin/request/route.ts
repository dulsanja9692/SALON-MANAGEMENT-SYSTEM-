import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. GET: Fetch all Pending Salon Owners
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Security Check: Only Super Admin can see this
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Find users who are Salon Owners AND waiting for approval
    const requests = await User.find({ 
      role: 'SALON_OWNER', 
      status: 'PENDING_APPROVAL' 
    }).select('-passwordHash'); // Don't send passwords to frontend

    return NextResponse.json(requests);

  } catch  {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// 2. PUT: Approve or Reject a Request
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, action } = await req.json(); // action = 'APPROVE' or 'REJECT'
    
    await connectDB();

    const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { status: newStatus },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: newStatus });

  } catch  {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}