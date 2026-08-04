import { NextRequest, NextResponse } from "next/server";

import {
  calculateCreatorCommissionCents,
  countDistinctCreatorSales,
  getCreatorCommissionRateBps,
} from "@/lib/creator-commission-calculator";
import { prisma } from "@/lib/prisma";

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function getMonthPeriod(monthKey: string): {
  periodStart: Date;
  periodEnd: Date;
} {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number.parseInt(yearText, 10);
  const monthIndex = Number.parseInt(monthText, 10) - 1;

  return {
    periodStart: new Date(Date.UTC(year, monthIndex, 1)),
    periodEnd: new Date(Date.UTC(year, monthIndex + 1, 1)),
  };
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

  const creatorPartnerId = String(
    body.creatorPartnerId || ""
  ).trim();

  const monthKey = String(body.monthKey || "").trim();

  if (
    !creatorPartnerId ||
    !MONTH_KEY_PATTERN.test(monthKey)
  ) {
    return NextResponse.json(
      {
        error:
          "A valid Creator Partner and commission month are required.",
      },
      { status: 400 }
    );
  }

  const now = new Date();
  const { periodStart, periodEnd } = getMonthPeriod(monthKey);

  if (periodEnd > now) {
    return NextResponse.json(
      {
        error:
          "This commission month has not ended and cannot be reviewed yet.",
      },
      { status: 409 }
    );
  }

  const result = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw<Array<{ lockAcquired: number }>>`
      WITH creator_commission_review_lock AS (
        SELECT pg_advisory_xact_lock(
          hashtext(${`${creatorPartnerId}:${monthKey}`})
        )
      )
      SELECT 1 AS "lockAcquired"
      FROM creator_commission_review_lock
    `;

    const creatorPartner =
      await transaction.creatorPartner.findUnique({
        where: {
          id: creatorPartnerId,
        },
      });

    if (!creatorPartner) {
      return {
        kind: "partner-not-found" as const,
      };
    }

    const commissions =
      await transaction.creatorCommission.findMany({
        where: {
          creatorPartnerId,
          monthKey,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    if (commissions.length === 0) {
      return {
        kind: "no-commissions" as const,
      };
    }

    const paidCommission = commissions.find(
      (commission) => commission.status === "Paid"
    );

    if (paidCommission) {
      return {
        kind: "already-paid" as const,
      };
    }

    const pendingCommissions = commissions.filter(
      (commission) => commission.status === "Pending"
    );

    if (pendingCommissions.length === 0) {
      const approvedCommissions = commissions.filter(
        (commission) => commission.status === "Approved"
      );

      return {
        kind: "already-reviewed" as const,
        creatorPartner,
        qualifyingSaleCount: countDistinctCreatorSales(
          approvedCommissions.map(
            (commission) => commission.stripeSessionId
          )
        ),
        approvedRecordCount: approvedCommissions.length,
        approvedCommissionCents: approvedCommissions.reduce(
          (total, commission) =>
            total +
            (commission.commissionAmountCents || 0) +
            commission.adjustmentCents,
          0
        ),
      };
    }

    const ineligibleCommission = pendingCommissions.find(
      (commission) =>
        commission.validationEligibleAt > now
    );

    if (ineligibleCommission) {
      return {
        kind: "validation-pending" as const,
        nextEligibleAt:
          ineligibleCommission.validationEligibleAt,
      };
    }

    const qualifyingSaleCount = countDistinctCreatorSales(
      pendingCommissions.map(
        (commission) => commission.stripeSessionId
      )
    );

    const commissionRateBps =
      getCreatorCommissionRateBps(
        qualifyingSaleCount,
        creatorPartner.customCommissionRateBps
      );

    let approvedCommissionCents = 0;

    for (const commission of pendingCommissions) {
      const commissionAmountCents =
        calculateCreatorCommissionCents(
          commission.netRevenueCents,
          commissionRateBps
        );

      approvedCommissionCents +=
        commissionAmountCents +
        commission.adjustmentCents;

      await transaction.creatorCommission.update({
        where: {
          id: commission.id,
        },
        data: {
          status: "Approved",
          commissionRateBps,
          commissionAmountCents,
          approvedAt: now,
          deniedAt: null,
          denialReason: null,
        },
      });
    }

    return {
      kind: "approved" as const,
      creatorPartner,
      qualifyingSaleCount,
      approvedRecordCount: pendingCommissions.length,
      approvedCommissionCents,
      commissionRateBps,
      periodStart,
      periodEnd,
    };
  });

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
          "No commission records exist for this creator and month.",
      },
      { status: 404 }
    );
  }

  if (result.kind === "already-paid") {
    return NextResponse.json(
      {
        error:
          "This commission month contains paid records and cannot be reviewed again.",
      },
      { status: 409 }
    );
  }

  if (result.kind === "validation-pending") {
    return NextResponse.json(
      {
        error:
          "One or more commission records are still within the validation period.",
        nextEligibleAt: result.nextEligibleAt.toISOString(),
      },
      { status: 409 }
    );
  }

  if (result.kind === "already-reviewed") {
    return NextResponse.json({
      success: true,
      alreadyReviewed: true,
      qualifyingSaleCount: result.qualifyingSaleCount,
      approvedRecordCount: result.approvedRecordCount,
      approvedCommissionCents:
        result.approvedCommissionCents,
    });
  }

  return NextResponse.json({
    success: true,
    alreadyReviewed: false,
    creatorPartnerId: result.creatorPartner.id,
    monthKey,
    qualifyingSaleCount: result.qualifyingSaleCount,
    approvedRecordCount: result.approvedRecordCount,
    commissionRateBps: result.commissionRateBps,
    approvedCommissionCents:
      result.approvedCommissionCents,
  });
}