import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Receipt from "@/components/user/Receipt";

export const metadata = { title: "Shipment Receipt | SwiftShip" };

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: { origin: true, destination: true, invoice: true },
  });

  if (!shipment) notFound();
  if (shipment.customerId !== session.user.id) redirect("/shipments");

  const data = {
    ...shipment,
    status:            shipment.status as string,
    serviceType:       shipment.serviceType as string,
    createdAt:         shipment.createdAt.toISOString(),
    updatedAt:         shipment.updatedAt.toISOString(),
    estimatedDelivery: shipment.estimatedDelivery?.toISOString() ?? null,
    deliveredAt:       shipment.deliveredAt?.toISOString() ?? null,
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

  return <Receipt shipment={data} />;
}
