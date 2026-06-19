import { prisma } from "../../lib/prisma";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email || "";

  const orders = email
  ? await prisma.order.findMany({
      where: {
        email,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  : [];

const allocations = await prisma.acreageAllocation.findMany({
  where: {
    certificateNumber: {
      in: orders.map((order) => order.certificateNumber),
    },
  },
});

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          My Orbital One Account
        </h1>

        <p className="mt-4 text-xl text-gray-300">
          View your purchased lunar properties and certificates.
        </p>

        {!email ? (
          <div className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
            <p className="text-lg text-gray-300">
              Add your checkout email to the URL to view purchases.
            </p>

            <p className="mt-4 rounded-xl bg-black p-4 text-yellow-400">
              /account?email=your@email.com
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <h2 className="text-3xl font-black text-yellow-400">
              Orders for {email}
            </h2>
            <div className="mt-4">
            <a
               href={`/account/hoa?email=${encodeURIComponent(email)}`}
               className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
            >
                View HOA Membership
            </a>
          </div>

            {orders.length === 0 ? (
              <p className="mt-6 text-gray-400">
                No purchases found for this email.
              </p>
            ) : (
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

                      <p className="mt-2">
                        Property ID: {order.propertyId}
                      </p>

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
            )}
          </div>
        )}
      </div>
    </main>
  );
}