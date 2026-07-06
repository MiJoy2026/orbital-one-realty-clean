import { prisma } from "@/lib/prisma";

export default async function ExplorePage() {
  const [properties, stateCount, cityCount, townCount] = await Promise.all([
    prisma.property.findMany({
      orderBy: {
        id: "asc",
      },
    }),
    prisma.lunarState.count(),
    prisma.lunarCity.count(),
    prisma.lunarTown.count(),
  ]);

  const availableProperties = properties.filter(
    (property) => property.status !== "Sold"
  );

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Explore the Moon
        </h1>

        <p className="mt-6 text-center text-xl text-gray-300">
          Browse available novelty lunar properties across the official Orbital
          One lunar atlas.
        </p>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400 p-6 text-center">
            <p className="text-5xl font-black text-yellow-400">{stateCount}</p>
            <p className="mt-2 uppercase text-gray-300">Lunar States</p>
          </div>

          <div className="rounded-3xl border border-yellow-400 p-6 text-center">
            <p className="text-5xl font-black text-yellow-400">{cityCount}</p>
            <p className="mt-2 uppercase text-gray-300">Cities</p>
          </div>

          <div className="rounded-3xl border border-yellow-400 p-6 text-center">
            <p className="text-5xl font-black text-yellow-400">{townCount}</p>
            <p className="mt-2 uppercase text-gray-300">Towns</p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-4xl font-black uppercase">
            Available Property Inventory
          </h2>

          {availableProperties.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-8 text-center">
              <p className="text-2xl font-black text-yellow-400">
                No available properties are currently listed.
              </p>

              <p className="mt-3 text-gray-300">
                New lunar inventory will be released soon.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableProperties.map((property) => {
                const isSold = property.status === "Sold";

                return (
                  <div
                    key={property.id}
                    className={`rounded-3xl border p-6 ${
                      isSold
                        ? "border-red-500 bg-red-950/40 opacity-75"
                        : "border-green-500 bg-green-950/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-2xl font-black">{property.id}</h3>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          isSold
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-black"
                        }`}
                      >
                        {property.status}
                      </span>
                    </div>

                    <p className="mt-4 text-yellow-400">{property.type}</p>

                    <p className="mt-2 text-gray-300">{property.state}</p>

                    <p className="mt-4 text-xl font-bold">{property.size}</p>

                    <p className="mt-2 text-3xl font-black text-yellow-400">
                      ${property.price.toFixed(2)}
                    </p>

                    <div className="mt-6 space-y-3">
                      <a
                        href={`/explore/${property.id}`}
                        className="block w-full rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black"
                      >
                        View Details
                      </a>

                      <a
                        href={`/cart?propertyId=${property.id}`}
                        className="block w-full rounded-xl bg-green-500 px-5 py-3 text-center font-black text-black"
                      >
                        Add To Cart
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}