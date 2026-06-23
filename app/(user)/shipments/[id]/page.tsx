import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ShipmentDetail from "@/components/user/ShipmentDetail";

export const metadata = { title: "Shipment Details | SwiftShip" };

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId  = session!.user.id;

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      origin:         true,
      destination:    true,
      parcels:        true,
      trackingEvents: { orderBy: { createdAt: "asc" } },
      courier:        { select: { id: true, name: true, email: true, phone: true } },
      invoice:        true,
    },
  });

  if (!shipment) notFound();
  if (shipment.customerId !== userId) redirect("/shipments");

  const data = {
    ...shipment,
    status:            shipment.status as string,
    serviceType:       shipment.serviceType as string,
    createdAt:         shipment.createdAt.toISOString(),
    updatedAt:         shipment.updatedAt.toISOString(),
    estimatedDelivery: shipment.estimatedDelivery?.toISOString() ?? null,
    deliveredAt:       shipment.deliveredAt?.toISOString()       ?? null,
    trackingEvents: shipment.trackingEvents.map((e) => ({
      ...e,
      status:    e.status as string,
      createdAt: e.createdAt.toISOString(),
    })),
    invoice: shipment.invoice
      ? {
          ...shipment.invoice,
          status:    shipment.invoice.status as string,
          createdAt: shipment.invoice.createdAt.toISOString(),
          dueDate:   shipment.invoice.dueDate?.toISOString() ?? null,
          paidAt:    shipment.invoice.paidAt?.toISOString()  ?? null,
        }
      : null,
  };

  return <ShipmentDetail shipment={data} />;
}
