import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Salon from "@/models/Salon";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 2. Create the User FIRST
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name: name,
      email: email,
      passwordHash: hashedPassword,
      role: "SALON_OWNER",
      status: "PENDING_DETAILS", 
    });

    // 👇 SAVE USER FIRST (This generates the _id)
    const savedUser = await newUser.save();

    // 3. Create the Salon (Now we have the ownerId!)
    const newSalon = new Salon({
      name: `${name}'s Salon`, 
      ownerId: savedUser._id,  // 👈 FIX: We use the ID from the saved user
      email: email,
      contactNumber: "0000000000",
      address: "Address Pending",
    });

    const savedSalon = await newSalon.save();

    // 4. Update User with Salon ID
    savedUser.salonId = savedSalon._id;
    await savedUser.save();

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}