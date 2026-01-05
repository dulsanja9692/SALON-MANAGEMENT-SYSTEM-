import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // 1. Get data from the frontend request
    const body = await req.json();
    const { customerId, staffId, serviceId, date, salonId } = body;

    // 2. Validate: Check if everything is there
    if (!customerId || !staffId || !serviceId || !date || !salonId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Find the Service details (We need the duration to calculate end time)
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // 4. Create the Appointment
    const newAppointment = await Appointment.create({
      salonId,
      customer: customerId,
      staff: staffId,
      service: serviceId,
      appointmentDate: new Date(date), // Ensure it's a valid Date object
      duration: service.duration,      // Automatically pull duration from the service
      status: "confirmed"
    });

    return NextResponse.json({ 
      success: true, 
      message: "Appointment Booked Successfully!", 
      appointment: newAppointment 
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}