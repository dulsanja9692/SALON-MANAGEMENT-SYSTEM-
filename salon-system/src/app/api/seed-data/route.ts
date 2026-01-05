import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import User from "@/models/User";
import Salon from "@/models/Salon";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    // 1. Find the Salon (Or create a dummy one if missing)
    let salon = await Salon.findOne({ name: "velora" });
    if (!salon) {
       salon = await Salon.findOne(); // Grab any salon
    }
    if (!salon) return NextResponse.json({ error: "No Salon found. Register a user first." }, { status: 404 });

    // 2. GET or CREATE Services
    let services = await Service.find({ salonId: salon._id });
    
    if (services.length === 0) {
      services = await Service.insertMany([
        { name: "Men's Haircut", price: 25, duration: 30, salonId: salon._id },
        { name: "Women's Layer Cut", price: 45, duration: 60, salonId: salon._id },
        { name: "Express Facial", price: 35, duration: 45, salonId: salon._id }
      ]);
      console.log("Creating new services...");
    }

    // 3. GET or CREATE Staff
    let staff = await User.findOne({ email: "john@velora.com" });
    if (!staff) {
        const hashedPass = await bcrypt.hash("staff123", 10);
        staff = await User.create({
            name: "John Barber",
            email: "john@velora.com",
            password: hashedPass,
            role: "Staff",
            salonId: salon._id,
            specialties: [services[0]._id]
        });
    }

    // 4. RETURN THE IDs YOU NEED
    return NextResponse.json({ 
      success: true, 
      message: "Here is your data for testing!",
      data: {
          salonId: salon._id,
          serviceId: services[0]._id, // This is the ID for "Men's Haircut"
          staffId: staff._id,
          customerId: salon._id // Just use SalonID as a dummy customer ID for now
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}