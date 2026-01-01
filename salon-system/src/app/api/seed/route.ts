import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Salon from "@/lib/models/Salon";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    // 1. Find the salon
    const targetSalonName = "velora"; // Make sure this matches your active salon
    const salon = await Salon.findOne({ name: targetSalonName });

    if (!salon) {
      return NextResponse.json({ error: `Salon '${targetSalonName}' not found.` }, { status: 404 });
    }

    // 2. Check if cashier already exists
    const cashierEmail = "cashier@velora.com";
    const existingUser = await User.findOne({ email: cashierEmail });
    
    if (existingUser) {
      // 🟢 SUCCESS CASE: If they already exist, just tell us!
      return NextResponse.json({ 
        message: "User already exists! You can login now.",
        user: { email: existingUser.email, role: existingUser.role }
      });
    }

    // 3. Create the cashier
    const hashedPassword = await bcrypt.hash("cashier123", 10);
    const newCashier = await User.create({
      name: `${targetSalonName} Cashier`,
      email: cashierEmail,
      password: hashedPassword,
      role: "Cashier",
      salonId: salon._id
    });

    return NextResponse.json({ success: true, message: "Cashier Created!", user: newCashier });

  } catch (error: unknown) {
    // 🔴 DEBUGGING: Print the ACTUAL error to the screen
    console.error("Seed Error:", error);
    return NextResponse.json({ 
      error: "Detailed Error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}