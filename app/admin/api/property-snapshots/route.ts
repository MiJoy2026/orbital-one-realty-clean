import { NextResponse } from "next/server";

import {
  backfillMissingOwnedPropertySnapshots,
  ensureOwnedPropertySnapshotsForOrderIds,
  inspectOwnedPropertySnapshotEligibilityForOrderIds,
} from "../../../../lib/owned-property-snapshot";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const [paidOrders, snapshotCount] = await Promise.all([
    prisma.order.findMany({
      where: {
        paymentStatus: { equals: "Paid", mode: "insensitive" },
      },
      select: {
        id: true,
        propertySnapshot: { select: { id: true } },
      },
    }),
    prisma.ownedPropertySnapshot.count(),
  ]);
  const missingOrders = paidOrders.filter((order) => !order.propertySnapshot);
  const eligibility = await inspectOwnedPropertySnapshotEligibilityForOrderIds(
    missingOrders.map((order) => order.id)
  );

  return NextResponse.json({
    paidOrderCount: paidOrders.length,
    snapshotCount,
    missingSnapshotCount: eligibility.filter((item) => item.eligible).length,
    historicalPriorGeographyCount: eligibility.filter((item) => !item.eligible)
      .length,
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const orderId =
    typeof body.orderId === "string" ? body.orderId.trim() : "";
  const limitValue = Number(body.limit);
  const limit = Number.isFinite(limitValue)
    ? Math.max(1, Math.min(Math.trunc(limitValue), 250))
    : 100;

  try {
    if (orderId) {
      const [eligibility] =
        await inspectOwnedPropertySnapshotEligibilityForOrderIds([orderId]);

      if (eligibility && !eligibility.eligible) {
        return NextResponse.json({
          result: {
            requestedOrderCount: 1,
            existingSnapshotCount: 0,
            createdSnapshotCount: 0,
            failedSnapshotCount: 0,
            failures: [],
            snapshotIds: [],
            historicalOrder: true,
            historicalReason: eligibility.reason,
          },
        });
      }
    }

    const result = orderId
      ? await ensureOwnedPropertySnapshotsForOrderIds([orderId])
      : await backfillMissingOwnedPropertySnapshots(limit);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[Orbital One] Property snapshot backfill failed.", error);

    return NextResponse.json(
      { error: "Property snapshots could not be generated." },
      { status: 500 }
    );
  }
}
