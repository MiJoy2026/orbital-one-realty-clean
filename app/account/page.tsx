import { redirect } from "next/navigation";

import LunaScapeImageGallery from "../../components/LunaScapeImageGallery";
import { prisma } from "../../lib/prisma";
import { getSessionUserId } from "../../lib/session";

export default async function AccountPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  const [member, orders] = await Promise.all([
    prisma.member.findUnique({
      where: { email: user.email },
    }),
    prisma.order.findMany({
      where: {
        paymentStatus: {
          equals: "Paid",
          mode: "insensitive",
        },
        OR: [
          { userId: user.id },
          { email: { equals: user.email, mode: "insensitive" } },
          {
            recipientEmail: {
              equals: user.email,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        propertySnapshot: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const allocations = await prisma.acreageAllocation.findMany({
    where: {
      certificateNumber: {
        in: orders.map((order) => order.certificateNumber),
      },
    },
  });
  const allocationByCertificate = new Map(
    allocations.map((allocation) => [
      allocation.certificateNumber,
      allocation,
    ])
  );
  const totalProperties = orders.length;
  const totalAcres = orders.reduce(
    (sum, order) => sum + (order.acreagePurchased || 0),
    0
  );
  const hoaStatus =
    member || orders.some((order) => order.hoaClaimed)
      ? "2026 Charter HOA Member"
      : orders.length > 0
        ? "Pending Activation"
        : "Inactive";
  const townBlocksOwned = orders.filter(
    (order) => order.propertyType === "Town Block"
  ).length;
  const cityBlocksOwned = orders.filter(
    (order) => order.propertyType === "City Block"
  ).length;
  const portfolioValue = orders.reduce(
    (sum, order) => sum + order.amountPaid,
    0
  );

  return (
    <main
      className="min-h-screen px-6 py-20 text-white"
      style={{
        backgroundImage: "url('/backgrounds/account-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-7xl rounded-3xl bg-black/80 p-8 backdrop-blur-sm">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-400">
          Orbital One Customer Portal
        </p>
        <h1 className="mt-3 text-5xl font-black uppercase text-yellow-400">
          My Lunar Portfolio
        </h1>
        <p className="mt-4 text-xl text-gray-300">
          View your owned properties, LunaScape images, documents, and HOA
          membership.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-yellow-400 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Properties Owned</p>
            <p className="mt-2 text-4xl font-black text-yellow-400">
              {totalProperties}
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Certificates</p>
            <p className="mt-2 text-4xl font-black">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Rural Acres</p>
            <p className="mt-2 text-4xl font-black">{totalAcres}</p>
          </div>
          <div className="rounded-2xl border border-green-500 bg-green-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">HOA Status</p>
            <p className="mt-2 text-xl font-black text-green-400">
              {hoaStatus}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Town Blocks</p>
            <p className="mt-2 text-4xl font-black">{townBlocksOwned}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">City Blocks</p>
            <p className="mt-2 text-4xl font-black">{cityBlocksOwned}</p>
          </div>
          <div className="rounded-2xl border border-yellow-400 bg-yellow-400/10 p-6">
            <p className="text-sm uppercase text-gray-400">Portfolio Value</p>
            <p className="mt-2 text-4xl font-black text-yellow-400">
              ${portfolioValue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/account/hoa"
            className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
          >
            View HOA Membership
          </a>
          {orders.length > 0 && (
            <a
              href={`/moon-map?property=${orders[0].propertyId}&owned=${orders
                .map((order) => order.propertyId)
                .join(",")}`}
              className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
            >
              Explore My Properties
            </a>
          )}
          <a
            href="/logout"
            className="rounded-xl border border-white/30 px-5 py-3 font-black text-white"
          >
            Logout
          </a>
        </div>

        {orders.length === 0 ? (
          <p className="mt-10 text-gray-400">No purchases found.</p>
        ) : (
          <>
            <section className="mt-16">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
                    LunaScape
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase text-white">
                    My Owned Properties
                  </h2>
                </div>
                <p className="max-w-xl text-sm text-gray-400">
                  Each property now includes a shareable scenic portrait made from
                  real LROC terrain plus an exact parcel locator.
                </p>
              </div>

              <div className="mt-8 grid gap-7 lg:grid-cols-2">
                {orders.map((order) => {
                  const allocation = allocationByCertificate.get(
                    order.certificateNumber
                  );
                  const snapshot = order.propertySnapshot;
                  const location = snapshot?.locationLabel || order.lunarState;

                  return (
                    <article
                      key={`property-${order.id}`}
                      className="overflow-hidden rounded-3xl border border-white/20 bg-white/5 transition hover:border-yellow-400 hover:bg-yellow-400/5"
                    >
                      {snapshot ? (
                        <LunaScapeImageGallery
                          snapshotId={snapshot.id}
                          propertyId={order.propertyId}
                          compact
                          showDescription={false}
                        />
                      ) : (
                        <div className="flex aspect-[8/5] items-center justify-center bg-slate-950 p-8 text-center">
                          <div>
                            <p className="text-lg font-black text-yellow-400">
                              Property image preparation pending
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                              Your property and documents remain fully recorded.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="rounded-full bg-yellow-400 px-4 py-1 text-sm font-black text-black">
                            {order.propertyType}
                          </span>
                          <span className="rounded-full border border-green-500/70 px-3 py-1 text-xs font-black uppercase text-green-300">
                            Owned
                          </span>
                        </div>

                        <p className="mt-5 break-words text-2xl font-black text-yellow-400">
                          {order.propertyId}
                        </p>
                        <p className="mt-2 text-gray-300">{location}</p>

                        <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 sm:grid-cols-2">
                          <p>
                            <span className="block text-xs font-bold uppercase text-gray-500">
                              Certificate
                            </span>
                            <span className="mt-1 block break-all font-bold">
                              {order.certificateNumber}
                            </span>
                          </p>
                          <p>
                            <span className="block text-xs font-bold uppercase text-gray-500">
                              Purchased
                            </span>
                            <span className="mt-1 block font-bold">
                              {order.createdAt.toLocaleDateString()}
                            </span>
                          </p>
                        </div>

                        {allocation && (
                          <div className="mt-4 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-4">
                            <p className="text-sm font-bold uppercase text-yellow-400">
                              Assigned Acre Range
                            </p>
                            <p className="mt-2 text-xl font-black text-yellow-400">
                              Acre {allocation.startingAcre.toLocaleString()}
                              {allocation.startingAcre !== allocation.endingAcre
                                ? ` - ${allocation.endingAcre.toLocaleString()}`
                                : ""}
                            </p>
                          </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <a
                            href={`/explore/${order.propertyId}`}
                            className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
                          >
                            View Property
                          </a>
                          <a
                            href={`/moon-map?property=${encodeURIComponent(order.propertyId)}&owned=${encodeURIComponent(order.propertyId)}`}
                            className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                          >
                            View on Moon Map
                          </a>
                          {snapshot && (
                            <a
                              href={`/api/property-image/${snapshot.id}?view=scenic&download=1`}
                              className="rounded-xl border border-white/30 px-5 py-3 font-black text-white"
                            >
                              Download Scenic View
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-16">
              <h2 className="text-3xl font-black uppercase text-yellow-400">
                My Documents
              </h2>

              <div className="mt-8 grid gap-6">
                {orders.map((order) => {
                  const allocation = allocationByCertificate.get(
                    order.certificateNumber
                  );
                  const certificateQuery = encodeURIComponent(
                    order.certificateNumber
                  );

                  return (
                    <div
                      key={order.id}
                      className="rounded-3xl border border-white/20 bg-white/5 p-6"
                    >
                      <p className="text-2xl font-black text-yellow-400">
                        {order.certificateNumber}
                      </p>
                      <p className="mt-2 text-gray-300">
                        {order.propertyType} · {order.lunarState}
                      </p>
                      <p className="mt-2">Property ID: {order.propertyId}</p>
                      <p className="mt-2">
                        Purchase Date: {order.createdAt.toLocaleDateString()}
                      </p>

                      {allocation && (
                        <p className="mt-2 font-bold text-yellow-400">
                          Assigned Acre Range: Acre{" "}
                          {allocation.startingAcre.toLocaleString()}
                          {allocation.startingAcre !== allocation.endingAcre
                            ? ` through ${allocation.endingAcre.toLocaleString()}`
                            : ""}
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <a
                          href={`/verify/${order.certificateNumber}`}
                          className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
                        >
                          Verify Certificate
                        </a>
                        <a
                          href={`/api/generate-deed?certificateNumber=${certificateQuery}`}
                          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                        >
                          Download Deed
                        </a>
                        <a
                          href={`/api/generate-welcome-letter?certificateNumber=${certificateQuery}`}
                          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                        >
                          Welcome Letter
                        </a>
                        <a
                          href={`/api/generate-hoa-certificate?certificateNumber=${certificateQuery}`}
                          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                        >
                          HOA Certificate
                        </a>
                        {order.passportPurchased && (
                          <a
                            href={`/api/generate-passport?certificateNumber=${certificateQuery}`}
                            className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                          >
                            Lunar Passport
                          </a>
                        )}
                        {order.propertySnapshot && (
                          <a
                            href={`/api/property-image/${order.propertySnapshot.id}?view=scenic&download=1`}
                            className="rounded-xl border border-white/30 px-5 py-3 font-black text-white"
                          >
                            Scenic Property View
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
