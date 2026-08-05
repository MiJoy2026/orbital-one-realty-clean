import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const MAX_REASON_LENGTH = 1000;

class CommissionAdjustmentConflictError extends Error {
  constructor() {
    super("The commission changed while it was being adjusted.");
    this.name = "CommissionAdjustmentConflictError";
  }
}

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

  const adjustmentCents = Number(body.adjustmentCents);

  const adjustmentReason = String(
    body.adjustmentReason || ""
  ).trim();

  if (!commissionId) {
    return NextResponse.json(
      { error: "A valid commission record is required." },
      { status: 400 }
    );
  }

  if (!Number.isSafeInteger(adjustmentCents)) {
    return NextResponse.json(
      {
        error:
          "The commission adjustment must be a valid whole number of cents.",
      },
      { status: 400 }
    );
  }

  if (!adjustmentReason) {
    return NextResponse.json(
      {
        error:
          "A documented reason is required for every commission adjustment.",
      },
      { status: 400 }
    );
  }

  if (adjustmentReason.length > MAX_REASON_LENGTH) {
    return NextResponse.json(
      {
        error:
          `The adjustment reason cannot exceed ` +
          `${MAX_REASON_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw<
          Array<{ lockAcquired: number }>
        >`
          WITH creator_commission_adjustment_lock AS (
            SELECT pg_advisory_xact_lock(
              hashtext(
                ${`creator-commission-adjustment:${commissionId}`}
              )
            )
          )
          SELECT 1 AS "lockAcquired"
          FROM creator_commission_adjustment_lock
        `;

        const commission =
          await transaction.creatorCommission.findUnique({
            where: {
              id: commissionId,
            },
            select: {
              id: true,
              status: true,
              payoutId: true,
              paidAt: true,
              commissionAmountCents: true,
              adjustmentCents: true,
              adjustmentReason: true,
            },
          });

        if (!commission) {
          return {
            kind: "not-found" as const,
          };
        }

        if (commission.status !== "Approved") {
          return {
            kind: "invalid-status" as const,
            currentStatus: commission.status,
          };
        }

        if (
          commission.payoutId !== null ||
          commission.paidAt !== null
        ) {
          return {
            kind: "already-assigned" as const,
          };
        }

        if (commission.commissionAmountCents === null) {
          return {
            kind: "missing-amount" as const,
          };
        }

        const finalCommissionCents =
          commission.commissionAmountCents +
          adjustmentCents;

        if (finalCommissionCents < 0) {
          return {
            kind: "negative-total" as const,
            baseCommissionCents:
              commission.commissionAmountCents,
            requestedAdjustmentCents: adjustmentCents,
          };
        }

        if (
          commission.adjustmentCents === adjustmentCents &&
          commission.adjustmentReason === adjustmentReason
        ) {
          return {
            kind: "already-updated" as const,
            commission,
            finalCommissionCents,
          };
        }

        const adjustedAt = new Date();

        const updateResult =
          await transaction.creatorCommission.updateMany({
            where: {
              id: commissionId,
              status: "Approved",
              payoutId: null,
              paidAt: null,
              commissionAmountCents: {
                not: null,
              },
            },
            data: {
              adjustmentCents,
              adjustmentReason,
              adjustedAt,
            },
          });

        if (updateResult.count !== 1) {
          throw new CommissionAdjustmentConflictError();
        }

        return {
          kind: "updated" as const,
          commissionId,
          baseCommissionCents:
            commission.commissionAmountCents,
          adjustmentCents,
          finalCommissionCents,
          adjustmentReason,
          adjustedAt,
        };
      }
    );

    if (result.kind === "not-found") {
      return NextResponse.json(
        { error: "Commission record not found." },
        { status: 404 }
      );
    }

    if (result.kind === "invalid-status") {
      return NextResponse.json(
        {
          error:
            `Only approved commissions can be adjusted. ` +
            `This record is currently ${result.currentStatus}.`,
        },
        { status: 409 }
      );
    }

    if (result.kind === "already-assigned") {
      return NextResponse.json(
        {
          error:
            "A commission cannot be adjusted after it has been assigned to a payout.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "missing-amount") {
      return NextResponse.json(
        {
          error:
            "This approved commission does not have a calculated base amount.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "negative-total") {
      return NextResponse.json(
        {
          error:
            "The adjustment cannot reduce the final commission below zero.",
          baseCommissionCents:
            result.baseCommissionCents,
          requestedAdjustmentCents:
            result.requestedAdjustmentCents,
        },
        { status: 409 }
      );
    }

    if (result.kind === "already-updated") {
      return NextResponse.json({
        success: true,
        alreadyUpdated: true,
        commissionId: result.commission.id,
        baseCommissionCents:
          result.commission.commissionAmountCents,
        adjustmentCents:
          result.commission.adjustmentCents,
        finalCommissionCents:
          result.finalCommissionCents,
        adjustmentReason:
          result.commission.adjustmentReason,
      });
    }

    return NextResponse.json({
      success: true,
      alreadyUpdated: false,
      commissionId: result.commissionId,
      baseCommissionCents:
        result.baseCommissionCents,
      adjustmentCents: result.adjustmentCents,
      finalCommissionCents:
        result.finalCommissionCents,
      adjustmentReason:
        result.adjustmentReason,
      adjustedAt: result.adjustedAt.toISOString(),
    });
  } catch (error) {
    if (
      error instanceof CommissionAdjustmentConflictError
    ) {
      return NextResponse.json(
        {
          error:
            "The commission changed while the adjustment was being saved. Refresh the dashboard and try again.",
        },
        { status: 409 }
      );
    }

    console.error(
      "Unable to adjust Creator Partner commission:",
      error
    );

    return NextResponse.json(
      {
        error:
          "The Creator Partner commission adjustment could not be saved.",
      },
      { status: 500 }
    );
  }
}