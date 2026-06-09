import { sampleProperties } from "../../../lib/moon-data";

export default async function PropertyExplorerPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;

  const property = sampleProperties.find(
    (item) => item.id.toLowerCase() === propertyId.toLowerCase()
  );

  if (!property) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">Property Not Found</h1>
        <a href="/explore" className="mt-8 inline-block text-yellow-400">
          Back to Explore
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
          Orbital One Realty Property
        </p>

        <h1 className="mt-3 text-6xl font-black uppercase">
          {property.id}
        </h1>

        <p className="mt-4 text-2xl font-bold text-yellow-400">
          {property.type} · {property.size}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400 p-6">
            <p className="text-sm uppercase text-gray-400">Price</p>
            <p className="mt-2 text-4xl font-black text-yellow-400">
              ${property.price.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 p-6">
            <p className="text-sm uppercase text-gray-400">State</p>
            <p className="mt-2 text-2xl font-black">{property.state}</p>
          </div>

          <div className="rounded-2xl border border-white/20 p-6">
            <p className="text-sm uppercase text-gray-400">Status</p>
            <p
              className={`mt-2 text-2xl font-black ${
                property.status === "Sold"
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {property.status}
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
          <h2 className="text-3xl font-black text-yellow-400">
            Property Location
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <p>
              <span className="font-bold text-gray-400">State:</span>{" "}
              {property.state}
            </p>

            {property.city && (
              <p>
                <span className="font-bold text-gray-400">City:</span>{" "}
                {property.city}
              </p>
            )}

            {property.town && (
              <p>
                <span className="font-bold text-gray-400">Town:</span>{" "}
                {property.town}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
          <h2 className="text-3xl font-black text-yellow-400">
            Nearby Lunar Attractions
          </h2>

          <div className="mt-6 flex flex-wrap gap-3">
            {property.nearbyAttractions.map((attraction) => (
              <span
                key={attraction}
                className="rounded-full border border-yellow-400 px-4 py-2 text-sm font-bold text-yellow-400"
              >
                {attraction}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          {property.status === "Available" ? (
            <a
              href={`/cart?propertyId=${property.id}`}
              className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black"
            >
              Purchase This Property
            </a>
          ) : (
            <div className="rounded-xl bg-red-600 px-8 py-4 font-black text-white">
              Sold
            </div>
          )}

          <a
            href={`/states/${encodeURIComponent(property.state)}`}
            className="rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
          >
            Back to State
          </a>

          <a
            href="/moon-map"
            className="rounded-xl border border-white/30 px-8 py-4 font-black text-white"
          >
            Back to Lunar Atlas
          </a>
        </div>
      </div>
    </main>
  );
}