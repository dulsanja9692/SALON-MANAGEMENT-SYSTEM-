import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Salon from "@/lib/models/Salon";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // 1. Get the data from the frontend
    const body = await req.json();
    const { name, email, password } = body; // 👈 We grab 'name' here

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 2. Create the Salon first
    // We use the 'name' from the form as the Salon Name
    const newSalon = await Salon.create({
      name: name, 
      status: "Pending", 
    });

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the Owner User (Linked to the Salon)
    await User.create({
      name: name, // The owner also uses this name
      email,
      password: hashedPassword,
      role: "SalonOwner", // Automatically assign Owner role
      salonId: newSalon._id, // Link them to their new salon
    });

    return NextResponse.json({ message: "Registration Successful!" }, { status: 201 });

  } catch (error: unknown) {
    console.error("Registration Error:", error); // This helps debug in console
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 });
  }
}