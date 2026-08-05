import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const MAX_NOTES_LENGTH = 1000;

class PayoutCreationConflictError extends Error {
  constructor() {
    super("The available commission balance changed.");
    this.name = "PayoutCreationConflictError";
  }
}

function getPayoutPeriod(monthKeys: string[]): {
  periodStart: Date;
  periodEnd: Date;
} | null {
  const validMonthKeys = monthKeys
    .filter((monthKey) => MONTH_KEY_PATTERN.test(monthKey))
    .sort();

  if (
    validMonthKeys.length === 0 ||
    validMonthKeys.length !== monthKeys.length
  ) {
    return null;
  }

  const firstMonthKey = validMonthKeys[0];
  const lastMonthKey =
    validMonthKeys[validMonthKeys.length - 1];

  const [firstYearText, firstMonthText] =
    firstMonthKey.split("-");

  const [lastYearText, lastMonthText] =
    lastMonthKey.split("-");

  const firstYear = Number.parseInt(firstYearText, 10);
  const firstMonthIndex =
    Number.parseInt(firstMonthText, 10) - 1;

  const lastYear = Number.parseInt(lastYearText, 10);
  const lastMonthIndex =
    Number.parseInt(lastMonthText, 10) - 1;

  return {
    periodStart: new Date(
      Date.UTC(firstYear, firstMonthIndex, 1)
    ),
    periodEnd: new Date(
      Date.UTC(lastYear, lastMonthIndex + 1, 1)
    ),
  };
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

  const creatorPartnerId = String(
    body.creatorPartnerId || ""
  ).trim();

  const notes = String(body.notes || "").trim();

  if (!creatorPartnerId) {
    return NextResponse.json(
      { error: "A valid Creator Partner is required." },
      { status: 400 }
    );
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    return NextResponse.json(
      {
        error:
          `Payout notes cannot exceed ` +
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
          WITH creator_payout_lock AS (
            SELECT pg_advisory_xact_lock(
              hashtext(
                ${`creator-payout:${creatorPartnerId}`}
              )
            )
          )
          SELECT 1 AS "lockAcquired"
          FROM creator_payout_lock
        `;

        const creatorPartner =
          await transaction.creatorPartner.findUnique({
            where: {
              id: creatorPartnerId,
            },
            select: {
              id: true,
              fullName: true,
              trackingCode: true,
              payoutThresholdCents: true,
            },
          });

        if (!creatorPartner) {
          return {
            kind: "partner-not-found" as const,
          };
        }

        const availableCommissions =
          await transaction.creatorCommission.findMany({
            where: {
              creatorPartnerId,
              status: "Approved",
              payoutId: null,
            },
            select: {
              id: true,
              monthKey: true,
              commissionAmountCents: true,
              adjustmentCents: true,
            },
            orderBy: [
              {
                monthKey: "asc",
              },
              {
                createdAt: "asc",
              },
            ],
          });

        if (availableCommissions.length === 0) {
          return {
            kind: "no-commissions" as const,
            creatorPartner,
          };
        }

        const incompleteCommission =
          availableCommissions.find(
            (commission) =>
              commission.commissionAmountCents === null
          );

        if (incompleteCommission) {
          return {
            kind: "incomplete-commission" as const,
          };
        }

        const payoutPeriod = getPayoutPeriod(
          availableCommissions.map(
            (commission) => commission.monthKey
          )
        );

        if (!payoutPeriod) {
          return {
            kind: "invalid-period" as const,
          };
        }

        const amountCents =
          availableCommissions.reduce(
            (total, commission) =>
              total +
              (commission.commissionAmountCents || 0) +
              commission.adjustmentCents,
            0
          );

        if (
          amountCents <
          creatorPartner.payoutThresholdCents
        ) {
          return {
            kind: "below-threshold" as const,
            creatorPartner,
            availableBalanceCents: amountCents,
            commissionCount:
              availableCommissions.length,
          };
        }

        const payout =
          await transaction.creatorPayout.create({
            data: {
              creatorPartnerId,
              periodStart: payoutPeriod.periodStart,
              periodEnd: payoutPeriod.periodEnd,
              amountCents,
              status: "Pending",
              notes: notes || null,
            },
            select: {
              id: true,
              amountCents: true,
              periodStart: true,
              periodEnd: true,
              status: true,
            },
          });

        const commissionIds =
          availableCommissions.map(
            (commission) => commission.id
          );

        const updateResult =
          await transaction.creatorCommission.updateMany({
            where: {
              id: {
                in: commissionIds,
              },
              creatorPartnerId,
              status: "Approved",
              payoutId: null,
            },
            data: {
              payoutId: payout.id,
            },
          });

        if (
          updateResult.count !==
          availableCommissions.length
        ) {
          throw new PayoutCreationConflictError();
        }

        return {
          kind: "created" as const,
          creatorPartner,
          payout,
          commissionCount:
            availableCommissions.length,
        };
      }
    );

    if (result.kind === "partner-not-found") {
      return NextResponse.json(
        { error: "Creator Partner not found." },
        { status: 404 }
      );
    }

    if (result.kind === "no-commissions") {
      return NextResponse.json(
        {
          error:
            "This Creator Partner has no approved unpaid commissions.",
        },
        { status: 404 }
      );
    }

    if (result.kind === "incomplete-commission") {
      return NextResponse.json(
        {
          error:
            "One or more approved commission records are missing a calculated amount.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "invalid-period") {
      return NextResponse.json(
        {
          error:
            "One or more commission records contain an invalid commission month.",
        },
        { status: 409 }
      );
    }

    if (result.kind === "below-threshold") {
      return NextResponse.json(
        {
          error:
            "The approved unpaid balance has not reached the Creator Partner’s payout threshold.",
          availableBalanceCents:
            result.availableBalanceCents,
          payoutThresholdCents:
            result.creatorPartner
              .payoutThresholdCents,
          commissionCount: result.commissionCount,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      creatorPartnerId:
        result.creatorPartner.id,
      creatorName: result.creatorPartner.fullName,
      trackingCode:
        result.creatorPartner.trackingCode,
      payout: result.payout,
      commissionCount: result.commissionCount,
    });
  } catch (error) {
    if (error instanceof PayoutCreationConflictError) {
      return NextResponse.json(
        {
          error:
            "The available commission balance changed while the payout was being created. Refresh the dashboard and try again.",
        },
        { status: 409 }
      );
    }

    console.error(
      "Unable to create Creator Partner payout:",
      error
    );

    return NextResponse.json(
      {
        error:
          "The Creator Partner payout could not be created.",
      },
      { status: 500 }
    );
  }
}