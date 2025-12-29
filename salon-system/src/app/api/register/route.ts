import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Salon from "@/lib/models/Salon";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { salonName, ownerName, email, password } = await req.json();

    await connectDB();

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 2. Create the Salon first (Status: Pending by default)
    const newSalon = await Salon.create({
      name: salonName,
      status: "Pending", // Important for Ticket 153 later
    });

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the Salon Owner linked to that Salon
    await User.create({
      name: ownerName,
      email,
      password: hashedPassword,
      role: "SalonOwner",
      salonId: newSalon._id,
      isActive: true, // They can login, but might see a "Pending" screen
    });

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}