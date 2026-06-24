import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfilePage from "@/components/user/ProfilePage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile | SwiftShip" };

export default async function Profile() {
  const session = await auth();
  const userId  = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, createdAt: true,
      _count: { select: { shipments: true } },
    },
  });

  const data = {
    ...user!,
    role:      user!.role as string,
    createdAt: user!.createdAt.toISOString(),
  };

  return <ProfilePage user={data} />;
}
