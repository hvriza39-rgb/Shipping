import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// GET /api/admin/users/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id:        true,
      name:      true,
      email:     true,
      phone:     true,
      role:      true,
      createdAt: true,
      addresses: true,
      shipments: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id:             true,
          trackingNumber: true,
          status:         true,
          serviceType:    true,
          createdAt:      true,
          destination: {
            select: { city: true, state: true },
          },
        },
      },
      deliveries: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id:             true,
          trackingNumber: true,
          status:         true,
          createdAt:      true,
        },
      },
      _count: {
        select: { shipments: true, deliveries: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH /api/admin/users/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    // Only ADMIN can change roles — not STAFF
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { role, name, phone } = await req.json();

  // Prevent demoting yourself
  if (id === session.user.id && role && role !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );
  }

  if (role && !(role in Role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(role  ? { role }  : {}),
      ...(name  ? { name }  : {}),
      ...(phone ? { phone } : {}),
    },
    select: {
      id:    true,
      name:  true,
      email: true,
      phone: true,
      role:  true,
    },
  });

  return NextResponse.json(updated);
}
