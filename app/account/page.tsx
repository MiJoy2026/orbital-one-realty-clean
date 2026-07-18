import Image from "next/image";
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
});

if (!user) {
  redirect("/login");
}

const member = await prisma.member.findUnique({
  where: {
    email: user.email,
  },
});

const orders = await prisma.order.findMany({
  where: {
    OR: [
      { userId: user.id },
      { email: user.email },
      { recipientEmail: user.email },
    ],
  },
  orderBy: {
    createdAt: "desc",
  },
});

  const email = user.email;

  const allocations = await prisma.acreageAllocation.findMany({
    where: {
      certificateNumber: {
        in: orders.map(
         (order: { certificateNumber: string }) => order.certificateNumber
        ),
      },
    },
  });

  const totalProperties = orders.length;
  const totalAcres = orders.reduce(
  (
    sum: number,
    order: { acreagePurchased: number | null }
  ) => sum + (order.acreagePurchased || 0),
  0
  );
  const totalCertificates = orders.length;
  const hoaStatus =
  member || orders.some((order) => order.hoaClaimed)
    ? "2026 Charter HOA Member"
    : orders.length > 0
    ? "Pending Activation"
    : "Inactive";
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
    <main
      className="min-h-screen px-6 py-20 text-white"
      style={{
        backgroundImage: "url('/backgrounds/account-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-6xl rounded-3xl bg-black/75 p-8 backdrop-blur-sm">
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
                      className="overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-6 transition hover:border-yellow-400 hover:bg-yellow-400/5"
                    >
                      <Image
                       src={
                       order.propertyType === "City Block"
                       ? "/property-images/city-block.jpg"
                       : order.propertyType === "Town Block"
                       ? "/property-images/town-block.jpg"
                       : "/property-images/rural-acre.jpg"
                       }
                       alt={order.propertyType}
                       width={800}
                       height={500}
                       className="mb-5 h-64 w-full rounded-2xl object-cover"
                      />
                      <div className="mb-3 inline-block rounded-full bg-yellow-400 px-4 py-1 text-sm font-black text-black">
                      {order.propertyType}
                      </div>
                      <div className="flex items-center justify-between">
                      <p className="text-3xl font-black text-yellow-400">
    {order.propertyId}
                      </p>

                      <span className="rounded-full border border-yellow-400 px-3 py-1 text-xs font-black uppercase text-yellow-400">
                        Owned
                      </span>
                      </div>

                      <p className="mt-2 text-gray-300">
                        {order.propertyType}
                      </p>

                      <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p>
                      <span className="font-bold text-gray-400">Lunar State:</span>{" "}
                        {order.lunarState}
                      </p>

                        {order.acreagePurchased && (
                      <p>
                      <span className="font-bold text-gray-400">Acres Owned:</span>{" "}
                        {order.acreagePurchased}
                      </p>
                      )}
                      </div>

                      {allocation && (
                       <div className="mt-4 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-4">
                        <p className="text-sm font-bold uppercase text-yellow-400">
                          Assigned Acre Range
                        </p>

                        <p className="mt-2 text-2xl font-black text-yellow-400">
                          Acre {allocation.startingAcre.toLocaleString()}
                           {allocation.startingAcre !== allocation.endingAcre
                            ? ` - ${allocation.endingAcre.toLocaleString()}`
                            : ""}
                        </p>
                       </div>
                      )}

                      <div className="mt-6 flex items-center justify-between">
                       <span className="text-sm uppercase tracking-wider text-gray-500">
                         Orbital One Realty
                       </span>

                       <a
                        href={`/explore/${order.propertyId}`}
                        className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:scale-105"
                       >
                         View Property →
                       </a>
                      </div>
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