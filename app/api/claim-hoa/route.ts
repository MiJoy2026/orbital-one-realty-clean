import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const certificateNumber = String(body.certificateNumber || "").trim();
  const deedName = String(body.deedName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  if (!certificateNumber || !deedName || !email) {
    return NextResponse.json(
      { error: "Certificate number, deed name, and email are required." },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { certificateNumber },
  });

  if (!order) {
    return NextResponse.json(
      { error: "No matching certificate was found." },
      { status: 404 }
    );
  }

  const deedMatches =
    order.deedName.trim().toLowerCase() === deedName.toLowerCase();

  const emailMatches =
    order.email?.toLowerCase() === email ||
    order.recipientEmail?.toLowerCase() === email;

  if (!deedMatches || !emailMatches) {
    return NextResponse.json(
      { error: "The information entered does not match our records." },
      { status: 403 }
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { hoaClaimed: true },
  });

  return NextResponse.json({
    success: true,
    propertyId: order.propertyId,
    certificateNumber: order.certificateNumber,
  });
}