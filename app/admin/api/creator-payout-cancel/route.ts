import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const MAX_REASON_LENGTH = 1000;

class PayoutCancellationConflictError extends Error {
  constructor() {
    super("The payout changed while it was being cancelled.");
    this.name = "PayoutCancellationConflictError";
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<
      string,
      unknown
    >;
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    );
  }

  const payoutId = String(body.payoutId || "").trim();
  const cancellationReason = String(
    body.cancellationReason || ""
  ).trim();

  if (!payoutId) {
    return NextResponse.json(
      { error: "A valid payout record is required." },
      { status: 400 }
    );
  }

  if (!cancellationReason) {
    return NextResponse.json(
      {
        error:
          "A reason is required before cancelling a payout.",
      },
      { status: 400 }
    );
  }

  if (cancellationReason.length > MAX_REASON_LENGTH) {
    return NextResponse.json(
      {
        error:
          `The cancellation reason cannot exceed ` +
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
          WITH creator_payout_cancellation_lock AS (
            SELECT pg_advisory_xact_lock(
              hashtext(
                ${`creator-payout-cancel:${payoutId}`}
              )
            )
          )
          SELECT 1 AS "lockAcquired"
          FROM creator_payout_cancellation_lock
        `;

        const payout =
          await transaction.creatorPayout.findUnique({
            where: {
              id: payoutId,
            },
            include: {
              creatorPartner: {
                select: {
                  id: true,
                  fullName: true,
                  trackingCode: true,
                },
              },
              commissions: {
                select: {
                  id: true,
                  status: true,
                  payoutId: true,
                  paidAt: true,
                },
              },
                            balanceAdjustments: {
                select: {
                  id: true,
                  payoutId: true,
                  paidAt: true,
                },
              },
            },
          });

        if (!payout) {
          return {
            kind: "not-found" as const,
          };
        }

        if (payout.status === "Cancelled") {
          return {
            kind: "already-cancelled" as const,
            payoutId: payout.id,
            creatorPartner: payout.creatorPartner,
          };
        }

        if (payout.status === "Paid") {
          return {
            kind: "already-paid" as const,
          };
        }

        if (payout.status !== "Pending") {
          return {
            kind: "invalid-status" as const,
            currentStatus: payout.status,
          };
        }

        if (
          payout.commissions.length === 0 &&
          payout.balanceAdjustments.length === 0
        ) {
          return {
            kind: "no-commissions" as const,
          };
        }

        const invalidCommission =
          payout.commissions.find(
            (commission) =>
              commission.payoutId !== payout.id ||
              commission.status !== "Approved" ||
              commission.paidAt !== null
          );

        if (invalidCommission) {
          return {
            kind: "invalid-commission" as const,
          };
        }

                const invalidBalanceAdjustment =
          payout.balanceAdjustments.find(
            (adjustment) =>
              adjustment.payoutId !== payout.id ||
              adjustment.paidAt !== null
          );

        if (invalidBalanceAdjustment) {
          return {
            kind: "invalid-balance-adjustment" as const,
          };
        }

        const commissionIds = payout.commissions.map(
          (commission) => commission.id
        );

        const commissionUpdate =
          await transaction.creatorCommission.updateMany({
            where: {
              id: {
                in: commissionIds,
              },
              payoutId: payout.id,
              status: "Approved",
              paidAt: null,
            },
            data: {
              payoutId: null,
            },
          });

        if (
          commissionUpdate.count !==
          payout.commissions.length
        ) {
          throw new PayoutCancellationConflictError();
        }

                const balanceAdjustmentIds =
          payout.balanceAdjustments.map(
            (adjustment) => adjustment.id
          );

        if (balanceAdjustmentIds.length > 0) {
          const balanceAdjustmentUpdate =
            await transaction.creatorBalanceAdjustment.updateMany({
              where: {
                id: {
                  in: balanceAdjustmentIds,
                },
                payoutId: payout.id,
                paidAt: null,
              },
              data: {
                payoutId: null,
              },
            });

          if (
            balanceAdjustmentUpdate.count !==
            payout.balanceAdjustments.length
          ) {
            throw new PayoutCancellationConflictError();
          }
        }

        const cancelledAt = new Date();

        const cancellationNote =
          `Cancellation reason ` +
          `(${cancelledAt.toISOString()}): ` +
          cancellationReason;

        const combinedNotes = [
          payout.notes?.trim(),
          cancellationNote,
        ]
          .filter(Boolean)
          .join("\n\n");

        const payoutUpdate =
          await transaction.creatorPayout.updateMany({
            where: {
              id: payout.id,
              status: "Pending",
              paidAt: null,
            },
            data: {
              status: "Cancelled",
              method: null,
              reference: null,
              notes: combinedNotes,
              paidAt: null,
            },
          });

        if (payoutUpdate.count !== 1) {
          throw new PayoutCancellationConflictError();
        }

        return {
          kind: "cancelled" as const,
          payoutId: payout.id,
          creatorPartner: payout.creatorPartner,
          amountCents: payout.amountCents,
          commissionCount: payout.commissions.length,
          balanceAdjustmentCount:
            payout.balanceAdjustments.length,
          cancelledAt,
        };
      }
    );

    if (result.kind === "not-found") {
      return NextResponse.json(
        { error: "Creator Partner payout not found." },
        { status: 404 }
      );
    }

    if (result.kind === "already-paid") {
      return NextResponse.json(
        {
          error:
            "A paid payout cannot be cancelled.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "invalid-status") {
      return NextResponse.json(
        {
          error:
            `Only pending payouts can be cancelled. ` +
            `This payout is currently ${result.currentStatus}.`,
        },
        { status: 409 }
      );
    }

    if (result.kind === "no-commissions") {
      return NextResponse.json(
        {
          error:
            "This payout does not contain any commission records.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "invalid-commission") {
      return NextResponse.json(
        {
          error:
            "One or more commissions in this payout cannot be released safely.",
        },
        { status: 409 }
      );
    }

        if (
      result.kind ===
      "invalid-balance-adjustment"
    ) {
      return NextResponse.json(
        {
          error:
            "One or more balance adjustments in this payout cannot be released safely.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "already-cancelled") {
      return NextResponse.json({
        success: true,
        alreadyCancelled: true,
        payoutId: result.payoutId,
        creatorPartner: result.creatorPartner,
      });
    }

    return NextResponse.json({
      success: true,
      alreadyCancelled: false,
      payoutId: result.payoutId,
      creatorPartner: result.creatorPartner,
      amountCents: result.amountCents,
      commissionCount: result.commissionCount,
      balanceAdjustmentCount:
        result.balanceAdjustmentCount,
      cancelledAt: result.cancelledAt.toISOString(),
    });
  } catch (error) {
    if (
      error instanceof PayoutCancellationConflictError
    ) {
      return NextResponse.json(
        {
          error:
            "The payout changed while it was being cancelled. Refresh the dashboard and try again.",
        },
        { status: 409 }
      );
    }

    console.error(
      "Unable to cancel Creator Partner payout:",
      error
    );

    return NextResponse.json(
      {
        error:
          "The Creator Partner payout could not be cancelled.",
      },
      { status: 500 }
    );
  }
}