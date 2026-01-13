import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Branch from "@/models/Branch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    let query = {};
    if (session.user.role === 'SALON_OWNER') {
        query = { salonId: session.user.id };
    } else if (session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Permission Denied" }, { status: 403 });
    }

    const branches = await Branch.find(query).sort({ createdAt: -1 });
    return NextResponse.json(branches);

  } catch {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SALON_OWNER' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👇 Added 'email' and 'type'
    const { name, type, address, contactNumber, email, status } = await req.json();

    await connectDB();
    const salonId = session.user.role === 'SALON_OWNER' ? session.user.id : session.user.id;

    const newBranch = new Branch({
      name,
      type,
      address,
      contactNumber,
      email,
      salonId, 
      status: status ? 'ACTIVE' : 'INACTIVE',
    });

    await newBranch.save();
    return NextResponse.json({ success: true, branch: newBranch }, { status: 201 });

  } catch  {
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}