import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tracking/[trackingNumber]
// Public route — no auth needed
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  const { trackingNumber } = await params;

  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    select: {
      id: true,
      trackingNumber: true,
      status: true,
      serviceType: true,
      estimatedDelivery: true,
      deliveredAt: true,
      createdAt: true,
      carrierName: true,
      carrierTrackingId: true,
      weightKg: true,
      description: true,

      // Only expose what's needed publicly
      origin: {
        select: {
          city: true,
          state: true,
          country: true,
        },
      },
      destination: {
        select: {
          city: true,
          state: true,
          country: true,
        },
      },

      trackingEvents: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          status: true,
          location: true,
          note: true,
          createdAt: true,
        },
      },

      parcels: {
        select: {
          id: true,
          label: true,
          weightKg: true,
          contents: true,
        },
      },
    },
  });

  if (!shipment) {
    return NextResponse.json(
      { error: "No shipment found with that tracking number" },
      { status: 404 }
    );
  }

  return NextResponse.json(shipment);
}
