import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// GET /api/admin/users
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role   = searchParams.get("role") as Role | null;
  const search = searchParams.get("search") ?? undefined;
  const page   = parseInt(searchParams.get("page") ?? "1");
  const limit  = 25;
  const skip   = (page - 1) * limit;

  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name:  { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id:        true,
        name:      true,
        email:     true,
        phone:     true,
        role:      true,
        createdAt: true,
        _count: {
          select: {
            shipments:  true,
            deliveries: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}
