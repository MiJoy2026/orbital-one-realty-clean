import AdminNav from "@/components/AdminNav";
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

export default async function AdminCreatorCommissionsPage() {
  const [partners, referralCount, commissions, payouts] =
    await Promise.all([
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
                      {payout.status}
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