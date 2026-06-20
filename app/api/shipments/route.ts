import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/shipments
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "STAFF";

  const where = {
    ...(isAdmin ? {} : { customerId: session.user.id }),
    ...(status ? { status: status as any } : {}),
  };

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        courier: { select: { id: true, name: true, email: true } },
        origin: true,
        destination: true,
        invoice: { select: { status: true, total: true } },
        _count: { select: { trackingEvents: true } },
      },
    }),
    prisma.shipment.count({ where }),
  ]);

  return NextResponse.json({
    shipments,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

// POST /api/shipments
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
    serviceType,
    weightKg,
    lengthCm,
    widthCm,
    heightCm,
    description,
    declaredValue,
    notes,
    estimatedDelivery,
    origin,   // address object
    destination, // address object
    parcels,  // optional array
  } = body;

  if (!weightKg || !origin || !destination) {
    return NextResponse.json(
      { error: "weightKg, origin, and destination are required" },
      { status: 400 }
    );
  }

  // Generate a human-readable tracking number
  const trackingNumber = `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber,
      customerId: session.user.id,
      serviceType: serviceType ?? "STANDARD",
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      description,
      declaredValue,
      notes,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,

      origin: {
        create: {
          userId: session.user.id,
          fullName: origin.fullName,
          phone: origin.phone,
          line1: origin.line1,
          line2: origin.line2,
          city: origin.city,
          state: origin.state,
          zip: origin.zip,
          country: origin.country ?? "US",
        },
      },
      destination: {
        create: {
          fullName: destination.fullName,
          phone: destination.phone,
          line1: destination.line1,
          line2: destination.line2,
          city: destination.city,
          state: destination.state,
          zip: destination.zip,
          country: destination.country ?? "US",
        },
      },

      parcels: parcels?.length
        ? {
            create: parcels.map((p: any) => ({
              label: p.label,
              weightKg: p.weightKg,
              lengthCm: p.lengthCm,
              widthCm: p.widthCm,
              heightCm: p.heightCm,
              contents: p.contents,
            })),
          }
        : undefined,

      // Log the first tracking event
      trackingEvents: {
        create: {
          status: "PENDING",
          note: "Shipment created and awaiting confirmation",
        },
      },
    },
    include: {
      origin: true,
      destination: true,
      parcels: true,
      trackingEvents: true,
    },
  });

  return NextResponse.json(shipment, { status: 201 });
    }
