import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const allowedStatuses = new Set(["Available", "Sold"]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    );
  }

  const propertyId = String(body.propertyId || "")
    .trim()
    .toUpperCase();

  const status = String(body.status || "").trim();

  if (!propertyId || !allowedStatuses.has(status)) {
    return NextResponse.json(
      { error: "A valid property ID and status are required." },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw<Array<{ lockAcquired: number }>>`
      WITH property_status_lock AS (
        SELECT pg_advisory_xact_lock(hashtext(${propertyId}))
      )
      SELECT 1 AS "lockAcquired"
      FROM property_status_lock
    `;

    const property = await transaction.property.findUnique({
      where: {
        id: propertyId,
      },
    });

    if (!property) {
      return {
        kind: "not-found" as const,
      };
    }

    const activeReservation =
      await transaction.propertyReservation.findFirst({
        where: {
          parcelKey: propertyId,
          status: "Reserved",
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
        },
      });

    if (activeReservation) {
      return {
        kind: "active-reservation" as const,
      };
    }

    if (status === "Available") {
      const paidOrder = await transaction.order.findFirst({
        where: {
          propertyId,
          paymentStatus: {
            equals: "Paid",
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      if (paidOrder) {
        return {
          kind: "paid-order" as const,
      };
      }
    }

    const updatedProperty = await transaction.property.update({
      where: {
        id: propertyId,
      },
      data: {
        status,
      },
    });

    return {
      kind: "updated" as const,
      property: updatedProperty,
    };
  });

  if (result.kind === "not-found") {
    return NextResponse.json(
      { error: "Property not found." },
      { status: 404 }
    );
  }

  if (result.kind === "active-reservation") {
    return NextResponse.json(
      {
        error:
          "This property has an active customer reservation and cannot be changed.",
      },
      { status: 409 }
    );
  }

  if (result.kind === "paid-order") {
    return NextResponse.json(
      {
        error:
          "A paid order exists for this property. A sold property cannot be returned to available inventory.",
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    success: true,
    property: result.property,
  });
}