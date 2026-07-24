import AdminNav from "../../../../components/AdminNav";
import LunaScapeImageGallery from "../../../../components/LunaScapeImageGallery";
import PropertySnapshotAdminControls from "../../../../components/PropertySnapshotAdminControls";
import { inspectOwnedPropertySnapshotEligibilityForOrderIds } from "../../../../lib/owned-property-snapshot";
import { prisma } from "../../../../lib/prisma";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      propertySnapshot: true,
    },
  });

  if (!order) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-5xl font-black uppercase text-red-500">
            Order Not Found
          </h1>

          <a
            href="/admin/orders"
            className="mt-8 inline-block rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            Back to Orders
          </a>
        </div>
      </main>
    );
  }

  const allocation = await prisma.acreageAllocation.findFirst({
    where: {
      certificateNumber: order.certificateNumber,
    },
  });
  const [snapshotEligibility] = order.propertySnapshot
    ? []
    : await inspectOwnedPropertySnapshotEligibilityForOrderIds([order.id]);
  const isHistoricalPriorGeography =
    Boolean(snapshotEligibility) && !snapshotEligibility.eligible;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Order Detail
        </h1>

        <AdminNav />

        <a
          href="/admin/orders"
          className="mt-6 inline-block rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
        >
          Back to Orders
        </a>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400 p-6">
            <p className="text-sm uppercase text-gray-400">Certificate</p>
            <p className="mt-2 text-xl font-black text-yellow-400">
              {order.certificateNumber}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 p-6">
            <p className="text-sm uppercase text-gray-400">Property ID</p>
            <p className="mt-2 text-xl font-black">{order.propertyId}</p>
          </div>

          <div className="rounded-2xl border border-white/20 p-6">
            <p className="text-sm uppercase text-gray-400">Payment Status</p>
            <p className="mt-2 text-xl font-black text-green-400">
              {order.paymentStatus}
            </p>
          </div>
        </div>

        {order.propertySnapshot ? (
          <section className="mt-10 overflow-hidden rounded-3xl border border-yellow-400/40 bg-white/5">
            <LunaScapeImageGallery
              snapshotId={order.propertySnapshot.id}
              propertyId={order.propertyId}
            />
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-5">
              <div>
                <p className="font-black text-yellow-400">
                  LunaScape image collection ready
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Scenic renderer and parcel locator · Grid V{order.propertySnapshot.inventoryGridVersion}
                </p>
              </div>
              <a
                href={`/api/property-image/${order.propertySnapshot.id}?view=scenic&download=1`}
                className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
              >
                Download Scenic View
              </a>
            </div>
          </section>
        ) : isHistoricalPriorGeography ? (
          <section className="mt-10 rounded-3xl border border-sky-400/50 bg-sky-950/20 p-7">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">
              Historical Grid V2 order
            </p>
            <h2 className="mt-2 text-2xl font-black text-sky-200">
              Prior-geography property preserved
            </h2>
            <p className="mt-3 max-w-3xl text-gray-300">
              This sale was completed before the active parcel-grid expansion.
              The order, certificate, ownership record, and sold status remain
              valid. Its former geometry is not selectable in the current
              geography, so a current LunaScape image cannot be recreated
              accurately.
            </p>
            {snapshotEligibility?.reason && (
              <p className="mt-3 text-sm text-sky-300">
                {snapshotEligibility.reason}
              </p>
            )}
          </section>
        ) : (
          <section className="mt-10 rounded-3xl border border-orange-400/50 bg-orange-950/20 p-7">
            <h2 className="text-2xl font-black text-orange-300">
              Property image missing
            </h2>
            <p className="mt-3 text-gray-300">
              Create the immutable Grid V2 snapshot for this paid order.
            </p>
            <div className="mt-5">
              <PropertySnapshotAdminControls orderId={order.id} />
            </div>
          </section>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-white/20 bg-white/5 p-8">
            <h2 className="text-3xl font-black text-yellow-400">
              Customer
            </h2>

            <div className="mt-6 space-y-4">
              <p>
                <span className="font-bold text-gray-400">Deed Name:</span>{" "}
                {order.deedName}
              </p>

              <p>
                <span className="font-bold text-gray-400">Email:</span>{" "}
                {order.email || "No email recorded"}
              </p>

              <p>
                <span className="font-bold text-gray-400">Purchased:</span>{" "}
                {order.createdAt.toLocaleString()}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/20 bg-white/5 p-8">
            <h2 className="text-3xl font-black text-yellow-400">
              Property
            </h2>

            <div className="mt-6 space-y-4">
              <p>
                <span className="font-bold text-gray-400">Type:</span>{" "}
                {order.propertyType}
              </p>

              <p>
                <span className="font-bold text-gray-400">State:</span>{" "}
                {order.lunarState}
              </p>

              {order.acreagePurchased && (
                <p>
                  <span className="font-bold text-gray-400">
                    Acreage Purchased:
                  </span>{" "}
                  {order.acreagePurchased} Acre
                  {order.acreagePurchased === 1 ? "" : "s"}
                </p>
              )}

              {allocation && (
                <p>
                  <span className="font-bold text-gray-400">
                    Assigned Acre Range:
                  </span>{" "}
                  Acre {allocation.startingAcre.toLocaleString()}
                  {allocation.startingAcre !== allocation.endingAcre
                    ? ` through ${allocation.endingAcre.toLocaleString()}`
                    : ""}
                </p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-8">
          <h2 className="text-3xl font-black text-yellow-400">
            Financial
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm uppercase text-gray-400">Amount Paid</p>
              <p className="mt-2 text-3xl font-black">
                ${order.amountPaid.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm uppercase text-gray-400">
                Stripe Session
              </p>
              <p className="mt-2 break-all text-sm">
                {order.stripeSessionId}
              </p>
            </div>

            <div>
              <p className="text-sm uppercase text-gray-400">
                Gold Seal Upgrade
              </p>
              <p className="mt-2 text-xl font-black">
                {order.premiumGoldSeal ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={`/verify/${order.certificateNumber}`}
            className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
          >
            View Verification
          </a>

          <a
            href={`/api/generate-deed?certificateNumber=${encodeURIComponent(order.certificateNumber)}`}
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            Download Deed
          </a>
        </div>
      </div>
    </main>
  );
}