import Link from "next/link";

import {
  getLunarCityByName,
  getLunarCityMatches,
  getPropertiesByCity,
} from "@/lib/atlas-service";
import { getLunarCityHref } from "@/lib/lunar-location-links";

export default async function CityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ cityName: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { cityName } = await params;
  const { state: requestedState } = await searchParams;
  const decodedCityName = decodeURIComponent(cityName);
  const decodedStateName = requestedState
    ? decodeURIComponent(requestedState)
    : undefined;
  const matches = getLunarCityMatches(decodedCityName);

  if (!decodedStateName && matches.length > 1) {
    return (
      <main className="min-h-screen bg-[#02040a] px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-9">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
            LunaSphere Location Check
          </p>
          <h1 className="mt-5 text-4xl font-black uppercase sm:text-6xl">
            Choose the Correct {decodedCityName}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            More than one lunar state contains a city with this name. Choose the
            state you intended to visit.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {matches.map((match) => (
              <Link
                key={`${match.state.name}-${match.name}`}
                href={getLunarCityHref(match.state.name, match.name)}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-yellow-400/60"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
                  {match.state.name} State
                </p>
                <h2 className="mt-2 text-2xl font-black">{match.name}</h2>
                <p className="mt-3 leading-7 text-slate-400">
                  {match.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const city = await getLunarCityByName(decodedCityName, decodedStateName);

  if (!city) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">City Not Found</h1>
        <Link href="/moon-map" className="mt-8 inline-block text-yellow-400">
          Back to Lunar Atlas
        </Link>
      </main>
    );
  }

  const cityProperties = await getPropertiesByCity(city.name, city.state.name);
  const available = cityProperties.filter(
    (property) => property.status === "Available"
  );
  const reserved = cityProperties.filter(
    (property) => property.status === "Reserved"
  );
  const sold = cityProperties.filter((property) => property.status === "Sold");

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
      <div className="mx-auto max-w-7xl rounded-3xl bg-black/75 p-8 backdrop-blur-sm">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          {city.state.name} City Region
        </p>
        <h1 className="mt-4 text-6xl font-black uppercase text-yellow-400">
          {city.name}
        </h1>
        <p className="mt-6 max-w-4xl text-lg text-gray-300">
          {city.description}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/states/${encodeURIComponent(city.state.name)}`}
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            Back to {city.state.name}
          </Link>
          <Link
            href="/moon-map"
            className="rounded-xl border border-white/30 px-6 py-3 font-black text-white"
          >
            Back to Lunar Atlas
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-yellow-400 bg-white/5 p-6">
            <p className="text-4xl font-black text-yellow-400">
              {cityProperties.length}
            </p>
            <p className="mt-2 uppercase text-gray-400">City Blocks Recorded</p>
          </div>
          <div className="rounded-2xl border border-green-500 bg-green-950/30 p-6">
            <p className="text-4xl font-black text-green-400">
              {available.length}
            </p>
            <p className="mt-2 uppercase text-gray-400">Available</p>
          </div>
          <div className="rounded-2xl border border-amber-500 bg-amber-950/30 p-6">
            <p className="text-4xl font-black text-amber-300">
              {reserved.length}
            </p>
            <p className="mt-2 uppercase text-gray-400">Reserved</p>
          </div>
          <div className="rounded-2xl border border-red-500 bg-red-950/30 p-6">
            <p className="text-4xl font-black text-red-400">{sold.length}</p>
            <p className="mt-2 uppercase text-gray-400">Sold</p>
          </div>
        </div>
        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            City Block Properties
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {cityProperties.length > 0 ? (
              cityProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/explore/${property.id}`}
                  className="rounded-3xl border border-white/20 bg-white/5 p-6 transition hover:border-yellow-400 hover:bg-yellow-400/10"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="break-all text-2xl font-black text-yellow-400">
                      {property.id}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        property.status === "Sold"
                          ? "bg-red-600 text-white"
                          : property.status === "Reserved"
                            ? "bg-amber-400 text-black"
                            : "bg-green-500 text-black"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                  <p className="mt-3 font-bold text-yellow-400">
                    {property.type}
                  </p>
                  <p className="mt-2 text-gray-300">{property.size}</p>
                  <p className="mt-4 text-2xl font-black">
                    ${property.price.toFixed(2)}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-gray-400 md:col-span-2">
                No city-block records have been created in this city yet. Use
                the Atlas to choose an exact location or Quick Pick for a faster
                assignment.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
