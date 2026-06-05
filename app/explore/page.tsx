import { lunarStates, sampleProperties } from "@/lib/moon-data";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Explore the Moon
        </h1>

        <p className="mt-6 text-center text-xl text-gray-300">
          Browse available novelty lunar properties across 57 lunar states,
          171 cities, and 1,140 towns.
        </p>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400 p-6 text-center">
            <p className="text-5xl font-black text-yellow-400">
              {lunarStates.length}
            </p>
            <p className="mt-2 uppercase text-gray-300">Lunar States</p>
          </div>

          <div className="rounded-3xl border border-yellow-400 p-6 text-center">
            <p className="text-5xl font-black text-yellow-400">
              {lunarStates.length * 3}
            </p>
            <p className="mt-2 uppercase text-gray-300">Cities</p>
          </div>

          <div className="rounded-3xl border border-yellow-400 p-6 text-center">
            <p className="text-5xl font-black text-yellow-400">
              {lunarStates.length * 20}
            </p>
            <p className="mt-2 uppercase text-gray-300">Towns</p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-4xl font-black uppercase">
            Property Inventory Preview
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleProperties.map((property) => {
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
                    <h3 className="text-2xl font-black">
                      {property.id}
                    </h3>

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

                  <p className="mt-4 text-yellow-400">
                    {property.type}
                  </p>

                  <p className="mt-2 text-gray-300">
                    {property.state}
                  </p>

                  {property.city && (
                    <p className="text-gray-300">
                      City: {property.city}
                    </p>
                  )}

                  {property.town && (
                    <p className="text-gray-300">
                      Town: {property.town}
                    </p>
                  )}

                  <p className="mt-4 text-xl font-bold">
                    {property.size}
                  </p>

                  <p className="mt-2 text-3xl font-black text-yellow-400">
                    ${property.price.toFixed(2)}
                  </p>

                    <div className="mt-5">
                        <p className="font-bold">Nearby Attractions:</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-300">
                        {property.nearbyAttractions.map((attraction) => (
                            <li key={attraction}>• {attraction}</li>
                        ))}
                        </ul>
                    </div>

                    <div className="mt-6 space-y-3">
                    <a
                        href={`/explore/${property.id}`}
                        className="block w-full rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black"
                    >
                        View Details
                    </a>

                    <button
                        disabled={isSold}
                        className={`w-full rounded-xl px-5 py-3 font-black ${
                        isSold
                            ? "cursor-not-allowed bg-gray-700 text-gray-400"
                            : "bg-green-500 text-black"
                        }`}
                    >
                        {isSold ? "Sold / Unavailable" : "Add To Cart"}
                    </button>
                </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}