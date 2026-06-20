import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/auth";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";

// POST /api/shipments/[id]/tracking
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "STAFF";
  const isCourier = session.user.role === "COURIER";

  if (!isAdmin && !isCourier) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, location, note } = body;

  if (!status || !(status in ShipmentStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({ where: { id } });

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  // Couriers can only log events on their assigned shipments
  if (isCourier && shipment.courierId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create the event and sync shipment status in one transaction
  const [event, updated] = await prisma.$transaction([
    prisma.trackingEvent.create({
      data: {
        shipmentId: id,
        status,
        location: location ?? null,
        note: note ?? null,
      },
    }),
    prisma.shipment.update({
      where: { id },
      data: {
        status,
        ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      },
    }),
  ]);

  return NextResponse.json({ event, shipment: updated }, { status: 201 });
}

// GET /api/shipments/[id]/tracking
// Authenticated — full event history with internal notes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "STAFF";

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    select: { customerId: true, courierId: true },
  });

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const canView =
    isAdmin ||
    shipment.customerId === session.user.id ||
    shipment.courierId === session.user.id;

  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const events = await prisma.trackingEvent.findMany({
    where: { shipmentId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(events);
}
