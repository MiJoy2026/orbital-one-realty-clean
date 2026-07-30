import { randomInt } from "node:crypto";
import { appendCartReservation } from "../../../lib/cart-reservations";

import { NextRequest, NextResponse } from "next/server";

import { getSelectableCityBlockByKey } from "@/lib/city-block-grid";
import { getPublicGeographySnapshot } from "@/lib/lunasphere-geography-store";
import {
  getSelectableRuralParcelByKey,
  type ParcelCell,
} from "@/lib/parcel-grid";
import { prisma } from "@/lib/prisma";
import {
  getCanonicalPropertyAcreage,
  getCanonicalPropertyPrice,
  getCanonicalPropertySize,
  isPurchasablePropertyType,
  type PurchasablePropertyType,
} from "@/lib/purchase-constants";
import { getSelectableTownBlockByKey } from "@/lib/town-block-grid";

const MAXIMUM_PICK_ATTEMPTS = 220;
const RESERVATION_MINUTES = 15;

class CandidateUnavailableError extends Error {}

type QuickPickCandidate = {
  propertyId: string;
  propertyType: PurchasablePropertyType;
  stateName: string;
  cityName: string | null;
  townName: string | null;
  size: string;
  acreage: number | null;
  price: number;
  centerX: number;
  centerY: number;
};

