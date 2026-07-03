import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/shipments — create a new shipment (customer)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    serviceType, weightKg, lengthCm, widthCm, heightCm,
    description, declaredValue, notes, estimatedDelivery,
    origin, destination,
  } = await req.json();

  // Validate required fields
  if (!serviceType || !weightKg || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!origin?.fullName || !origin?.phone || !origin?.line1 || !origin?.city || !origin?.state || !origin?.zip || !origin?.country) {
    return NextResponse.json(
      { error: "Invalid origin address" },
      { status: 400 }
    );
  }

  if (!destination?.fullName || !destination?.phone || !destination?.line1 || !destination?.city || !destination?.state || !destination?.zip || !destination?.country) {
    return NextResponse.json(
      { error: "Invalid destination address" },
      { status: 400 }
    );
  }

  try {
    const shipment = await prisma.shipment.create({
      data: {
    const shipment = await prisma.shipment.create({
  data: {
    customer: { connect: { id: session.user.id } },
    trackingNumber: await generateTrackingNumber(),
    status: "PENDING",
    serviceType,
    weightKg: parseFloat(weightKg),
    lengthCm: lengthCm ? parseFloat(lengthCm) : null,
    widthCm: widthCm ? parseFloat(widthCm) : null,
    heightCm: heightCm ? parseFloat(heightCm) : null,
    description,
    declaredValue: declaredValue ? parseFloat(declaredValue) : null,
    notes: notes || null,
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
    origin: {
      create: {
        fullName: origin.fullName,
        phone: origin.phone,
        line1: origin.line1,
        line2: origin.line2 || null,
        city: origin.city,
        state: origin.state,
        zip: origin.zip,
        country: origin.country,
      },
    },
    destination: {
      create: {
        fullName: destination.fullName,
        phone: destination.phone,
        line1: destination.line1,
        line2: destination.line2 || null,
        city: destination.city,
        state: destination.state,
        zip: destination.zip,
        country: destination.country,
      },
    },
    trackingEvents: {
      create: {
        status: "PENDING",
        note: "Shipment created and awaiting admin review and quote",
      },
    },
  },
  include: { origin: true, destination: true },
});

    return NextResponse.json(shipment, { status: 201 });
  } catch (error: any) {
    console.error("Shipment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}

// ─── Helper: generate unique tracking number ───────

async function generateTrackingNumber(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const segment1 = "SHP";
    const segment2 = Math.random().toString(36).substring(2, 8).toUpperCase();
    const segment3 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const candidate = `${segment1}-${segment2}-${segment3}`;

    const existing = await prisma.shipment.findUnique({
      where: { trackingNumber: candidate },
    });

    if (!existing) return candidate;
    attempts++;
  }

  throw new Error("Failed to generate unique tracking number");
}
