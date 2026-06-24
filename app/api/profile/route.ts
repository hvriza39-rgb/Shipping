import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone: phone ?? null },
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json(user);
}
