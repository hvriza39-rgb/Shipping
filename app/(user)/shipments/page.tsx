import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ShipmentsList from "@/components/user/ShipmentsList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Shipments | SwiftShip" };

export default async function ShipmentsPage() {
  const session = await auth();
  const userId  = session!.user.id;

  const shipments = await prisma.shipment.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, trackingNumber: true, status: true,
      serviceType: true, weightKg: true, createdAt: true,
      estimatedDelivery: true, deliveredAt: true,
      origin:      { select: { city: true, state: true } },
      destination: { select: { city: true, state: true } },
      invoice:     { select: { total: true, status: true } },
      _count:      { select: { trackingEvents: true } },
    },
  });

  const data = shipments.map((s) => ({
    ...s,
    status:            s.status as string,
    serviceType:       s.serviceType as string,
    createdAt:         s.createdAt.toISOString(),
    estimatedDelivery: s.estimatedDelivery?.toISOString() ?? null,
    deliveredAt:       s.deliveredAt?.toISOString()       ?? null,
    invoice: s.invoice
      ? { ...s.invoice, status: s.invoice.status as string }
      : null,
  }));

  return <ShipmentsList shipments={data} />;
    }
