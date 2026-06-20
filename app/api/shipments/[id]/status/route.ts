import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/auth";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";

// PATCH /api/shipments/[id]/status
export async function PATCH(
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

  // Couriers can only update their assigned shipments
  if (isCourier && shipment.courierId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.shipment.update({
    where: { id },
    data: {
      status,
      ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      trackingEvents: {
        create: {
          status,
          location: location ?? null,
          note: note ?? null,
        },
      },
    },
    include: {
      trackingEvents: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(updated);
}
