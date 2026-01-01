import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Salon from "@/lib/models/Salon";
import { auth } from "@/auth"; 

// ✅ CRITICAL FIX: Forces Node.js runtime to prevent crashes with bcrypt/mongoose
export const runtime = "nodejs";

// GET: Fetch all salons (Visible to authenticated users, or you can restrict this too)
export async function GET() {
  try {
    await connectDB();
    // Fetch salons, newest first
    const salons = await Salon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(salons);
  } catch {
    return NextResponse.json({ error: "Failed to fetch salons" }, { status: 500 });
  }
}

// PATCH: Approve or Reject a Salon (Protected: SuperAdmin ONLY)
export async function PATCH(req: Request) {
  try {
    const session = await auth(); 
    
    // 1. Check if logged in
    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // 2. 🛡️ SECURITY CHECK: Only SuperAdmin can approve/reject
    // This effectively stops random users from approving salons.
    if ((session.user as { role: string }).role !== "SuperAdmin") {
      return NextResponse.json({ error: "Unauthorized: SuperAdmin access required" }, { status: 403 });
    }

    const { salonId, status } = await req.json();

    await connectDB();

    // 3. Update the salon
    const updatedSalon = await Salon.findByIdAndUpdate(
      salonId, 
      { status }, 
      { new: true } // Return the updated document so the UI sees the change
    );

    if (!updatedSalon) {
        return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSalon);

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update salon" }, { status: 500 });
  }
}