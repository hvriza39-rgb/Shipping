import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/auth";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import { isValidTransition } from "@/lib/shipment-status";

// POST /api/admin/shipments/[id]/tracking
// Creates a tracking event and moves the shipment to the new status.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status, location, note } = await req.json();

  if (!status || !Object.values(ShipmentStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  if (!isValidTransition(shipment.status, status)) {
    return NextResponse.json(
      { error: `Cannot move from ${shipment.status} to ${status}` },
      { status: 400 }
    );
  }

  const updated = await prisma.shipment.update({
    where: { id },
    data: {
      status,
      ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      trackingEvents: {
        create: {
          status,
          location: location || null,
          note: note || null,
        },
      },
    },
    include: {
      trackingEvents: { orderBy: { createdAt: "desc" } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      courier:  { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(updated);
}
