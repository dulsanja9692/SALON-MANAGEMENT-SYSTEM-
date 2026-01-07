// src/scripts/seed.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User"; // Ensure this path matches your User model
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env.local");
  process.exit(1);
}

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to Database");

    // Check if Super Admin already exists
    const existingAdmin = await User.findOne({ role: "SUPER_ADMIN" });
    if (existingAdmin) {
      console.log("⚠️ Super Admin already exists.");
      process.exit();
    }

    // Create Super Admin
    const passwordHash = await bcrypt.hash("Admin@123", 10); // Default Password
    
    await User.create({
      name: "Super Admin",
      email: "admin@velora.com",
      passwordHash: passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    });

    console.log("🎉 Super Admin Created Successfully!");
    console.log("📧 Email: admin@velora.com");
    console.log("🔑 Password: Admin@123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedSuperAdmin();