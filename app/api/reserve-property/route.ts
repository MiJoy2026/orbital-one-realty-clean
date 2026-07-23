import { NextRequest, NextResponse } from "next/server";

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
import {
  appendCartReservation,
  getRequestCartReservationIds,
  MAX_CART_PROPERTIES,
} from "../../../lib/cart-reservations";
import {
  getCanonicalPropertyPrice,
  isPurchasablePropertyType,
  type PurchasablePropertyType,
} from "../../../lib/purchase-constants";

class ReservationConflictError extends Error {
  constructor(
    message: string,
    readonly status = 409
  ) {
    super(message);
  }
}

type ValidatedInventoryProperty = {
  propertyKey: string;
  propertyType: PurchasablePropertyType;
  stateName: string;
  cityName: string | null;
  townName: string | null;
  acreage: number | null;
  size: string;
  price: number;
  centerX: number;
  centerY: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const currentCartIds = getRequestCartReservationIds(request);

    if (currentCartIds.length >= MAX_CART_PROPERTIES) {
      const activeCartReservations = await prisma.propertyReservation.count({
        where: {
          id: { in: currentCartIds },
          status: "Reserved",
          expiresAt: { gt: new Date() },
        },
      });

      if (activeCartReservations >= MAX_CART_PROPERTIES) {
        return NextResponse.json(
          {
            error: `Your cart can hold up to ${MAX_CART_PROPERTIES} reserved properties at one time.`,
          },
          { status: 409 }
        );
      }
    }

    const stateName = String(body.stateName || "").trim();
    const propertyType = String(body.propertyType || "Rural Acre").trim();
    const propertyKey = String(body.parcelKey || "").trim().toUpperCase();

    if (!stateName || !propertyKey) {
      return NextResponse.json(
        { error: "State name and property key are required." },
        { status: 400 }
      );
    }

    if (!isPurchasablePropertyType(propertyType)) {
      return NextResponse.json(
        { error: "This property type is not available for reservation." },
        { status: 400 }
      );
    }

    /*
     * Never trust client-provided geometry. Rebuild inventory from the active
     * public geography and require the submitted key to exist in its correct
     * rural, city, or town territory before any reservation is written.
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
          price: getCanonicalPropertyPrice("Rural Acre"),
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
          price: getCanonicalPropertyPrice("City Block"),
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
          price: getCanonicalPropertyPrice("Town Block"),
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

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const reservation = await prisma.$transaction(async (transaction) => {
      /*
       * Serialize reservation attempts for this property key even when the
       * Property row has not been created yet.
       */
      await transaction.$queryRaw<Array<{ lockAcquired: number }>>`
        WITH reservation_lock AS (
          SELECT pg_advisory_xact_lock(
            hashtext(${inventoryProperty.propertyKey})
          )
        )
        SELECT 1 AS "lockAcquired"
        FROM reservation_lock
      `;

      const currentProperty = await transaction.property.upsert({
        where: {
          id: inventoryProperty.propertyKey,
        },
        update: {
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
          status: "Available",
          mapX: inventoryProperty.centerX,
          mapY: inventoryProperty.centerY,
        },
      });

      if (currentProperty.status === "Sold") {
        throw new ReservationConflictError(
          "This property has already been sold."
        );
      }

      const now = new Date();

      await transaction.propertyReservation.updateMany({
        where: {
          parcelKey: inventoryProperty.propertyKey,
          status: "Reserved",
          expiresAt: {
            lte: now,
          },
        },
        data: {
          status: "Expired",
        },
      });

      const existingReservation =
        await transaction.propertyReservation.findFirst({
          where: {
            parcelKey: inventoryProperty.propertyKey,
            status: "Reserved",
            expiresAt: {
              gt: now,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (existingReservation) {
        throw new ReservationConflictError(
          "This property is currently reserved."
        );
      }

      await transaction.property.update({
        where: {
          id: inventoryProperty.propertyKey,
        },
        data: {
          status: "Reserved",
        },
      });

      return transaction.propertyReservation.create({
        data: {
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
    });

    const response = NextResponse.json({
      success: true,
      reservationId: reservation.id,
      parcelKey: reservation.parcelKey,
      propertyType: reservation.propertyType,
      expiresAt: reservation.expiresAt,
    });

    appendCartReservation(request, response, reservation.id);
    return response;
  } catch (error) {
    if (error instanceof ReservationConflictError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("[Orbital One] Unable to reserve property.", error);

    return NextResponse.json(
      {
        error:
          "Property reservation is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }
}
