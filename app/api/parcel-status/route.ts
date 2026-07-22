import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PARCEL_KEYS = 5000;
const DATABASE_RETRY_DELAYS_MS = [200, 600];

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function queryPropertyStatuses(parcelKeys: string[]) {
  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= DATABASE_RETRY_DELAYS_MS.length;
    attempt += 1
  ) {
    try {
      const [properties, reservations] = await Promise.all([
        prisma.property.findMany({
          where: {
            id: {
              in: parcelKeys,
            },
          },
          select: {
            id: true,
            status: true,
          },
        }),
        prisma.propertyReservation.findMany({
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
        }),
      ]);

      return {
        properties,
        reservations,
      };
    } catch (error) {
      lastError = error;

      if (attempt >= DATABASE_RETRY_DELAYS_MS.length) {
        break;
      }

      await wait(DATABASE_RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      parcelKeys?: unknown;
    };

    const parcelKeys = Array.isArray(body.parcelKeys)
      ? Array.from(
          new Set(
            body.parcelKeys
              .map(String)
              .map((parcelKey) => parcelKey.trim())
              .filter(Boolean)
          )
        ).slice(0, MAX_PARCEL_KEYS)
      : [];

    if (parcelKeys.length === 0) {
      return NextResponse.json({ statuses: {} });
    }

    const { properties, reservations } =
      await queryPropertyStatuses(parcelKeys);

    const statuses: Record<string, string> = {};

    for (const property of properties) {
      statuses[property.id] = property.status;
    }

    for (const reservation of reservations) {
      statuses[reservation.parcelKey] = reservation.status;
    }

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error(
      "[LunaSphere] Unable to load property statuses.",
      error
    );

    return NextResponse.json(
      {
        error:
          "Property availability is temporarily unavailable. Please try again.",
        statuses: {},
      },
      {
        status: 503,
      }
    );
  }
}
