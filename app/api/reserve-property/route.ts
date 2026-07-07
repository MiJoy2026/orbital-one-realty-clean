import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const stateName = String(body.stateName || "").trim();
  const propertyType = String(body.propertyType || "Rural Acre").trim();
  const parcelKey = String(body.parcelKey || "").trim();

  if (!stateName || !parcelKey) {
    return NextResponse.json(
      { error: "State name and parcel key are required." },
      { status: 400 }
    );
  }

  const existingProperty = await prisma.property.findUnique({
    where: { id: parcelKey },
  });

  if (existingProperty?.status === "Sold") {
    return NextResponse.json(
      { error: "This parcel has already been sold." },
      { status: 409 }
    );
  }

  const existingReservation = await prisma.propertyReservation.findUnique({
    where: { parcelKey },
  });

  if (
    existingReservation &&
    existingReservation.expiresAt > new Date() &&
    existingReservation.status === "Reserved"
  ) {
    return NextResponse.json(
      { error: "This parcel is currently reserved." },
      { status: 409 }
    );
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.property.upsert({
  where: {
    id: parcelKey,
  },
  update: {
    status: "Reserved",
    state: stateName,
    city: body.cityName || null,
    town: body.townName || null,
    type: propertyType,
    size: body.acreage ? `${body.acreage} Acre` : "1 Acre",
    price: propertyType === "Rural Acre" ? 24.95 : 0,
    mapX: body.mapX ? Number(body.mapX) : null,
    mapY: body.mapY ? Number(body.mapY) : null,
  },
  create: {
    id: parcelKey,
    state: stateName,
    city: body.cityName || null,
    town: body.townName || null,
    type: propertyType,
    size: body.acreage ? `${body.acreage} Acre` : "1 Acre",
    price: propertyType === "Rural Acre" ? 24.95 : 0,
    status: "Reserved",
    mapX: body.mapX ? Number(body.mapX) : null,
    mapY: body.mapY ? Number(body.mapY) : null,
  },
});

  const reservation = await prisma.propertyReservation.upsert({
    where: { parcelKey },
    update: {
      expiresAt,
      status: "Reserved",
    },
    create: {
      stateName,
      cityName: body.cityName || null,
      townName: body.townName || null,
      parcelKey,
      propertyType,
      acreage: body.acreage ? Number(body.acreage) : null,
      mapX: body.mapX ? Number(body.mapX) : null,
      mapY: body.mapY ? Number(body.mapY) : null,
      expiresAt,
      status: "Reserved",
    },
  });

  return NextResponse.json({
    success: true,
    reservationId: reservation.id,
    parcelKey: reservation.parcelKey,
    expiresAt: reservation.expiresAt,
  });
}