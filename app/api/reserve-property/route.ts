import { NextResponse } from "next/server";

import {
  getSelectableCityBlockByKey,
  parseCityBlockKey,
} from "../../../lib/city-block-grid";
import { getPublicGeographySnapshot } from "../../../lib/lunasphere-geography-store";
import { getSelectableRuralParcelByKey } from "../../../lib/parcel-grid";
import { prisma } from "../../../lib/prisma";
import {
  getSelectableTownBlockByKey,
  parseTownBlockKey,
} from "../../../lib/town-block-grid";

const SUPPORTED_PROPERTY_TYPES = [
  "Rural Acre",
  "City Block",
  "Town Block",
] as const;
type SupportedPropertyType = (typeof SUPPORTED_PROPERTY_TYPES)[number];

type ValidatedInventoryProperty = {
  propertyKey: string;
  propertyType: SupportedPropertyType;
  stateName: string;
  cityName: string | null;
  townName: string | null;
  acreage: number | null;
  size: string;
  price: number;
  centerX: number;
  centerY: number;
};

export async function POST(request: Request) {
  const body = await request.json();
  const stateName = String(body.stateName || "").trim();
  const propertyType = String(body.propertyType || "Rural Acre").trim();
  const propertyKey = String(body.parcelKey || "").trim().toUpperCase();

  if (!stateName || !propertyKey) {
    return NextResponse.json(
      { error: "State name and property key are required." },
      { status: 400 }
    );
  }

  if (
    !SUPPORTED_PROPERTY_TYPES.includes(
      propertyType as SupportedPropertyType
    )
  ) {
    return NextResponse.json(
      {
        error:
          "This reservation route does not support that property type yet.",
      },
      { status: 400 }
    );
  }

  /*
   * Never trust client-provided geometry. Rebuild inventory from the active
   * public geography and require the submitted key to exist in its correct
   * rural or city territory before any reservation is written.
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

  let inventoryProperty: ValidatedInventoryProperty | null = null;

  if (propertyType === "Rural Acre") {
    const excludedTerritories = publicGeography.settlements
      .filter(
        (settlement) =>
          settlement.stateName.toLowerCase() ===
          stateRegion.name.toLowerCase()
      )
      .map((settlement) => ({
        id: settlement.id,
        boundary: settlement.boundary,
      }));
    const parcel = getSelectableRuralParcelByKey(
      stateRegion.name,
      propertyKey,
      {
        stateBoundary: stateRegion.positions,
        excludedTerritories,
      }
    );

    if (parcel) {
      inventoryProperty = {
        propertyKey: parcel.parcelKey,
        propertyType: "Rural Acre",
        stateName: stateRegion.name,
        cityName: null,
        townName: null,
        acreage: 1,
        size: "1 Acre",
        price: 24.95,
        centerX: parcel.centerX,
        centerY: parcel.centerY,
      };
    }
  }

  if (propertyType === "City Block") {
    const parsedKey = parseCityBlockKey(propertyKey);
    const city = parsedKey
      ? publicGeography.settlements.find(
          (settlement) =>
            settlement.kind === "city" &&
            settlement.stateName.toLowerCase() ===
              stateRegion.name.toLowerCase() &&
            settlement.territoryNumber === parsedKey.cityNumber
        )
      : null;
    const block = city
      ? getSelectableCityBlockByKey(city, propertyKey)
      : null;

    if (city && block) {
      inventoryProperty = {
        propertyKey: block.parcelKey,
        propertyType: "City Block",
        stateName: stateRegion.name,
        cityName: city.name,
        townName: null,
        acreage: null,
        size: "1 City Block",
        price: 54.95,
        centerX: block.centerX,
        centerY: block.centerY,
      };
    }
  }

  if (propertyType === "Town Block") {
    const parsedKey = parseTownBlockKey(propertyKey);
    const town = parsedKey
      ? publicGeography.settlements.find(
          (settlement) =>
            settlement.kind === "town" &&
            settlement.stateName.toLowerCase() ===
              stateRegion.name.toLowerCase() &&
            settlement.territoryNumber === parsedKey.townNumber
        )
      : null;
    const block = town
      ? getSelectableTownBlockByKey(town, propertyKey)
      : null;

    if (town && block) {
      inventoryProperty = {
        propertyKey: block.parcelKey,
        propertyType: "Town Block",
        stateName: stateRegion.name,
        cityName: null,
        townName: town.name,
        acreage: null,
        size: "1 Town Block",
        price: 39.95,
        centerX: block.centerX,
        centerY: block.centerY,
      };
    }
  }

  if (!inventoryProperty) {
    return NextResponse.json(
      {
        error:
          propertyType === "City Block"
            ? "This block is not part of the current saleable city inventory."
            : propertyType === "Town Block"
              ? "This block is not part of the current saleable town inventory."
              : "This parcel is not part of the current saleable rural territory.",
      },
      { status: 409 }
    );
  }

  const existingProperty = await prisma.property.findUnique({
    where: { id: inventoryProperty.propertyKey },
  });

  if (existingProperty?.status === "Sold") {
    return NextResponse.json(
      { error: "This property has already been sold." },
      { status: 409 }
    );
  }

  const existingReservation = await prisma.propertyReservation.findUnique({
    where: { parcelKey: inventoryProperty.propertyKey },
  });

  if (
    existingReservation &&
    existingReservation.expiresAt > new Date() &&
    existingReservation.status === "Reserved"
  ) {
    return NextResponse.json(
      { error: "This property is currently reserved." },
      { status: 409 }
    );
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.property.upsert({
    where: {
      id: inventoryProperty.propertyKey,
    },
    update: {
      status: "Reserved",
      state: inventoryProperty.stateName,
      city: inventoryProperty.cityName,
      town: inventoryProperty.townName,
      type: inventoryProperty.propertyType,
      size: inventoryProperty.size,
      price: inventoryProperty.price,
      mapX: inventoryProperty.centerX,
      mapY: inventoryProperty.centerY,
    },
    create: {
      id: inventoryProperty.propertyKey,
      state: inventoryProperty.stateName,
      city: inventoryProperty.cityName,
      town: inventoryProperty.townName,
      type: inventoryProperty.propertyType,
      size: inventoryProperty.size,
      price: inventoryProperty.price,
      status: "Reserved",
      mapX: inventoryProperty.centerX,
      mapY: inventoryProperty.centerY,
    },
  });

  const reservation = await prisma.propertyReservation.upsert({
    where: { parcelKey: inventoryProperty.propertyKey },
    update: {
      stateName: inventoryProperty.stateName,
      cityName: inventoryProperty.cityName,
      townName: inventoryProperty.townName,
      propertyType: inventoryProperty.propertyType,
      acreage: inventoryProperty.acreage,
      mapX: inventoryProperty.centerX,
      mapY: inventoryProperty.centerY,
      expiresAt,
      status: "Reserved",
    },
    create: {
      stateName: inventoryProperty.stateName,
      cityName: inventoryProperty.cityName,
      townName: inventoryProperty.townName,
      parcelKey: inventoryProperty.propertyKey,
      propertyType: inventoryProperty.propertyType,
      acreage: inventoryProperty.acreage,
      mapX: inventoryProperty.centerX,
      mapY: inventoryProperty.centerY,
      expiresAt,
      status: "Reserved",
    },
  });

  return NextResponse.json({
    success: true,
    reservationId: reservation.id,
    parcelKey: reservation.parcelKey,
    propertyType: reservation.propertyType,
    expiresAt: reservation.expiresAt,
  });
}
