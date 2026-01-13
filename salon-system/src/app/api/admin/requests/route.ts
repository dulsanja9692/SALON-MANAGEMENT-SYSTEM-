import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Security Check
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    console.log("Admin fetching requests..."); 

    // 2. FETCH QUERY: Get all Salon Owners who are NOT Active
    const requests = await User.find({ 
      role: 'SALON_OWNER', 
      status: { $ne: 'ACTIVE' } // Fetches PENDING_APPROVAL, PENDING_DETAILS, REJECTED
    }).select('-passwordHash'); 

    console.log(`Found ${requests.length} pending requests.`);

    return NextResponse.json(requests);

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, action } = await req.json();
    
    await connectDB();

    const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';
    
    // 1. Perform the update
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { status: newStatus },
      { new: true }
    );

    // 2. 👇 ADD THIS CHECK (This uses the variable, so the warning disappears)
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: newStatus });

  } catch  {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}