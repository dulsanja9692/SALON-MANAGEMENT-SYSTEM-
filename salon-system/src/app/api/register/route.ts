import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Salon from "@/models/Salon";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Validate Input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    // 2. Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 3. Create User Instance
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name: name,
      email: email,
      passwordHash: hashedPassword,
      role: "SALON_OWNER",
      status: "PENDING_DETAILS", 
    });

    // 👇 SAVE USER FIRST (Generates the _id)
    const savedUser = await newUser.save();

    // 4. Create Salon (Now we have the ownerId!)
    const newSalon = new Salon({
      name: `${name}'s Salon`, 
      ownerId: savedUser._id,  // 👈 FIX: This prevents the error
      email: email,
      contactNumber: "0000000000",
      address: "Address Pending",
    });

    const savedSalon = await newSalon.save();

    // 5. Update User with Salon ID
    savedUser.salonId = savedSalon._id;
    await savedUser.save();

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error: unknown) {
    console.error("Registration Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}