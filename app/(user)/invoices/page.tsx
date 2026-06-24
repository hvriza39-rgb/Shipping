import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import InvoicesList from "@/components/user/InvoicesList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Invoices | SwiftShip" };

export default async function InvoicesPage() {
  const session = await auth();
  const userId  = session!.user.id;

  const invoices = await prisma.invoice.findMany({
    where: { shipment: { customerId: userId } },
    orderBy: { createdAt: "desc" },
    include: {
      shipment: {
        select: {
          id: true, trackingNumber: true, serviceType: true,
          origin:      { select: { city: true, state: true } },
          destination: { select: { city: true, state: true } },
        },
      },
    },
  });

  const data = invoices.map((inv) => ({
    ...inv,
    status:    inv.status as string,
    createdAt: inv.createdAt.toISOString(),
    dueDate:   inv.dueDate?.toISOString() ?? null,
    paidAt:    inv.paidAt?.toISOString()  ?? null,
    shipment: {
      ...inv.shipment,
      serviceType: inv.shipment.serviceType as string,
    },
  }));

  return <InvoicesList invoices={data} />;
      }
