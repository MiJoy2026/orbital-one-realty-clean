import AdminNav from "@/components/AdminNav";
import CreatorCommissionReviewButton from "@/components/CreatorCommissionReviewButton";
import CreatorCommissionStatusControls from "@/components/CreatorCommissionStatusControls";
import CreatorCommissionAdjustmentControls from "@/components/CreatorCommissionAdjustmentControls";
import CreatorPayoutCreateButton from "@/components/CreatorPayoutCreateButton";
import CreatorPayoutCompleteButton from "@/components/CreatorPayoutCompleteButton";
import CreatorPayoutCancelButton from "@/components/CreatorPayoutCancelButton";
import { prisma } from "@/lib/prisma";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function statusClasses(status: string): string {
  if (status === "Paid") {
    return "bg-blue-500 text-white";
  }

  if (status === "Approved") {
    return "bg-green-500 text-black";
  }

  if (status === "Denied") {
    return "bg-red-600 text-white";
  }

  if (status === "Cancelled") {
    return "bg-gray-600 text-white";
  }

  return "bg-yellow-400 text-black";
}

function financialStatusClasses(status: string): string {
  if (status === "Clear") {
    return "bg-green-500 text-black";
  }

  if (status === "Disputed") {
    return "bg-orange-500 text-black";
  }

  if (status === "DisputeLost") {
    return "bg-red-700 text-white";
  }

  if (status === "Refunded") {
    return "bg-red-600 text-white";
  }

  return "bg-yellow-400 text-black";
}

function getCommissionMonthEnd(monthKey: string): Date {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number.parseInt(yearText, 10);
  const monthIndex = Number.parseInt(monthText, 10) - 1;

  return new Date(Date.UTC(year, monthIndex + 1, 1));
}

