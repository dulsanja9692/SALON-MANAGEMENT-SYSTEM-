import mongoose from "mongoose";
import User from "../models/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const seed = async () => {
  try {
      await mongoose.connect(process.env.MONGODB_URI!);
      // Check if admin exists
      const exists = await User.findOne({ email: "admin@salon.com" });
      if (exists) {
          console.log("Admin already exists.");
          process.exit();
      }

      // Create Admin
      const pass = await bcrypt.hash("admin123", 10);
      await User.create({ 
          name: "Super Admin", 
          email: "admin@salon.com", 
          password: pass, 
          role: "SuperAdmin" 
      });

      console.log("SUCCESS: Admin created (admin@salon.com / admin123)");
      process.exit();
  } catch (e) {
      console.error(e);
      process.exit(1);
  }
};
seed();