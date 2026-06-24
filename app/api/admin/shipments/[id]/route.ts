import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/shipments/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      customer:       { select: { id: true, name: true, email: true, phone: true } },
      courier:        { select: { id: true, name: true, email: true, phone: true } },
      origin:         true,
      destination:    true,
      trackingEvents: { orderBy: { createdAt: "asc" } },
      parcels:        true,
      invoice:        true,
    },
  });

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  return NextResponse.json(shipment);
}
