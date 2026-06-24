import { NextResponse } from "next/server";
import { auth } from "@root/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/shipments/stats
export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [grouped, total, unassigned] = await Promise.all([
    prisma.shipment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.shipment.count(),
    prisma.shipment.count({
      where: {
        courierId: null,
        status: { notIn: ["DELIVERED", "CANCELLED", "RETURNED"] },
      },
    }),
  ]);

  const byStatus = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all])
  );

  return NextResponse.json({ total, unassigned, byStatus });
}
