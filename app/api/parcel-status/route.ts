import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const parcelKeys = Array.isArray(body.parcelKeys)
    ? body.parcelKeys.map(String)
    : [];

  if (parcelKeys.length === 0) {
    return NextResponse.json({ statuses: {} });
  }

  const properties = await prisma.property.findMany({
    where: {
      id: {
        in: parcelKeys,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  const reservations = await prisma.propertyReservation.findMany({
    where: {
      parcelKey: {
        in: parcelKeys,
      },
      status: "Reserved",
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      parcelKey: true,
      status: true,
    },
  });

  const statuses: Record<string, string> = {};

  for (const property of properties) {
    statuses[property.id] = property.status;
  }

  for (const reservation of reservations) {
    statuses[reservation.parcelKey] = reservation.status;
  }

  return NextResponse.json({ statuses });
}