import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";

// GET /api/admin/shipments
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status    = searchParams.get("status") as ShipmentStatus | null;
  const courierId = searchParams.get("courierId") ?? undefined;
  const search    = searchParams.get("search") ?? undefined; // tracking number or customer name
  const page      = parseInt(searchParams.get("page") ?? "1");
  const limit     = 25;
  const skip      = (page - 1) * limit;

  const where = {
    ...(status     ? { status }     : {}),
    ...(courierId  ? { courierId }  : {}),
    ...(search
      ? {
          OR: [
            { trackingNumber: { contains: search, mode: "insensitive" as const } },
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
            { customer: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer:    { select: { id: true, name: true, email: true, phone: true } },
        courier:     { select: { id: true, name: true, email: true } },
        origin:      { select: { city: true, state: true, country: true } },
        destination: { select: { city: true, state: true, country: true } },
        invoice:     { select: { status: true, total: true } },
        _count:      { select: { trackingEvents: true, parcels: true } },
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
