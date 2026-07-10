import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const reservationId = String(body.reservationId || "").trim();

  if (!reservationId) {
    return NextResponse.json(
      { error: "Reservation ID is required." },
      { status: 400 }
    );
  }

  const reservation = await prisma.propertyReservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation not found." },
      { status: 404 }
    );
  }

  await prisma.propertyReservation.update({
    where: { id: reservationId },
    data: { status: "Expired" },
  });

  await prisma.property.updateMany({
    where: {
      id: reservation.parcelKey,
      status: "Reserved",
    },
    data: {
      status: "Available",
    },
  });

  return NextResponse.json({
    success: true,
    parcelKey: reservation.parcelKey,
  });
}