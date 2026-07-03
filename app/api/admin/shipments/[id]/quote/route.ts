import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/shipments/[id]/quote
// Body: { quotedPrice: number, finalPrice?: number }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { quotedPrice, finalPrice } = await req.json();

  if (typeof quotedPrice !== "number" || quotedPrice < 0) {
    return NextResponse.json(
      { error: "quotedPrice is required and must be non-negative" },
      { status: 400 }
    );
  }

  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  // Only allow quoting PENDING shipments
  if (shipment.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only PENDING shipments can be quoted" },
      { status: 400 }
    );
  }

  const updated = await prisma.shipment.update({
    where: { id },
    data: {
      quotedPrice,
      finalPrice: finalPrice !== undefined ? finalPrice : quotedPrice,
      // Optionally transition to CONFIRMED if you want; leaving as PENDING for now so admin must explicitly confirm
    },
  });

  return NextResponse.json(updated);
}
