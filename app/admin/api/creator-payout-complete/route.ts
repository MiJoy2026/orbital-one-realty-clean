import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const MAX_METHOD_LENGTH = 100;
const MAX_REFERENCE_LENGTH = 250;
const MAX_NOTES_LENGTH = 1000;

class PayoutCompletionConflictError extends Error {
  constructor() {
    super("The payout changed while it was being completed.");
    this.name = "PayoutCompletionConflictError";
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
  const method = String(body.method || "").trim();
  const reference = String(body.reference || "").trim();
  const completionNotes = String(body.notes || "").trim();

  if (!payoutId) {
    return NextResponse.json(
      { error: "A valid payout record is required." },
      { status: 400 }
    );
  }

  if (!method) {
    return NextResponse.json(
      { error: "The payment method is required." },
      { status: 400 }
    );
  }

  if (!reference) {
    return NextResponse.json(
      {
        error:
          "A payment confirmation or transaction reference is required.",
      },
      { status: 400 }
    );
  }

  if (method.length > MAX_METHOD_LENGTH) {
    return NextResponse.json(
      {
        error:
          `The payment method cannot exceed ` +
          `${MAX_METHOD_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  if (reference.length > MAX_REFERENCE_LENGTH) {
    return NextResponse.json(
      {
        error:
          `The payment reference cannot exceed ` +
          `${MAX_REFERENCE_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  if (completionNotes.length > MAX_NOTES_LENGTH) {
    return NextResponse.json(
      {
        error:
          `The payout notes cannot exceed ` +
          `${MAX_NOTES_LENGTH} characters.`,
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
          WITH creator_payout_completion_lock AS (
            SELECT pg_advisory_xact_lock(
              hashtext(
                ${`creator-payout-complete:${payoutId}`}
              )
            )
          )
          SELECT 1 AS "lockAcquired"
          FROM creator_payout_completion_lock
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
                  commissionAmountCents: true,
                  adjustmentCents: true,
                  paidAt: true,
                },
              },
              balanceAdjustments: {
                select: {
                  id: true,
                  payoutId: true,
                  amountCents: true,
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

        if (payout.status === "Paid") {
          return {
            kind: "already-paid" as const,
            payout,
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
              commission.paidAt !== null ||
              commission.commissionAmountCents === null
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

                const calculatedCommissionCents =
          payout.commissions.reduce(
            (total, commission) =>
              total +
              (commission.commissionAmountCents || 0) +
              commission.adjustmentCents,
            0
          );

        const calculatedBalanceAdjustmentCents =
          payout.balanceAdjustments.reduce(
            (total, adjustment) =>
              total + adjustment.amountCents,
            0
          );

        const calculatedAmountCents =
          calculatedCommissionCents +
          calculatedBalanceAdjustmentCents;

        if (
          calculatedAmountCents !== payout.amountCents
        ) {
          return {
            kind: "amount-mismatch" as const,
            recordedAmountCents: payout.amountCents,
            calculatedAmountCents,
          };
        }

        const paidAt = new Date();

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
              status: "Paid",
              paidAt,
            },
          });

        if (
          commissionUpdate.count !==
          payout.commissions.length
        ) {
          throw new PayoutCompletionConflictError();
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
                paidAt,
              },
            });

          if (
            balanceAdjustmentUpdate.count !==
            payout.balanceAdjustments.length
          ) {
            throw new PayoutCompletionConflictError();
          }
        }

        const combinedNotes = [
          payout.notes?.trim(),
          completionNotes,
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
              status: "Paid",
              method,
              reference,
              notes: combinedNotes || null,
              paidAt,
            },
          });

        if (payoutUpdate.count !== 1) {
          throw new PayoutCompletionConflictError();
        }

        return {
          kind: "completed" as const,
          payoutId: payout.id,
          creatorPartner:
            payout.creatorPartner,
          amountCents: payout.amountCents,
          commissionCount:
            payout.commissions.length,
          balanceAdjustmentCount:
            payout.balanceAdjustments.length,
          method,
          reference,
          paidAt,
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
            "This payout has already been marked as paid.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "invalid-status") {
      return NextResponse.json(
        {
          error:
            `Only pending payouts can be completed. ` +
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
            "One or more commissions in this payout are not eligible to be marked as paid.",
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
            "One or more balance adjustments in this payout are not eligible to be marked as paid.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "amount-mismatch") {
      return NextResponse.json(
        {
          error:
            "The payout amount does not match the total of its included commissions.",
          recordedAmountCents:
            result.recordedAmountCents,
          calculatedAmountCents:
            result.calculatedAmountCents,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      payoutId: result.payoutId,
      creatorPartner:
        result.creatorPartner,
      amountCents: result.amountCents,
      commissionCount:
        result.commissionCount,
      balanceAdjustmentCount:
        result.balanceAdjustmentCount,
      method: result.method,
      reference: result.reference,
      paidAt: result.paidAt.toISOString(),
    });
  } catch (error) {
    if (
      error instanceof PayoutCompletionConflictError
    ) {
      return NextResponse.json(
        {
          error:
            "The payout changed while it was being completed. Refresh the dashboard and try again.",
        },
        { status: 409 }
      );
    }

    console.error(
      "Unable to complete Creator Partner payout:",
      error
    );

    return NextResponse.json(
      {
        error:
          "The Creator Partner payout could not be completed.",
      },
      { status: 500 }
    );
  }
}