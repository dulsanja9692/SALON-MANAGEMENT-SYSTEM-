import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Branch from "@/models/Branch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    
    // Convert boolean status back to string if necessary
    const updateData = {
        ...body,
        status: body.status ? 'ACTIVE' : 'INACTIVE'
    };

    await connectDB();
    const updatedBranch = await Branch.findByIdAndUpdate(id, updateData, { new: true });
    
    return NextResponse.json({ success: true, branch: updatedBranch });
  } catch {
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    await Branch.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}