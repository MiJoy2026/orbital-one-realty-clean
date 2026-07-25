import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
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
      return NextResponse.json({ success: true, released: false });
    }

    if (reservation.status !== "Reserved") {
      return NextResponse.json({
        success: true,
        released: false,
        parcelKey: reservation.parcelKey,
      });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw<Array<{ lockAcquired: number }>>`
        WITH release_lock AS (
          SELECT pg_advisory_xact_lock(hashtext(${reservation.parcelKey}))
        )
        SELECT 1 AS "lockAcquired"
        FROM release_lock
      `;

      await transaction.propertyReservation.updateMany({
        where: {
          id: reservation.id,
          status: "Reserved",
        },
        data: { status: "Expired" },
      });

      const anotherActiveReservation =
        await transaction.propertyReservation.findFirst({
          where: {
            parcelKey: reservation.parcelKey,
            id: { not: reservation.id },
            status: "Reserved",
            expiresAt: { gt: new Date() },
          },
          select: { id: true },
        });

      if (!anotherActiveReservation) {
        await transaction.property.updateMany({
          where: {
            id: reservation.parcelKey,
            status: "Reserved",
          },
          data: { status: "Available" },
        });
      }
    });

    return NextResponse.json({
      success: true,
      released: true,
      parcelKey: reservation.parcelKey,
    });
  } catch (error) {
    console.error("[Orbital One] Unable to release reservation.", error);

    return NextResponse.json(
      { error: "Unable to release this reservation right now." },
      { status: 503 }
    );
  }
}
