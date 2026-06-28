import Image from "next/image";
import { lunarAttractions } from "../../../lib/lunar-attractions";
import { getNearbyPropertiesForAttraction } from "../../../lib/attraction-service";

export default async function AttractionDetailPage({
  params,
}: {
  params: Promise<{ attractionId: string }>;
}) {
  const { attractionId } = await params;

  const attraction = lunarAttractions.find(
    (item) => item.id.toLowerCase() === attractionId.toLowerCase()
  );

  if (!attraction) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">Attraction Not Found</h1>
      </main>
    );
  }

  const nearbyProperties = getNearbyPropertiesForAttraction(attraction.id, 6);

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <Image
          src={attraction.image}
          alt={attraction.name}
          width={1200}
          height={650}
          className="mb-10 h-[420px] w-full rounded-3xl border border-yellow-400/30 object-cover"
        />
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          Lunar Attraction
        </p>

        <h1 className="mt-4 text-6xl font-black uppercase text-yellow-400">
          {attraction.name}
        </h1>

        <p className="mt-4 text-2xl font-bold">{attraction.type}</p>

        <p className="mt-6 max-w-4xl text-lg text-gray-300">
          {attraction.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={`/moon-map?attraction=${encodeURIComponent(attraction.id)}`}
            className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
          >
            Show on Atlas
          </a>

          <a
            href="/moon-map"
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            Back to Lunar Atlas
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">State</p>
            <p className="mt-2 text-2xl font-black">{attraction.state}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Coordinates</p>
            <p className="mt-2 text-2xl font-black">
              X: {attraction.x} · Y: {attraction.y}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Nearby Properties</p>
            <p className="mt-2 text-2xl font-black">
              {nearbyProperties.length}
            </p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            Nearby Properties
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {nearbyProperties.map((property) => (
              <a
                key={property.id}
                href={`/explore/${property.id}`}
                className="rounded-3xl border border-white/20 bg-white/5 p-6 transition hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                <p className="text-3xl font-black text-yellow-400">
                  {property.id}
                </p>

                <p className="mt-2">{property.type}</p>

                <p className="mt-2 text-gray-300">{property.state}</p>

                <p className="mt-4 text-2xl font-black">
                  ${property.price.toFixed(2)}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}