function createStateSlug(stateName: string): string {
  return stateName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function padded(value: number, length: number): string {
  return value.toString().padStart(length, "0");
}

function chooseRandom<T>(items: readonly T[]): T | null {
  return items.length > 0 ? items[randomInt(items.length)] : null;
}

function randomGridPosition(maximumPlanningIndex: number) {
  return {
    planningColumn: randomInt(1, maximumPlanningIndex + 1),
    planningRow: randomInt(1, maximumPlanningIndex + 1),
    subdivisionColumn: randomInt(1, 6),
    subdivisionRow: randomInt(1, 6),
  };
}

function fromCell(
  cell: ParcelCell,
  propertyType: PurchasablePropertyType,
  input: {
    stateName: string;
    cityName?: string | null;
    townName?: string | null;
  }
): QuickPickCandidate {
  return {
    propertyId: cell.parcelKey,
    propertyType,
    stateName: input.stateName,
    cityName: input.cityName ?? null,
    townName: input.townName ?? null,
    size: getCanonicalPropertySize(propertyType),
    acreage: getCanonicalPropertyAcreage(propertyType),
    price: getCanonicalPropertyPrice(propertyType),
    centerX: cell.centerX,
    centerY: cell.centerY,
  };
}

async function reserveCandidate(candidate: QuickPickCandidate) {
  const expiresAt = new Date(
    Date.now() + RESERVATION_MINUTES * 60 * 1000
  );

  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw<Array<{ lockAcquired: number }>>`
      WITH quick_pick_lock AS (
        SELECT pg_advisory_xact_lock(hashtext(${candidate.propertyId}))
      )
      SELECT 1 AS "lockAcquired"
      FROM quick_pick_lock
    `;

    const property = await transaction.property.upsert({
      where: { id: candidate.propertyId },
      update: {
        state: candidate.stateName,
        city: candidate.cityName,
        town: candidate.townName,
        type: candidate.propertyType,
        size: candidate.size,
        price: candidate.price,
        mapX: candidate.centerX,
        mapY: candidate.centerY,
      },
      create: {
        id: candidate.propertyId,
        state: candidate.stateName,
        city: candidate.cityName,
        town: candidate.townName,
        type: candidate.propertyType,
        size: candidate.size,
        price: candidate.price,
        status: "Available",
        mapX: candidate.centerX,
        mapY: candidate.centerY,
      },
    });

    if (property.status === "Sold") {
      throw new CandidateUnavailableError();
    }

    const now = new Date();

    await transaction.propertyReservation.updateMany({
      where: {
        parcelKey: candidate.propertyId,
        status: "Reserved",
        expiresAt: { lte: now },
      },
      data: { status: "Expired" },
    });

    const activeReservation =
      await transaction.propertyReservation.findFirst({
        where: {
          parcelKey: candidate.propertyId,
          status: "Reserved",
          expiresAt: { gt: now },
        },
        select: { id: true },
      });

    if (activeReservation) {
      throw new CandidateUnavailableError();
    }

    await transaction.property.update({
      where: { id: candidate.propertyId },
      data: { status: "Reserved" },
    });

    return transaction.propertyReservation.create({
      data: {
        stateName: candidate.stateName,
        cityName: candidate.cityName,
        townName: candidate.townName,
        parcelKey: candidate.propertyId,
        propertyType: candidate.propertyType,
        acreage: candidate.acreage,
        mapX: candidate.centerX,
        mapY: candidate.centerY,
        expiresAt,
        status: "Reserved",
      },
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const propertyType = String(body.propertyType || "").trim();

    if (!isPurchasablePropertyType(propertyType)) {
      return NextResponse.json(
        { error: "Choose Half Acre, Rural Acre, Town Block, or City Block." },
        { status: 400 }
      );
    }

    const geography = await getPublicGeographySnapshot();
    const regions = geography.regions.filter(
      (region) => region.positions.length >= 3
    );
    const cities = geography.settlements.filter(
      (settlement) =>
        settlement.kind === "city" && settlement.boundary.length >= 3
    );
    const towns = geography.settlements.filter(
      (settlement) =>
        settlement.kind === "town" && settlement.boundary.length >= 3
    );
    const attemptedPropertyIds = new Set<string>();

    for (let attempt = 0; attempt < MAXIMUM_PICK_ATTEMPTS; attempt += 1) {
      let candidate: QuickPickCandidate | null = null;

      if (propertyType === "Rural Acre" || propertyType === "Half Acre") {
        const region = chooseRandom(regions);

        if (!region) break;

        const position = randomGridPosition(64);
        const propertyId = `${createStateSlug(region.name)}-R-C${padded(
          position.planningColumn,
          3
        )}-R${padded(position.planningRow, 3)}-SC${padded(
          position.subdivisionColumn,
          2
        )}-SR${padded(position.subdivisionRow, 2)}`;
        const excludedTerritories = geography.settlements
          .filter(
            (settlement) =>
              settlement.stateName.toLowerCase() ===
              region.name.toLowerCase()
          )
          .map((settlement) => ({
            id: settlement.id,
            boundary: settlement.boundary,
          }));
        const parcel = getSelectableRuralParcelByKey(
          region.name,
          propertyId,
          {
            stateBoundary: region.positions,
            excludedTerritories,
          }
        );

        if (parcel) {
          candidate = fromCell(parcel, propertyType, {
            stateName: region.name,
          });
        }
      }

      if (propertyType === "City Block") {
        const city = chooseRandom(cities);

        if (!city) break;

        const position = randomGridPosition(10);
        const propertyId = `${createStateSlug(city.stateName)}-CITY-${padded(
          city.territoryNumber,
          2
        )}-CB-C${padded(position.planningColumn, 3)}-R${padded(
          position.planningRow,
          3
        )}-SC${padded(position.subdivisionColumn, 2)}-SR${padded(
          position.subdivisionRow,
          2
        )}`;
        const block = getSelectableCityBlockByKey(city, propertyId);

        if (block) {
          candidate = fromCell(block, propertyType, {
            stateName: city.stateName,
            cityName: city.name,
          });
        }
      }

      if (propertyType === "Town Block") {
        const town = chooseRandom(towns);

        if (!town) break;

        const position = randomGridPosition(6);
        const propertyId = `${createStateSlug(town.stateName)}-TOWN-${padded(
          town.territoryNumber,
          2
        )}-TB-C${padded(position.planningColumn, 3)}-R${padded(
          position.planningRow,
          3
        )}-SC${padded(position.subdivisionColumn, 2)}-SR${padded(
          position.subdivisionRow,
          2
        )}`;
        const block = getSelectableTownBlockByKey(town, propertyId);

        if (block) {
          candidate = fromCell(block, propertyType, {
            stateName: town.stateName,
            townName: town.name,
          });
        }
      }

      if (!candidate || attemptedPropertyIds.has(candidate.propertyId)) {
        continue;
      }

      attemptedPropertyIds.add(candidate.propertyId);

      try {
        const reservation = await reserveCandidate(candidate);

        const response = NextResponse.json({
  success: true,
  reservationId: reservation.id,
  expiresAt: reservation.expiresAt.toISOString(),
  property: {
    propertyId: candidate.propertyId,
    propertyType: candidate.propertyType,
    stateName: candidate.stateName,
    cityName: candidate.cityName,
    townName: candidate.townName,
    size: candidate.size,
    price: candidate.price,
    mapX: candidate.centerX,
    mapY: candidate.centerY,
  },
});

appendCartReservation(request, response, reservation.id);

return response;
      } catch (error) {
        if (error instanceof CandidateUnavailableError) {
          continue;
        }

        throw error;
      }
    }

    return NextResponse.json(
      {
        error:
          "We could not secure an available property in this category right now. Please try again or choose one on the Moon Map.",
      },
      { status: 409 }
    );
  } catch (error) {
    console.error("[Orbital One] Quick Pick failed.", error);

    return NextResponse.json(
      {
        error:
          "Quick Pick is temporarily unavailable. Your card was not charged and no property was added.",
      },
      { status: 503 }
    );
  }
}
