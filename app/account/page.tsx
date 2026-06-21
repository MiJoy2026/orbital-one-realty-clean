import { redirect } from "next/navigation";
import { getSessionUserId } from "../../lib/session";
import { prisma } from "../../lib/prisma";

export default async function AccountPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const email = user.email;
  const orders = user.orders;

  const allocations = await prisma.acreageAllocation.findMany({
    where: {
      certificateNumber: {
        in: orders.map((order) => order.certificateNumber),
      },
    },
  });

  const totalProperties = orders.length;
  const totalAcres = orders.reduce(
    (sum, order) => sum + (order.acreagePurchased || 0),
    0
  );
  const totalCertificates = orders.length;
  const hoaStatus = orders.length > 0 ? "2026 Founding Member" : "Inactive";
  const ruralAcresOwned = orders.reduce(
  (sum, order) => sum + (order.acreagePurchased || 0),
  0
);

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
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          My Orbital One Account
        </h1>

        <p className="mt-4 text-xl text-gray-300">
          View your lunar portfolio, documents, and HOA membership.
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
           <p className="mt-2 text-4xl font-black">{totalCertificates}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
           <p className="text-sm uppercase text-gray-400">Acres Owned</p>
           <p className="mt-2 text-4xl font-black">{totalAcres}</p>
          </div>

          <div className="rounded-2xl border border-green-500 bg-green-950/30 p-6">
           <p className="text-sm uppercase text-gray-400">HOA Status</p>
           <p className="mt-2 text-xl font-black text-green-400">
             {hoaStatus}
           </p>
          </div>
         </div>

          <div className="mt-6 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
           <p className="text-sm uppercase text-gray-400">Rural Acres</p>
           <p className="mt-2 text-4xl font-black">{ruralAcresOwned}</p>
          </div>

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
              <h2 className="text-3xl font-black uppercase text-yellow-400">
                My Lunar Properties
              </h2>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {orders.map((order) => {
                  const allocation = allocations.find(
                    (item) =>
                      item.certificateNumber === order.certificateNumber
                  );

                  return (
                    <div
                      key={`property-${order.id}`}
                      className="rounded-3xl border border-white/20 bg-white/5 p-6"
                    >
                      <p className="text-2xl font-black text-yellow-400">
                        {order.propertyId}
                      </p>

                      <p className="mt-2 text-gray-300">
                        {order.propertyType}
                      </p>

                      <p className="mt-2">Lunar State: {order.lunarState}</p>

                      {order.acreagePurchased && (
                        <p className="mt-2">
                          Acres Owned: {order.acreagePurchased}
                        </p>
                      )}

                      {allocation && (
                        <p className="mt-2 font-bold text-yellow-400">
                          Assigned Acre Range: Acre{" "}
                          {allocation.startingAcre.toLocaleString()}
                          {allocation.startingAcre !== allocation.endingAcre
                            ? ` - ${allocation.endingAcre.toLocaleString()}`
                            : ""}
                        </p>
                      )}

                      <a
                        href={`/explore/${order.propertyId}`}
                        className="mt-6 inline-block rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
                      >
                        View Property
                      </a>
                    </div>
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
                  const allocation = allocations.find(
                    (item) =>
                      item.certificateNumber === order.certificateNumber
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

                      {order.acreagePurchased && (
                        <p className="mt-2">
                          Acreage Purchased: {order.acreagePurchased} Acre
                          {order.acreagePurchased === 1 ? "" : "s"}
                        </p>
                      )}

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
                          href={`/api/generate-deed?propertyId=${order.propertyId}&deedName=${encodeURIComponent(
                            order.deedName
                          )}&certificateNumber=${encodeURIComponent(
                            order.certificateNumber
                          )}`}
                          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                        >
                          Download Deed
                        </a>

                        <a
                          href={`/api/generate-welcome-letter?propertyId=${order.propertyId}&deedName=${encodeURIComponent(
                            order.deedName
                          )}&certificateNumber=${encodeURIComponent(
                            order.certificateNumber
                          )}`}
                          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                        >
                          Download Welcome Letter
                        </a>

                        <a
                          href={`/api/generate-passport?propertyId=${order.propertyId}&deedName=${encodeURIComponent(
                            order.deedName
                          )}&certificateNumber=${encodeURIComponent(
                            order.certificateNumber
                          )}`}
                          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                        >
                          Download Passport
                        </a>

                        <a
                          href={`/api/generate-hoa-certificate?propertyId=${order.propertyId}&deedName=${encodeURIComponent(
                            order.deedName
                          )}&certificateNumber=${encodeURIComponent(
                            order.certificateNumber
                          )}`}
                          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
                        >
                          Download HOA Certificate
                        </a>
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