import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch Services for the logged-in Salon
export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user.salonId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const services = await Service.find({ salonId: session.user.salonId });
    return NextResponse.json(services);
  } catch  {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST: Create a New Service
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!session || !session.user.salonId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newService = await Service.create({
      ...body,
      salonId: session.user.salonId,
    });

    return NextResponse.json(newService, { status: 201 });
  } catch  {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

// DELETE: Remove a Service
export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await Service.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted" });
    } catch {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}