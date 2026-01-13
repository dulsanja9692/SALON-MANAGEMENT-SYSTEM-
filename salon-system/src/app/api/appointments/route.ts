import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user.salonId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch appointments only for this salon
    const appointments = await Appointment.find({ salonId: session.user.salonId })
      .sort({ date: 1, time: 1 }); // Sort by date/time

    return NextResponse.json(appointments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!session || !session.user.salonId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newAppointment = await Appointment.create({
      ...body,
      salonId: session.user.salonId, // Automatically link to logged-in salon
      status: "PENDING" // Default status
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch  {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}