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
    ]);

  const activePartnerCount = partners.filter(
    (partner) => partner.status === "Active"
  ).length;

  const pendingCommissions = commissions.filter(
    (commission) => commission.status === "Pending"
  );

  const approvedCommissions = commissions.filter(
    (commission) => commission.status === "Approved"
  );

  const paidCommissions = commissions.filter(
    (commission) => commission.status === "Paid"
  );

  const pendingAttributedRevenueCents = pendingCommissions.reduce(
    (total, commission) => total + commission.netRevenueCents,
    0
  );

  const approvedCommissionCents = approvedCommissions.reduce(
    (total, commission) =>
      total +
      (commission.commissionAmountCents || 0) +
      commission.adjustmentCents,
    0
  );

  const paidCommissionCents = paidCommissions.reduce(
    (total, commission) =>
      total +
      (commission.commissionAmountCents || 0) +
      commission.adjustmentCents,
    0
  );

  const recordedPayoutCents = payouts.reduce(
    (total, payout) => total + payout.amountCents,
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
              {pendingCommissions.length} pending commission records
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
              {commissions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Payout Records
            </p>
            <p className="mt-2 text-4xl font-black">
              {payouts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Recorded Payout Value
            </p>
            <p className="mt-2 text-4xl font-black">
              {formatMoney(recordedPayoutCents)}
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
            Pending records remain unpriced until monthly validation assigns
            the appropriate commission tier.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/20">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Created</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Month</th>
                  <th className="p-4">Net Revenue</th>
                  <th className="p-4">Rate</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Status</th>
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
                      className="border-t border-white/10"
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
                        {formatMoney(commission.netRevenueCents)}
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
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-black ${statusClasses(
                            commission.status
                          )}`}
                        >
                          {commission.status}
                        </span>
                          <div className="mt-3">
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
                                 commission.adjustedAt?.toISOString() || null
                                }
                              />
                            </div>
                            )}
                          </div>
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
            Approved unpaid balances carry forward until the
            Creator Partner reaches their payout threshold.
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

                  <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-black text-black">
                    {formatMoney(
                      group.availableBalanceCents
                    )}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      Commission Months
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {group.monthCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      Available Balance
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
                No approved unpaid Creator Partner
                commissions are currently available for payout.
              </div>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black text-yellow-400">
            Payout Records
          </h2>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/20">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Commissions</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Paid</th>
                </tr>
              </thead>

              <tbody>
                {payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-t border-white/10"
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
                      {payout.periodEnd.toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      {formatMoney(payout.amountCents)}
                    </td>

                    <td className="p-4">
                      {payout._count.commissions}
                    </td>

                    <td className="p-4">
                      {payout.method || "Not recorded"}
                    </td>

                    <td className="p-4">
                      {payout.reference || "—"}
                    </td>

                    <td className="p-4">
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
                            creatorName={payout.creatorPartner.fullName}
                            amountCents={payout.amountCents}
                            commissionCount={payout._count.commissions}
                          />

                          <CreatorPayoutCancelButton
                            payoutId={payout.id}
                            creatorName={payout.creatorPartner.fullName}
                            amountCents={payout.amountCents}
                            commissionCount={payout._count.commissions}
                          />
                        </div>
                        )}
                    </td>

                    <td className="p-4 text-sm">
                      {payout.paidAt
                        ? payout.paidAt.toLocaleDateString()
                        : "Not paid"}
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