export default async function AdminCreatorCommissionsPage() {
    const [
      partners,
      referralCount,
      commissions,
      payouts,
      pendingReviewCommissions,
      approvedUnpaidCommissions,
      unpaidBalanceAdjustments,
      financialIssueCommissions,
      balanceAdjustments,
      stripeFinancialEvents,
      stripeFinancialEventCount,
      paidCommissionTotals,
      paidPayoutTotals,
    ] = await Promise.all([
      prisma.creatorPartner.findMany({
        include: {
          _count: {
            select: {
              referrals: true,
              commissions: true,
              payouts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.creatorReferral.count(),

      prisma.creatorCommission.findMany({
        include: {
          creatorPartner: {
            select: {
              fullName: true,
              email: true,
              trackingCode: true,
            },
          },
          order: {
            select: {
              certificateNumber: true,
              propertyId: true,
            },
          },
          payout: {
            select: {
              id: true,
              status: true,
              reference: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 200,
      }),

            prisma.creatorPayout.findMany({
        include: {
          creatorPartner: {
            select: {
              fullName: true,
              trackingCode: true,
            },
          },
          _count: {
            select: {
              commissions: true,
              balanceAdjustments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      }),

      prisma.creatorCommission.findMany({
        where: {
          status: "Pending",
        },
        include: {
          creatorPartner: {
            select: {
              fullName: true,
              trackingCode: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      prisma.creatorCommission.findMany({
        where: {
          status: "Approved",
          payoutId: null,
        },
        include: {
          creatorPartner: {
            select: {
              fullName: true,
              trackingCode: true,
              payoutThresholdCents: true,
            },
          },
        },
        orderBy: [
          {
            creatorPartnerId: "asc",
          },
          {
            monthKey: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      }),
            prisma.creatorBalanceAdjustment.findMany({
        where: {
          payoutId: null,
          paidAt: null,
        },
        include: {
          creatorPartner: {
            select: {
              fullName: true,
              trackingCode: true,
              payoutThresholdCents: true,
            },
          },
          creatorCommission: {
            select: {
              monthKey: true,
            },
          },
        },
        orderBy: [
          {
            creatorPartnerId: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      }),

      prisma.creatorCommission.findMany({
        where: {
          financialStatus: {
            not: "Clear",
          },
        },
        select: {
          refundAmountCents: true,
          disputeAmountCents: true,
          financialStatus: true,
        },
      }),

      prisma.creatorBalanceAdjustment.findMany({
        include: {
          creatorPartner: {
            select: {
              fullName: true,
              trackingCode: true,
            },
          },
          creatorCommission: {
            select: {
              monthKey: true,
              financialStatus: true,
              order: {
                select: {
                  certificateNumber: true,
                  propertyId: true,
                },
              },
            },
          },
          payout: {
            select: {
              id: true,
              status: true,
              reference: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 200,
      }),

      prisma.stripeFinancialEvent.findMany({
        orderBy: {
          processedAt: "desc",
        },
        take: 100,
      }),

      prisma.stripeFinancialEvent.count(),

      prisma.creatorCommission.aggregate({
        where: {
          status: "Paid",
        },
        _sum: {
          commissionAmountCents: true,
          adjustmentCents: true,
        },
      }),

      prisma.creatorPayout.aggregate({
        where: {
          status: "Paid",
        },
        _sum: {
          amountCents: true,
        },
      }),
    ]);

  const activePartnerCount = partners.filter(
    (partner) => partner.status === "Active"
  ).length;

  const creatorCommissionCount = partners.reduce(
    (total, partner) =>
      total + partner._count.commissions,
    0
  );

  const creatorPayoutCount = partners.reduce(
    (total, partner) =>
      total + partner._count.payouts,
    0
  );

  const pendingAttributedRevenueCents =
    pendingReviewCommissions.reduce(
      (total, commission) =>
        total + commission.netRevenueCents,
      0
    );

  const approvedCommissionCents =
    approvedUnpaidCommissions.reduce(
      (total, commission) =>
        total +
        (commission.commissionAmountCents || 0) +
        commission.adjustmentCents,
      0
    );

  const paidCommissionCents =
    (paidCommissionTotals._sum
      .commissionAmountCents || 0) +
    (paidCommissionTotals._sum.adjustmentCents || 0);

  const paidPayoutCents =
    paidPayoutTotals._sum.amountCents || 0;

  const totalRefundedRevenueCents =
    financialIssueCommissions.reduce(
      (total, commission) =>
        total + commission.refundAmountCents,
      0
    );

  const totalDisputedRevenueCents =
    financialIssueCommissions.reduce(
      (total, commission) =>
        total + commission.disputeAmountCents,
      0
    );

  const openDisputeCount =
    financialIssueCommissions.filter(
      (commission) =>
        commission.financialStatus === "Disputed"
    ).length;

  const unpaidRecoveryBalanceCents =
    unpaidBalanceAdjustments.reduce(
      (total, adjustment) =>
        total + adjustment.amountCents,
      0
    );

    type ReviewGroup = {
    creatorPartnerId: string;
    creatorName: string;
    trackingCode: string;
    monthKey: string;
    recordCount: number;
    stripeSessionIds: Set<string>;
    netRevenueCents: number;
    nextEligibleAt: Date;
  };

  const groupedReviews = pendingReviewCommissions.reduce(
    (groups, commission) => {
      const key =
        `${commission.creatorPartnerId}:${commission.monthKey}`;
      const existing = groups.get(key);

      if (existing) {
        existing.recordCount += 1;
        existing.stripeSessionIds.add(
          commission.stripeSessionId
        );
        existing.netRevenueCents +=
          commission.netRevenueCents;

        if (
          commission.validationEligibleAt >
          existing.nextEligibleAt
        ) {
          existing.nextEligibleAt =
            commission.validationEligibleAt;
        }

        return groups;
      }

      groups.set(key, {
        creatorPartnerId: commission.creatorPartnerId,
        creatorName:
          commission.creatorPartner.fullName,
        trackingCode:
          commission.creatorPartner.trackingCode,
        monthKey: commission.monthKey,
        recordCount: 1,
        stripeSessionIds: new Set([
          commission.stripeSessionId,
        ]),
        netRevenueCents: commission.netRevenueCents,
        nextEligibleAt:
          commission.validationEligibleAt,
      });

      return groups;
    },
    new Map<string, ReviewGroup>()
  );

  const reviewGroups = Array.from(
    groupedReviews.values()
  ).map((group) => ({
    ...group,
    qualifyingSaleCount:
      group.stripeSessionIds.size,
    monthEnd: getCommissionMonthEnd(
      group.monthKey
    ),
  }));

     type PayoutEligibilityGroup = {
    creatorPartnerId: string;
    creatorName: string;
    trackingCode: string;
    payoutThresholdCents: number;
    commissionCount: number;
    balanceAdjustmentCount: number;
    commissionBalanceCents: number;
    balanceAdjustmentCents: number;
    availableBalanceCents: number;
    incompleteRecordCount: number;
    monthKeys: Set<string>;
  };

  const groupedPayoutEligibility =
    approvedUnpaidCommissions.reduce(
      (groups, commission) => {
        const existing = groups.get(
          commission.creatorPartnerId
        );

        const commissionValue =
          (commission.commissionAmountCents || 0) +
          commission.adjustmentCents;

        if (existing) {
          existing.commissionCount += 1;
          existing.commissionBalanceCents +=
            commissionValue;
          existing.availableBalanceCents +=
            commissionValue;
          existing.monthKeys.add(commission.monthKey);

          if (
            commission.commissionAmountCents === null
          ) {
            existing.incompleteRecordCount += 1;
          }

          return groups;
        }

        groups.set(commission.creatorPartnerId, {
          creatorPartnerId:
            commission.creatorPartnerId,
          creatorName:
            commission.creatorPartner.fullName,
          trackingCode:
            commission.creatorPartner.trackingCode,
          payoutThresholdCents:
            commission.creatorPartner
              .payoutThresholdCents,
          commissionCount: 1,
          balanceAdjustmentCount: 0,
          commissionBalanceCents:
            commissionValue,
          balanceAdjustmentCents: 0,
          availableBalanceCents:
            commissionValue,
          incompleteRecordCount:
            commission.commissionAmountCents === null
              ? 1
              : 0,
          monthKeys: new Set([
            commission.monthKey,
          ]),
        });

        return groups;
      },
      new Map<string, PayoutEligibilityGroup>()
    );

  for (
    const adjustment of unpaidBalanceAdjustments
  ) {
    const existing =
      groupedPayoutEligibility.get(
        adjustment.creatorPartnerId
      );

    if (existing) {
      existing.balanceAdjustmentCount += 1;
      existing.balanceAdjustmentCents +=
        adjustment.amountCents;
      existing.availableBalanceCents +=
        adjustment.amountCents;
      existing.monthKeys.add(
        adjustment.creatorCommission.monthKey
      );

      continue;
    }

    groupedPayoutEligibility.set(
      adjustment.creatorPartnerId,
      {
        creatorPartnerId:
          adjustment.creatorPartnerId,
        creatorName:
          adjustment.creatorPartner.fullName,
        trackingCode:
          adjustment.creatorPartner.trackingCode,
        payoutThresholdCents:
          adjustment.creatorPartner
            .payoutThresholdCents,
        commissionCount: 0,
        balanceAdjustmentCount: 1,
        commissionBalanceCents: 0,
        balanceAdjustmentCents:
          adjustment.amountCents,
        availableBalanceCents:
          adjustment.amountCents,
        incompleteRecordCount: 0,
        monthKeys: new Set([
          adjustment.creatorCommission.monthKey,
        ]),
      }
    );
  }

  const payoutEligibilityGroups = Array.from(
    groupedPayoutEligibility.values()
  ).map((group) => ({
    ...group,
    monthCount: group.monthKeys.size,
  }));

  const now = new Date();

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Creator Commissions
        </h1>

        <AdminNav />

        <p className="mt-4 max-w-4xl text-gray-300">
          Review Creator Partners, referral activity, attributed orders,
          pending commission records, approved balances, and payouts.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Active Partners
            </p>
            <p className="mt-2 text-4xl font-black text-yellow-400">
              {activePartnerCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Recorded Referrals
            </p>
            <p className="mt-2 text-4xl font-black">
              {referralCount}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400 bg-yellow-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">
              Pending Attributed Revenue
            </p>
            <p className="mt-2 text-4xl font-black text-yellow-400">
              {formatMoney(pendingAttributedRevenueCents)}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              {pendingReviewCommissions.length} pending commission records
            </p>
          </div>

          <div className="rounded-2xl border border-green-500 bg-green-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">
              Approved Unpaid Commission
            </p>
            <p className="mt-2 text-4xl font-black text-green-400">
              {formatMoney(approvedCommissionCents)}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500 bg-blue-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">
              Paid Commission
            </p>
            <p className="mt-2 text-4xl font-black text-blue-300">
              {formatMoney(paidCommissionCents)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Commission Records
            </p>
            <p className="mt-2 text-4xl font-black">
              {creatorCommissionCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Payout Records
            </p>
            <p className="mt-2 text-4xl font-black">
              {creatorPayoutCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Paid Payout Value
            </p>
            <p className="mt-2 text-4xl font-black">
              {formatMoney(paidPayoutCents)}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500 bg-red-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">
              Refunded Revenue
            </p>
            <p className="mt-2 text-4xl font-black text-red-300">
              {formatMoney(totalRefundedRevenueCents)}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Across {financialIssueCommissions.length} financially affected
              commission records
            </p>
          </div>

          <div className="rounded-2xl border border-orange-500 bg-orange-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">
              Disputed Revenue
            </p>
            <p className="mt-2 text-4xl font-black text-orange-300">
              {formatMoney(totalDisputedRevenueCents)}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              {openDisputeCount} open dispute{" "}
              {openDisputeCount === 1 ? "record" : "records"}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500 bg-purple-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">
              Unpaid Recovery Balance
            </p>
            <p
              className={`mt-2 text-4xl font-black ${
                unpaidRecoveryBalanceCents < 0
                  ? "text-red-300"
                  : "text-green-300"
              }`}
            >
              {formatMoney(unpaidRecoveryBalanceCents)}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              {unpaidBalanceAdjustments.length} unpaid ledger{" "}
              {unpaidBalanceAdjustments.length === 1
                ? "entry"
                : "entries"}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500 bg-cyan-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">
              Stripe Financial Events
            </p>
            <p className="mt-2 text-4xl font-black text-cyan-300">
              {stripeFinancialEventCount}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Refund and dispute events recorded
            </p>
          </div>
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-yellow-400">
                Creator Partners
              </h2>
              <p className="mt-2 text-gray-400">
                Current account, referral, commission, and payout totals.
              </p>
            </div>

            <a
              href="/admin/creators"
              className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
            >
              Review Applications
            </a>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/20">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Tracking Code</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Referrals</th>
                  <th className="p-4">Commissions</th>
                  <th className="p-4">Payouts</th>
                  <th className="p-4">Approved</th>
                </tr>
              </thead>

              <tbody>
                {partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-t border-white/10"
                  >
                    <td className="p-4">
                      <p className="font-black text-yellow-300">
                        {partner.fullName}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {partner.email}
                      </p>
                    </td>

                    <td className="p-4 font-mono text-sm">
                      {partner.trackingCode}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-black ${
                          partner.status === "Active"
                            ? "bg-green-500 text-black"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {partner._count.referrals}
                    </td>

                    <td className="p-4">
                      {partner._count.commissions}
                    </td>

                    <td className="p-4">
                      {partner._count.payouts}
                    </td>

                    <td className="p-4">
                      {partner.approvedAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {partners.length === 0 && (
              <p className="p-8 text-center text-gray-400">
                No approved Creator Partners yet.
              </p>
            )}
          </div>
        </section>
                <section className="mt-12">
          <h2 className="text-3xl font-black text-yellow-400">
            Monthly Review Queue
          </h2>

          <p className="mt-2 text-gray-400">
            Review completed commission months after every attributed
            transaction has finished its validation period.
          </p>

          <div className="mt-6 space-y-5">
            {reviewGroups.map((group) => {
              const monthHasEnded =
                group.monthEnd <= now;
              const validationComplete =
                group.nextEligibleAt <= now;

              return (
                <article
                  key={`${group.creatorPartnerId}:${group.monthKey}`}
                  className="rounded-2xl border border-white/20 bg-white/5 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <h3 className="text-xl font-black text-yellow-300">
                        {group.creatorName}
                      </h3>

                      <p className="mt-1 font-mono text-xs text-gray-400">
                        {group.trackingCode}
                      </p>
                    </div>

                    <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-black">
                      {group.monthKey}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs font-black uppercase text-gray-400">
                        Qualifying Sales
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {group.qualifyingSaleCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase text-gray-400">
                        Commission Records
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {group.recordCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase text-gray-400">
                        Net Revenue
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {formatMoney(group.netRevenueCents)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase text-gray-400">
                        Validation Complete
                      </p>
                      <p className="mt-1 font-bold">
                        {group.nextEligibleAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-5">
                    {!monthHasEnded ? (
                      <p className="font-semibold text-yellow-300">
                        This calendar month has not ended yet.
                      </p>
                    ) : !validationComplete ? (
                      <p className="font-semibold text-yellow-300">
                        Validation remains pending until{" "}
                        {group.nextEligibleAt.toLocaleDateString()}.
                      </p>
                    ) : (
                      <CreatorCommissionReviewButton
                        creatorPartnerId={
                          group.creatorPartnerId
                        }
                        monthKey={group.monthKey}
                      />
                    )}
                  </div>
                </article>
              );
            })}

            {reviewGroups.length === 0 && (
              <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center text-gray-400">
                No commission months are currently awaiting review.
              </div>
            )}
          </div>
        </section>
        <section className="mt-12">
          <h2 className="text-3xl font-black text-yellow-400">
            Recent Commission Records
          </h2>

          <p className="mt-2 text-gray-400">
            Financial status, refunds, disputes, commission review, and payout
            state for the 200 most recent attributed commission records.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/20">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Created</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Month</th>
                  <th className="p-4">Gross</th>
                  <th className="p-4">Refunded</th>
                  <th className="p-4">Disputed</th>
                  <th className="p-4">Net Revenue</th>
                  <th className="p-4">Financial State</th>
                  <th className="p-4">Rate</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Commission Status</th>
                  <th className="p-4">Review Eligible</th>
                </tr>
              </thead>

              <tbody>
                {commissions.map((commission) => {
                  const commissionTotalCents =
                    (commission.commissionAmountCents || 0) +
                    commission.adjustmentCents;

                  return (
                    <tr
                      key={commission.id}
                      className="border-t border-white/10 align-top"
                    >
                      <td className="p-4 text-sm">
                        {commission.createdAt.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <p className="font-black text-yellow-300">
                          {commission.creatorPartner.fullName}
                        </p>
                        <p className="mt-1 font-mono text-xs text-gray-400">
                          {commission.creatorPartner.trackingCode}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold">
                          {commission.order.certificateNumber}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {commission.order.propertyId}
                        </p>
                      </td>

                      <td className="p-4">
                        {commission.monthKey}
                      </td>

                      <td className="p-4">
                        {formatMoney(
                          commission.grossRevenueCents
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            commission.refundAmountCents > 0
                              ? "font-black text-red-300"
                              : "text-gray-500"
                          }
                        >
                          {formatMoney(
                            commission.refundAmountCents
                          )}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            commission.disputeAmountCents > 0
                              ? "font-black text-orange-300"
                              : "text-gray-500"
                          }
                        >
                          {formatMoney(
                            commission.disputeAmountCents
                          )}
                        </span>
                      </td>

                      <td className="p-4 font-black">
                        {formatMoney(commission.netRevenueCents)}
                      </td>

                      <td className="min-w-64 p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${financialStatusClasses(
                            commission.financialStatus
                          )}`}
                        >
                          {commission.financialStatus}
                        </span>

                        {commission.financialUpdatedAt && (
                          <p className="mt-2 text-xs text-gray-400">
                            Updated{" "}
                            {commission.financialUpdatedAt.toLocaleString()}
                          </p>
                        )}

                        {commission.financialNote && (
                          <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
                            {commission.financialNote}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        {commission.commissionRateBps === null
                          ? "Monthly review"
                          : `${(
                              commission.commissionRateBps / 100
                            ).toFixed(2)}%`}
                      </td>

                      <td className="p-4">
                        {commission.commissionAmountCents === null
                          ? "Pending"
                          : formatMoney(commissionTotalCents)}

                        {commission.adjustmentCents !== 0 && (
                          <p className="mt-2 text-xs text-gray-400">
                            Manual adjustment:{" "}
                            {formatMoney(
                              commission.adjustmentCents
                            )}
                          </p>
                        )}
                      </td>

                      <td className="min-w-56 p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-black ${statusClasses(
                            commission.status
                          )}`}
                        >
                          {commission.status}
                        </span>

                        {commission.payout && (
                          <p className="mt-2 text-xs text-gray-400">
                            Payout: {commission.payout.status}
                            {commission.payout.reference
                              ? ` (${commission.payout.reference})`
                              : ""}
                          </p>
                        )}

                        {commission.status === "Approved" &&
                          commission.payoutId === null &&
                          commission.commissionAmountCents !== null && (
                            <div className="mt-3">
                              <CreatorCommissionAdjustmentControls
                                commissionId={commission.id}
                                baseCommissionCents={
                                  commission.commissionAmountCents
                                }
                                currentAdjustmentCents={
                                  commission.adjustmentCents
                                }
                                currentAdjustmentReason={
                                  commission.adjustmentReason
                                }
                                adjustedAt={
                                  commission.adjustedAt?.toISOString() ||
                                  null
                                }
                              />
                            </div>
                          )}
                      </td>

                      <td className="p-4 text-sm">
                        {commission.validationEligibleAt.toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {commissions.length === 0 && (
              <p className="p-8 text-center text-gray-400">
                No attributed commission records have been created yet.
              </p>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black text-yellow-400">
            Payout Eligibility
          </h2>

          <p className="mt-2 text-gray-400">
            Approved commissions and unpaid refund or dispute recovery entries
            carry forward together until the Creator Partner reaches the payout
            threshold.
          </p>

          <div className="mt-6 space-y-5">
            {payoutEligibilityGroups.map((group) => (
              <article
                key={group.creatorPartnerId}
                className="rounded-2xl border border-white/20 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <h3 className="text-xl font-black text-yellow-300">
                      {group.creatorName}
                    </h3>

                    <p className="mt-1 font-mono text-xs text-gray-400">
                      {group.trackingCode}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${
                      group.availableBalanceCents < 0
                        ? "bg-red-600 text-white"
                        : "bg-green-500 text-black"
                    }`}
                  >
                    {formatMoney(
                      group.availableBalanceCents
                    )}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      Approved Records
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {group.commissionCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      Balance Adjustments
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {group.balanceAdjustmentCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      Commission Balance
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {formatMoney(
                        group.commissionBalanceCents
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      Recovery Adjustments
                    </p>
                    <p
                      className={`mt-1 text-2xl font-black ${
                        group.balanceAdjustmentCents < 0
                          ? "text-red-300"
                          : group.balanceAdjustmentCents > 0
                            ? "text-green-300"
                            : ""
                      }`}
                    >
                      {formatMoney(
                        group.balanceAdjustmentCents
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      Net Available
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {formatMoney(
                        group.availableBalanceCents
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      Payout Threshold
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {formatMoney(
                        group.payoutThresholdCents
                      )}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-400">
                  {group.monthCount} commission{" "}
                  {group.monthCount === 1 ? "month" : "months"} represented.
                  Negative recovery entries reduce the next payout without
                  rewriting previously completed payout history.
                </p>

                <div className="mt-6 border-t border-white/10 pt-5">
                  {group.incompleteRecordCount > 0 ? (
                    <p className="font-semibold text-red-300">
                      This balance contains{" "}
                      {group.incompleteRecordCount} approved{" "}
                      {group.incompleteRecordCount === 1
                        ? "record"
                        : "records"}{" "}
                      without a calculated commission amount.
                    </p>
                  ) : (
                    <CreatorPayoutCreateButton
                      creatorPartnerId={
                        group.creatorPartnerId
                      }
                      creatorName={group.creatorName}
                      availableBalanceCents={
                        group.availableBalanceCents
                      }
                      payoutThresholdCents={
                        group.payoutThresholdCents
                      }
                      commissionCount={
                        group.commissionCount
                      }
                      balanceAdjustmentCount={
                        group.balanceAdjustmentCount
                      }
                    />
                  )}
                </div>
              </article>
            ))}

            {payoutEligibilityGroups.length === 0 && (
              <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center text-gray-400">
                No approved unpaid commissions or recovery adjustments are
                currently available for payout.
              </div>
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-yellow-400">
                Recovery Adjustment Ledger
              </h2>

              <p className="mt-2 max-w-4xl text-gray-400">
                Permanent carry-forward entries created when a refund or
                dispute changes commission that was already paid. Negative
                entries recover overpayment; positive entries reverse an
                earlier recovery.
              </p>
            </div>

            <p
              className={`rounded-full px-4 py-2 text-sm font-black ${
                unpaidRecoveryBalanceCents < 0
                  ? "bg-red-600 text-white"
                  : "bg-green-500 text-black"
              }`}
            >
              Unpaid balance:{" "}
              {formatMoney(unpaidRecoveryBalanceCents)}
            </p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/20">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Created</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Commission Month</th>
                  <th className="p-4">Stripe Event</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Ledger State</th>
                  <th className="p-4">Reason</th>
                </tr>
              </thead>

              <tbody>
                {balanceAdjustments.map((adjustment) => {
                  const ledgerState = adjustment.paidAt
                    ? "Paid"
                    : adjustment.payoutId
                      ? "Pending Payout"
                      : "Available";

                  return (
                    <tr
                      key={adjustment.id}
                      className="border-t border-white/10 align-top"
                    >
                      <td className="p-4 text-sm">
                        {adjustment.createdAt.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <p className="font-black text-yellow-300">
                          {adjustment.creatorPartner.fullName}
                        </p>
                        <p className="mt-1 font-mono text-xs text-gray-400">
                          {adjustment.creatorPartner.trackingCode}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold">
                          {
                            adjustment.creatorCommission.order
                              .certificateNumber
                          }
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {
                            adjustment.creatorCommission.order
                              .propertyId
                          }
                        </p>
                      </td>

                      <td className="p-4">
                        {adjustment.creatorCommission.monthKey}
                      </td>

                      <td className="p-4">
                        <p className="font-mono text-xs">
                          {adjustment.stripeEventId}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {
                            adjustment.creatorCommission
                              .financialStatus
                          }
                        </p>
                      </td>

                      <td
                        className={`p-4 text-lg font-black ${
                          adjustment.amountCents < 0
                            ? "text-red-300"
                            : "text-green-300"
                        }`}
                      >
                        {formatMoney(adjustment.amountCents)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            ledgerState === "Paid"
                              ? "bg-blue-500 text-white"
                              : ledgerState === "Pending Payout"
                                ? "bg-yellow-400 text-black"
                                : "bg-green-500 text-black"
                          }`}
                        >
                          {ledgerState}
                        </span>

                        {adjustment.payout && (
                          <p className="mt-2 text-xs text-gray-400">
                            Payout {adjustment.payout.status}
                            {adjustment.payout.reference
                              ? ` (${adjustment.payout.reference})`
                              : ""}
                          </p>
                        )}
                      </td>

                      <td className="min-w-96 p-4 text-xs leading-5 text-gray-400">
                        {adjustment.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {balanceAdjustments.length === 0 && (
              <p className="p-8 text-center text-gray-400">
                No commission recovery adjustments have been recorded.
              </p>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black text-yellow-400">
            Stripe Financial Event Log
          </h2>

          <p className="mt-2 text-gray-400">
            The 100 most recently processed Stripe refund and dispute events.
            Stripe event IDs are unique, preventing duplicate processing.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/20">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Processed</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Stripe Event</th>
                  <th className="p-4">Stripe Object</th>
                  <th className="p-4">Checkout Session</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment References</th>
                </tr>
              </thead>

              <tbody>
                {stripeFinancialEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-t border-white/10 align-top"
                  >
                    <td className="p-4 text-sm">
                      {event.processedAt.toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-black text-black">
                        {event.eventType}
                      </span>
                      <p className="mt-2 text-xs text-gray-400">
                        Stripe created{" "}
                        {event.eventCreatedAt.toLocaleString()}
                      </p>
                    </td>

                    <td className="p-4 font-mono text-xs">
                      {event.stripeEventId}
                    </td>

                    <td className="p-4 font-mono text-xs">
                      {event.stripeObjectId}
                    </td>

                    <td className="p-4 font-mono text-xs">
                      {event.stripeSessionId || "Not resolved"}
                    </td>

                    <td className="p-4">
                      {event.amountCents === null
                        ? "Not supplied"
                        : formatMoney(event.amountCents)}
                      {event.currency && (
                        <p className="mt-1 text-xs uppercase text-gray-400">
                          {event.currency}
                        </p>
                      )}
                    </td>

                    <td className="min-w-72 p-4 font-mono text-xs">
                      <p>
                        PI:{" "}
                        {event.stripePaymentIntentId ||
                          "Not supplied"}
                      </p>
                      <p className="mt-2">
                        Charge:{" "}
                        {event.stripeChargeId ||
                          "Not supplied"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {stripeFinancialEvents.length === 0 && (
              <p className="p-8 text-center text-gray-400">
                No refund or dispute events have been processed yet.
              </p>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black text-yellow-400">
            Payout Records
          </h2>

          <p className="mt-2 text-gray-400">
            Pending, paid, and cancelled payout records. Included records show
            both commissions and recovery adjustments.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/20">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Included Records</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Status / Actions</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>

              <tbody>
                {payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-t border-white/10 align-top"
                  >
                    <td className="p-4">
                      <p className="font-black text-yellow-300">
                        {payout.creatorPartner.fullName}
                      </p>
                      <p className="mt-1 font-mono text-xs text-gray-400">
                        {payout.creatorPartner.trackingCode}
                      </p>
                    </td>

                    <td className="p-4 text-sm">
                      {payout.periodStart.toLocaleDateString()} through{" "}
                      {new Date(
                        payout.periodEnd.getTime() - 1
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4 font-black">
                      {formatMoney(payout.amountCents)}
                    </td>

                    <td className="p-4 text-sm">
                      <p>
                        {payout._count.commissions} commission{" "}
                        {payout._count.commissions === 1
                          ? "record"
                          : "records"}
                      </p>
                      <p className="mt-1 text-gray-400">
                        {payout._count.balanceAdjustments} balance{" "}
                        {payout._count.balanceAdjustments === 1
                          ? "adjustment"
                          : "adjustments"}
                      </p>
                    </td>

                    <td className="p-4">
                      {payout.method || "Not recorded"}
                    </td>

                    <td className="p-4">
                      {payout.reference || "—"}
                    </td>

                    <td className="min-w-64 p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${statusClasses(
                          payout.status
                        )}`}
                      >
                        {payout.status}
                      </span>

                      {payout.status === "Pending" && (
                        <div className="mt-3 space-y-3">
                          <CreatorPayoutCompleteButton
                            payoutId={payout.id}
                            creatorName={
                              payout.creatorPartner.fullName
                            }
                            amountCents={payout.amountCents}
                            commissionCount={
                              payout._count.commissions
                            }
                          />

                          <CreatorPayoutCancelButton
                            payoutId={payout.id}
                            creatorName={
                              payout.creatorPartner.fullName
                            }
                            amountCents={payout.amountCents}
                            commissionCount={
                              payout._count.commissions
                            }
                          />
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-sm">
                      {payout.paidAt
                        ? payout.paidAt.toLocaleString()
                        : "Not paid"}
                    </td>

                    <td className="min-w-96 p-4 whitespace-pre-wrap text-xs leading-5 text-gray-400">
                      {payout.notes || "No internal notes"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payouts.length === 0 && (
              <p className="p-8 text-center text-gray-400">
                No Creator Partner payouts have been recorded yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
