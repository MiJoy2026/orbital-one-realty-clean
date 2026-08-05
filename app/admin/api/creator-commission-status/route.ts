import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const VALID_ACTIONS = new Set(["deny", "restore"]);
const MAX_REASON_LENGTH = 500;

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

  const commissionId = String(
    body.commissionId || ""
  ).trim();

  const action = String(body.action || "")
    .trim()
    .toLowerCase();

  const denialReason = String(
    body.denialReason || ""
  ).trim();

  if (!commissionId || !VALID_ACTIONS.has(action)) {
    return NextResponse.json(
      {
        error:
          "A valid commission record and action are required.",
      },
      { status: 400 }
    );
  }

  if (action === "deny" && !denialReason) {
    return NextResponse.json(
      {
        error:
          "A reason is required before excluding a commission.",
      },
      { status: 400 }
    );
  }

  if (denialReason.length > MAX_REASON_LENGTH) {
    return NextResponse.json(
      {
        error: `The reason cannot exceed ${MAX_REASON_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(
    async (transaction) => {
      await transaction.$queryRaw<
        Array<{ lockAcquired: number }>
      >`
        WITH creator_commission_status_lock AS (
          SELECT pg_advisory_xact_lock(
            hashtext(${commissionId})
          )
        )
        SELECT 1 AS "lockAcquired"
        FROM creator_commission_status_lock
      `;

      const commission =
        await transaction.creatorCommission.findUnique({
          where: {
            id: commissionId,
          },
          select: {
            id: true,
            status: true,
            monthKey: true,
            creatorPartnerId: true,
            denialReason: true,
          },
        });

      if (!commission) {
        return {
          kind: "not-found" as const,
        };
      }

      if (action === "deny") {
        if (commission.status === "Denied") {
          return {
            kind: "already-denied" as const,
            commission,
          };
        }

        if (commission.status !== "Pending") {
          return {
            kind: "not-pending" as const,
            currentStatus: commission.status,
          };
        }

        const updatedCommission =
          await transaction.creatorCommission.update({
            where: {
              id: commissionId,
            },
            data: {
              status: "Denied",
              deniedAt: new Date(),
              denialReason,
              approvedAt: null,
              commissionRateBps: null,
              commissionAmountCents: null,
            },
            select: {
              id: true,
              status: true,
              monthKey: true,
              creatorPartnerId: true,
              denialReason: true,
              deniedAt: true,
            },
          });

        return {
          kind: "denied" as const,
          commission: updatedCommission,
        };
      }

      if (commission.status === "Pending") {
        return {
          kind: "already-pending" as const,
          commission,
        };
      }

      if (commission.status !== "Denied") {
        return {
          kind: "not-denied" as const,
          currentStatus: commission.status,
        };
      }

      const restoredCommission =
        await transaction.creatorCommission.update({
          where: {
            id: commissionId,
          },
          data: {
            status: "Pending",
            deniedAt: null,
            denialReason: null,
            approvedAt: null,
            commissionRateBps: null,
            commissionAmountCents: null,
          },
          select: {
            id: true,
            status: true,
            monthKey: true,
            creatorPartnerId: true,
            denialReason: true,
            deniedAt: true,
          },
        });

      return {
        kind: "restored" as const,
        commission: restoredCommission,
      };
    }
  );

  if (result.kind === "not-found") {
    return NextResponse.json(
      { error: "Commission record not found." },
      { status: 404 }
    );
  }

  if (result.kind === "not-pending") {
    return NextResponse.json(
      {
        error:
          `Only pending commissions can be excluded. ` +
          `This record is currently ${result.currentStatus}.`,
      },
      { status: 409 }
    );
  }

  if (result.kind === "not-denied") {
    return NextResponse.json(
      {
        error:
          `Only excluded commissions can be restored. ` +
          `This record is currently ${result.currentStatus}.`,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    success: true,
    alreadyUpdated:
      result.kind === "already-denied" ||
      result.kind === "already-pending",
    commission: result.commission,
  });
}