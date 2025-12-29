import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Salon from "@/lib/models/Salon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch all salons (for the Admin Table)
export async function GET() {
  try {
    await connectDB();
    // Sort by newest first
    const salons = await Salon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(salons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch salons" }, { status: 500 });
  }
}

// PATCH: Approve or Reject a Salon
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security: Only SuperAdmin can do this
    if (!session || !session.user || session.user.role !== "SuperAdmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { salonId, status } = await req.json();

    await connectDB();

    const updatedSalon = await Salon.findByIdAndUpdate(
      salonId, 
      { status }, 
      { new: true }
    );

    return NextResponse.json(updatedSalon);

  } catch (error) {
    return NextResponse.json({ error: "Failed to update salon" }, { status: 500 });
  }
}