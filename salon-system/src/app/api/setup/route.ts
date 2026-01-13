import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();

    const email = "admin@velora.com";
    const password = "admin123"; // <--- WE ARE SETTING THIS PASSWORD

    // 1. Check if admin exists
    const existingAdmin = await User.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      // FIX: If admin exists, UPDATE their password instead of stopping
      existingAdmin.passwordHash = hashedPassword;
      existingAdmin.status = "ACTIVE";
      existingAdmin.role = "SUPER_ADMIN";
      await existingAdmin.save();
      
      return NextResponse.json({ message: "Admin Password RESET successfully to: admin123" });
    }

    // 2. If not exists, Create New
    await User.create({
      name: "Super Admin",
      email: email,
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    });

    return NextResponse.json({ message: "Admin Created! Password is: admin123" });

  } catch (error) {
    return NextResponse.json({ error: "Setup failed", details: error }, { status: 500 });
  }
}