import AdminNav from "../../../components/AdminNav";
import LunaScapeImageGallery from "../../../components/LunaScapeImageGallery";
import PropertySnapshotAdminControls from "../../../components/PropertySnapshotAdminControls";
import { inspectOwnedPropertySnapshotEligibilityForOrderIds } from "../../../lib/owned-property-snapshot";
import { prisma } from "../../../lib/prisma";

export default async function AdminPropertyImagesPage() {
  const [paidOrders, snapshotCount, recentSnapshots] = await Promise.all([
    prisma.order.findMany({
      where: {
        paymentStatus: { equals: "Paid", mode: "insensitive" },
      },
      select: {
        id: true,
        propertyId: true,
        propertySnapshot: { select: { id: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ownedPropertySnapshot.count(),
    prisma.ownedPropertySnapshot.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        order: {
          select: {
            id: true,
            deedName: true,
            createdAt: true,
          },
        },
      },
    }),
  ]);

  const missingOrders = paidOrders.filter((order) => !order.propertySnapshot);
  const eligibility = await inspectOwnedPropertySnapshotEligibilityForOrderIds(
    missingOrders.map((order) => order.id)
  );
  const eligibleMissingCount = eligibility.filter((item) => item.eligible).length;
  const historicalCount = eligibility.filter((item) => !item.eligible).length;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
          LunaScape Launch Foundation
        </p>
        <h1 className="mt-3 text-5xl font-black uppercase text-yellow-400">
          LunaScape Image Collections
        </h1>
        <p className="mt-4 max-w-3xl text-gray-300">
          Monitor scenic LROC terrain portraits and exact parcel locators for
          purchases made in the active Grid V2 geography. Earlier Grid V2
          sales remain preserved when their original geometry is no longer active.
        </p>

        <AdminNav />

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Paid Orders</p>
            <p className="mt-2 text-4xl font-black">{paidOrders.length}</p>
          </div>
          <div className="rounded-2xl border border-green-500/50 bg-green-950/20 p-6">
            <p className="text-sm uppercase text-gray-400">Images Ready</p>
            <p className="mt-2 text-4xl font-black text-green-400">
              {snapshotCount}
            </p>
          </div>
          <div
            className={`rounded-2xl border p-6 ${
              eligibleMissingCount > 0
                ? "border-orange-400/60 bg-orange-950/20"
                : "border-green-500/50 bg-green-950/20"
            }`}
          >
            <p className="text-sm uppercase text-gray-400">
              Current Images Missing
            </p>
            <p
              className={`mt-2 text-4xl font-black ${
                eligibleMissingCount > 0 ? "text-orange-300" : "text-green-400"
              }`}
            >
              {eligibleMissingCount}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-400/50 bg-sky-950/20 p-6">
            <p className="text-sm uppercase text-gray-400">
              Historical Prior-Geography
            </p>
            <p className="mt-2 text-4xl font-black text-sky-300">
              {historicalCount}
            </p>
          </div>
        </section>

        {historicalCount > 0 && (
          <section className="mt-8 rounded-3xl border border-sky-400/40 bg-sky-950/20 p-7">
            <h2 className="text-2xl font-black text-sky-300">
              Historical Grid V2 sales preserved
            </h2>
            <p className="mt-3 max-w-3xl text-gray-300">
              These paid orders belong to a prior Grid V2 geography release.
              They remain valid orders and keep their sold status, but the
              current renderer cannot recreate geometry that is no longer
              selectable in the active release. They are excluded from missing
              image totals and automatic backfill.
            </p>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-7">
          <h2 className="text-2xl font-black text-yellow-400">
            Current-release backfill
          </h2>
          <p className="mt-3 max-w-3xl text-gray-300">
            This processes only paid properties that are selectable in the
            active Grid V2 geography. Historical prior-geography orders are
            skipped automatically.
          </p>
          <div className="mt-5">
            <PropertySnapshotAdminControls missingCount={eligibleMissingCount} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            Recent LunaScape collections
          </h2>

          {recentSnapshots.length === 0 ? (
            <p className="mt-6 text-gray-400">No property snapshots yet.</p>
          ) : (
            <div className="mt-7 grid gap-6 xl:grid-cols-2">
              {recentSnapshots.map((snapshot) => (
                <article
                  key={snapshot.id}
                  className="overflow-hidden rounded-3xl border border-white/20 bg-white/5"
                >
                  <LunaScapeImageGallery
                    snapshotId={snapshot.id}
                    propertyId={snapshot.propertyId}
                    compact
                    showDescription={false}
                  />
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                      {snapshot.propertyType}
                    </p>
                    <p className="mt-2 break-words font-black text-white">
                      {snapshot.propertyId}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      {snapshot.locationLabel}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Owner: {snapshot.order.deedName}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={`/api/property-image/${snapshot.id}?view=scenic&download=1`}
                        className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black"
                      >
                        Scenic View
                      </a>
                      <a
                        href={`/admin/orders/${snapshot.order.id}`}
                        className="rounded-xl border border-white/30 px-4 py-2 text-sm font-black text-white"
                      >
                        Order
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
