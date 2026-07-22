import { NextResponse } from "next/server";

import { getPublicGeographySnapshot } from "../../../lib/lunasphere-geography-store";
import { getSelectableRuralParcelByKey } from "../../../lib/parcel-grid";
import { prisma } from "../../../lib/prisma";

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

  if (propertyType !== "Rural Acre") {
    return NextResponse.json(
      {
        error:
          "This reservation route currently supports rural acreage only.",
      },
      { status: 400 }
    );
  }

  /*
   * Never trust client-provided parcel coordinates. Rebuild the selectable
   * rural inventory from the active public geography and require the submitted
   * key to exist outside every city and town territory.
   */
  const publicGeography = await getPublicGeographySnapshot();
  const stateRegion = publicGeography.regions.find(
    (region) => region.name.toLowerCase() === stateName.toLowerCase()
  );

  if (!stateRegion) {
    return NextResponse.json(
      { error: "The selected LunaSphere state could not be found." },
      { status: 404 }
    );
  }

  const excludedTerritories = publicGeography.settlements
    .filter(
      (settlement) =>
        settlement.stateName.toLowerCase() === stateRegion.name.toLowerCase()
    )
    .map((settlement) => ({
      id: settlement.id,
      boundary: settlement.boundary,
    }));
  const parcel = getSelectableRuralParcelByKey(
    stateRegion.name,
    parcelKey,
    {
      stateBoundary: stateRegion.positions,
      excludedTerritories,
    }
  );

  if (!parcel) {
    return NextResponse.json(
      {
        error:
          "This parcel is not part of the current saleable rural territory.",
      },
      { status: 409 }
    );
  }

  const existingProperty = await prisma.property.findUnique({
    where: { id: parcel.parcelKey },
  });

  if (existingProperty?.status === "Sold") {
    return NextResponse.json(
      { error: "This parcel has already been sold." },
      { status: 409 }
    );
  }

  const existingReservation = await prisma.propertyReservation.findUnique({
    where: { parcelKey: parcel.parcelKey },
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
  const acreage = 1;

  await prisma.property.upsert({
    where: {
      id: parcel.parcelKey,
    },
    update: {
      status: "Reserved",
      state: stateRegion.name,
      city: null,
      town: null,
      type: propertyType,
      size: `${acreage} Acre`,
      price: 24.95,
      mapX: parcel.centerX,
      mapY: parcel.centerY,
    },
    create: {
      id: parcel.parcelKey,
      state: stateRegion.name,
      city: null,
      town: null,
      type: propertyType,
      size: `${acreage} Acre`,
      price: 24.95,
      status: "Reserved",
      mapX: parcel.centerX,
      mapY: parcel.centerY,
    },
  });

  const reservation = await prisma.propertyReservation.upsert({
    where: { parcelKey: parcel.parcelKey },
    update: {
      stateName: stateRegion.name,
      cityName: null,
      townName: null,
      propertyType,
      acreage,
      mapX: parcel.centerX,
      mapY: parcel.centerY,
      expiresAt,
      status: "Reserved",
    },
    create: {
      stateName: stateRegion.name,
      cityName: null,
      townName: null,
      parcelKey: parcel.parcelKey,
      propertyType,
      acreage,
      mapX: parcel.centerX,
      mapY: parcel.centerY,
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
