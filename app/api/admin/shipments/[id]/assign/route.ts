import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/shipments/[id]/assign
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { courierId } = await req.json();

  // courierId can be null to unassign
  if (courierId !== null && courierId !== undefined) {
    const courier = await prisma.user.findUnique({ where: { id: courierId } });

    if (!courier || courier.role !== "COURIER") {
      return NextResponse.json(
        { error: "User not found or is not a courier" },
        { status: 400 }
      );
    }
  }

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const updated = await prisma.shipment.update({
    where: { id },
    data: {
      courierId: courierId ?? null,
      // Auto-confirm when a courier is assigned
      ...(courierId && shipment.status === "PENDING"
        ? { status: "CONFIRMED" }
        : {}),
      ...(courierId && shipment.status === "PENDING"
        ? {
            trackingEvents: {
              create: {
                status: "CONFIRMED",
                note: "Shipment confirmed and courier assigned",
              },
            },
          }
        : {}),
    },
    include: {
      courier: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(updated);
}
