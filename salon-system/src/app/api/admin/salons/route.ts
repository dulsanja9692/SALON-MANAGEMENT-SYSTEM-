import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSalonWithOwner } from "@/services/salonService";

export async function POST(req: Request) {
  try {
    // 1. Security Check: Are you a Super Admin?
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Get Data from Request
    const body = await req.json();

    // 3. Call the Service
    const result = await createSalonWithOwner(body);

    return NextResponse.json({ success: true, data: result }, { status: 201 });

  } catch (error) {
    // Fix "Unexpected any" by casting error safely
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}