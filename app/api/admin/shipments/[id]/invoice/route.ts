import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/shipments/[id]/invoice
// Body: { amount: number, tax?: number, dueDate?: string, status?: "DRAFT" | "SENT" }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { amount, tax, dueDate, status } = await req.json();

  if (typeof amount !== "number" || amount < 0) {
    return NextResponse.json(
      { error: "amount is required and must be a non-negative number" },
      { status: 400 }
    );
  }

  const taxAmount = typeof tax === "number" && tax >= 0 ? tax : 0;

  if (status !== undefined && !["DRAFT", "SENT"].includes(status)) {
    return NextResponse.json(
      { error: "status must be DRAFT or SENT when creating an invoice" },
      { status: 400 }
    );
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: { invoice: true },
  });

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  // Invoice.shipmentId is @unique — a shipment can only ever have one invoice.
  if (shipment.invoice) {
    return NextResponse.json(
      { error: "This shipment already has an invoice" },
      { status: 409 }
    );
  }

  const invoice = await prisma.invoice.create({
    data: {
      shipmentId: id,
      amount,
      tax: taxAmount,
      total: amount + taxAmount,
      status: status ?? "DRAFT",
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
