import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Dashboard from "@/components/user/Dashboard";

export const metadata = { title: "Dashboard | SwiftShip" };

export default async function DashboardPage() {
  const session = await auth();
  const userId  = session!.user.id;

  const [raw, counts] = await Promise.all([
  prisma.shipment.findMany({ ... }),
  prisma.shipment.groupBy({ ... }),
]);

const shipments = raw.map((s) => ({
  ...s,
  status:      s.status as string,
  serviceType: s.serviceType as string,
  createdAt:   s.createdAt.toISOString(),

  const total     = counts.reduce((a, c) => a + c._count, 0);
  const delivered = counts.find((c) => c.status === "DELIVERED")?._count ?? 0;
  const active    = counts
    .filter((c) => ["CONFIRMED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(c.status))
    .reduce((a, c) => a + c._count, 0);
  const pending   = counts.find((c) => c.status === "PENDING")?._count ?? 0;

  return (
    <Dashboard
      user={{ name: session!.user.name ?? "" }}
      shipments={shipments}
      stats={{ total, delivered, active, pending }}
    />
  );
}
