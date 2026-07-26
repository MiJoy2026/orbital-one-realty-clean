import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/components/JsonLd";

import {
  getLunarCityByName,
  getLunarCityMatches,
  getPropertiesByCity,
} from "@/lib/atlas-service";
import { getLunarAttractionsByState } from "@/lib/lunar-attractions";
import {
  getLunarCityHref,
  getLunarTownHref,
} from "@/lib/lunar-location-links";
import { lunarStateDetails } from "@/lib/lunar-state-details";
import { SITE_URL, createPageMetadata, truncateDescription } from "@/lib/seo";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ cityName: string }>;
  searchParams: Promise<{ state?: string }>;
}): Promise<Metadata> {
  const { cityName } = await params;
  const { state: requestedState } = await searchParams;
  const decodedCityName = decodeURIComponent(cityName);
  const decodedStateName = requestedState
    ? decodeURIComponent(requestedState)
    : undefined;
  const matches = getLunarCityMatches(decodedCityName);

  if (!decodedStateName && matches.length > 1) {
    return createPageMetadata({
      title: `Choose ${decodedCityName} Lunar City | Orbital One Realty`,
      description: `Choose the LunaSphere state containing the ${decodedCityName} lunar city you want to explore.`,
      path: `/cities/${encodeURIComponent(decodedCityName)}`,
      noIndex: true,
      follow: true,
    });
  }

  const city = await getLunarCityByName(decodedCityName, decodedStateName);

  if (!city) {
    return createPageMetadata({
      title: "Lunar City Not Found | Orbital One Realty",
      description: "The requested LunaSphere lunar city could not be found.",
      path: `/cities/${encodeURIComponent(decodedCityName)}`,
      noIndex: true,
      follow: false,
    });
  }

  const canonicalPath = getLunarCityHref(city.state.name, city.name);
  const stateAttraction = getLunarAttractionsByState(city.state.name)[0];

  return createPageMetadata({
    title: `${city.name}, ${city.state.name}: Lunar City Blocks & Moon Atlas | Orbital One Realty`,
    description: truncateDescription(
      `${city.description} Explore this LunaSphere lunar city, nearby landmarks, and available novelty city-block property.`
    ),
    path: canonicalPath,
    image: stateAttraction?.image ?? "/property-images/city-block.jpg",
    imageAlt: `${city.name} lunar city in ${city.state.name} State`,
  });
}

const statusOrder: Record<string, number> = {
  Available: 0,
  Reserved: 1,
  Sold: 2,
};

function statusClass(status: string) {
  if (status === "Sold") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  }

  if (status === "Reserved") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-200";
  }

  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-200";
}

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
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.15),transparent_42%)] p-8 sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
              LunaSphere Location Check
            </p>
            <h1 className="mt-5 text-4xl font-black uppercase leading-none sm:text-6xl">
              Choose the Correct {decodedCityName}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
              More than one lunar state contains a city with this name. Select
              the state you intended so LunaSphere can open the correct city and
              its state-scoped property inventory.
            </p>
          </div>

          <div className="grid gap-4 p-8 sm:grid-cols-2 sm:p-12">
            {matches.map((match) => (
              <Link
                key={`${match.state.name}-${match.name}`}
                href={getLunarCityHref(match.state.name, match.name)}
                className="group rounded-3xl border border-white/10 bg-black/30 p-6 transition hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-yellow-400/[0.06]"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
                  {match.state.name} State
                </p>
                <h2 className="mt-3 text-3xl font-black">{match.name}</h2>
                <p className="mt-4 leading-7 text-slate-400">
                  {match.description}
                </p>
                <p className="mt-6 font-black text-yellow-400 transition group-hover:text-yellow-300">
                  Enter this city →
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
    notFound();
  }

  const stateDetail = lunarStateDetails[city.state.name];

  if (!stateDetail) {
    return (
      <main className="min-h-screen bg-[#02040a] px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
          <h1 className="text-5xl font-black uppercase">City Data Unavailable</h1>
          <Link href="/states" className="mt-8 inline-block text-yellow-400">
            Browse Lunar States
          </Link>
        </div>
      </main>
    );
  }

  const [cityProperties, stateAttractions] = await Promise.all([
    getPropertiesByCity(city.name, city.state.name),
    Promise.resolve(getLunarAttractionsByState(city.state.name)),
  ]);

  const available = cityProperties.filter(
    (property) => property.status === "Available"
  );
  const reserved = cityProperties.filter(
    (property) => property.status === "Reserved"
  );
  const sold = cityProperties.filter((property) => property.status === "Sold");
  const orderedProperties = [...cityProperties].sort((first, second) => {
    const statusDifference =
      (statusOrder[first.status] ?? 9) - (statusOrder[second.status] ?? 9);

    return statusDifference || first.id.localeCompare(second.id);
  });
  const featuredProperties = orderedProperties.slice(0, 8);
  const heroAttraction = stateAttractions[0] ?? null;
  const heroImage = heroAttraction?.image ?? "/property-images/city-block.jpg";
  const cityIndex =
    stateDetail.cities.findIndex(
      (candidate) => candidate.name.toLowerCase() === city.name.toLowerCase()
    ) + 1;
  const siblingCities = stateDetail.cities.filter(
    (candidate) => candidate.name.toLowerCase() !== city.name.toLowerCase()
  );
  const featuredTowns = [...stateDetail.towns]
    .sort((first, second) => Number(Boolean(second.featured)) - Number(Boolean(first.featured)))
    .slice(0, 4);

  const canonicalPath = getLunarCityHref(city.state.name, city.name);
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Lunar States",
        item: `${SITE_URL}/states`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: city.state.name,
        item: `${SITE_URL}/states/${encodeURIComponent(city.state.name)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: city.name,
        item: `${SITE_URL}${canonicalPath}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-white">
      <JsonLd data={breadcrumbStructuredData} />
      <section className="relative isolate min-h-[700px] overflow-hidden border-b border-cyan-300/20">
        <Image
          src={heroImage}
          alt={
            heroAttraction
              ? `${heroAttraction.name} near ${city.name}, ${city.state.name}`
              : `LunaSphere city-block concept for ${city.name}`
          }
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(34,211,238,0.16),transparent_30%),linear-gradient(90deg,rgba(2,4,10,0.99)_0%,rgba(2,4,10,0.92)_46%,rgba(2,4,10,0.36)_78%,rgba(2,4,10,0.86)_100%)]" />

        <div className="relative mx-auto flex min-h-[700px] max-w-7xl items-center px-6 py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              <Link href="/explore" className="transition hover:text-yellow-400">
                Explore
              </Link>
              <span>•</span>
              <Link href="/states" className="transition hover:text-yellow-400">
                Lunar States
              </Link>
              <span>•</span>
              <Link
                href={`/states/${encodeURIComponent(city.state.name)}`}
                className="transition hover:text-yellow-400"
              >
                {city.state.name}
              </Link>
              <span>•</span>
              <span className="text-cyan-200">{city.name}</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <p className="text-sm font-black uppercase tracking-[0.42em] text-cyan-300">
                Orbital One Lunar City
              </p>
              {city.featured && (
                <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-300">
                  Featured Destination
                </span>
              )}
            </div>

            <h1 className="mt-5 text-6xl font-black uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
              {city.name}
            </h1>
            <p className="mt-5 text-xl font-black text-yellow-300 sm:text-3xl">
              City {String(Math.max(cityIndex, 1)).padStart(2, "0")} of {city.state.name} · {stateDetail.nickname}
            </p>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
              {city.description}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/moon-map"
                className="rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
              >
                Explore on the Atlas
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-cyan-200/40 bg-cyan-300/10 px-7 py-4 text-sm font-black uppercase tracking-wide text-cyan-100 backdrop-blur transition hover:border-cyan-200 hover:bg-cyan-300/20"
              >
                Quick Pick a City Block
              </Link>
            </div>

            {heroAttraction && (
              <Link
                href={`/attractions/${heroAttraction.id}`}
                className="mt-6 inline-flex text-sm font-bold text-slate-300 transition hover:text-yellow-400"
              >
                Nearby state destination: {heroAttraction.name} →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          {[
            [cityProperties.length.toLocaleString(), "City Blocks Recorded"],
            [available.length.toLocaleString(), "Available Now"],
            [reserved.length.toLocaleString(), "Reserved"],
            [sold.length.toLocaleString(), "Sold"],
          ].map(([value, label]) => (
            <div key={label} className="bg-[#050812] px-5 py-8 text-center">
              <p className="text-4xl font-black text-yellow-400 sm:text-5xl">
                {value}
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              City Identity
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              A Premium Address Inside {city.state.name}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              City Blocks are Orbital One&apos;s premium LunaSphere locations.
              Each one belongs to a named city, a specific lunar state, and a
              fixed Grid V2 parcel that can be revisited through the Moon Atlas.
            </p>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Your novelty ownership package includes a personalized deed,
              LunaScape property imagery, and ongoing 2026 Charter HOA
              membership benefits.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                label: "Named Destination",
                value: city.name,
                text: `A distinct city identity within ${city.state.name} State.`,
              },
              {
                label: "Premium Property Type",
                value: "City Block",
                text: "An urban-style novelty address with a fixed Atlas location.",
              },
              {
                label: "Personalized Package",
                value: "Deed + LunaScape",
                text: "Ownership documents and two customer-facing property images.",
              },
              {
                label: "Member Status",
                value: "2026 Charter HOA",
                text: "Founding-era recognition, updates, and future member experiences.",
              },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  {item.label}
                </p>
                <h3 className="mt-3 text-xl font-black text-white">
                  {item.value}
                </h3>
                <p className="mt-3 leading-7 text-slate-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#070b14] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Live City Inventory
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                Discover a City Block
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                Open a recorded block to review its exact property page. For a
                broader selection, use the Moon Atlas; for the fastest path, let
                Quick Pick assign an available City Block.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/moon-map"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-black uppercase tracking-wide transition hover:border-yellow-400 hover:text-yellow-300"
              >
                Browse Exact Locations
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
              >
                Use Quick Pick
              </Link>
            </div>
          </div>

          {featuredProperties.length > 0 ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {featuredProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/explore/${property.id}`}
                  className="group rounded-3xl border border-white/10 bg-black/35 p-6 transition hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-yellow-400/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="break-all text-lg font-black text-yellow-300">
                      {property.id}
                    </p>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider ${statusClass(property.status)}`}
                    >
                      {property.status}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                    {property.type}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{property.size}</p>
                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                    <p className="text-2xl font-black">
                      ${property.price.toFixed(2)}
                    </p>
                    <span className="text-sm font-black text-yellow-400 transition group-hover:text-yellow-300">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.06] p-8 sm:p-10">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                City Inventory Opening Soon
              </p>
              <h3 className="mt-4 text-3xl font-black uppercase">
                Choose through the Atlas or Quick Pick
              </h3>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
                No individual City Block records are currently displayed for
                {` ${city.name}`}. The live Atlas and secure Quick Pick flow can
                still guide customers to available city-category inventory.
              </p>
            </div>
          )}

          {cityProperties.length > featuredProperties.length && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Showing {featuredProperties.length} of {cityProperties.length} recorded City Blocks.
              Open the Moon Atlas to continue exploring this city&apos;s inventory.
            </p>
          )}
        </div>
      </section>

      {stateAttractions.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              State Landmarks
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              Explore Near {city.name}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              These LunaSphere landmarks provide geographic and historical
              context for properties throughout {city.state.name} State.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {stateAttractions.slice(0, 3).map((attraction) => (
              <Link
                key={attraction.id}
                href={`/attractions/${attraction.id}`}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-yellow-400/50"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                </div>
                <div className="p-7">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
                    {attraction.type}
                  </p>
                  <h3 className="mt-3 text-2xl font-black">
                    {attraction.name}
                  </h3>
                  <p className="mt-4 leading-7 text-slate-400">
                    {attraction.description}
                  </p>
                  <p className="mt-5 font-black text-yellow-400">Explore landmark →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-white/10 bg-white/[0.025] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Continue Exploring
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                More of {city.state.name}
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                Visit the state&apos;s other cities, discover named towns, or return
                to the full state profile for landmarks and rural territory.
              </p>
              <Link
                href={`/states/${encodeURIComponent(city.state.name)}`}
                className="mt-8 inline-flex rounded-xl border border-yellow-400/50 px-6 py-3 text-sm font-black uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
              >
                View {city.state.name} State
              </Link>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                  Sister Cities
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {siblingCities.map((sibling) => (
                    <Link
                      key={sibling.name}
                      href={getLunarCityHref(city.state.name, sibling.name)}
                      className="rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-cyan-300/50"
                    >
                      <h3 className="text-xl font-black">{sibling.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                        {sibling.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                  Towns to Discover
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {featuredTowns.map((town) => (
                    <Link
                      key={town.name}
                      href={getLunarTownHref(city.state.name, town.name)}
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-black transition hover:border-yellow-400/50 hover:text-yellow-300"
                    >
                      {town.name} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="overflow-hidden rounded-[2.5rem] border border-yellow-400/25 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_36%),linear-gradient(135deg,rgba(8,15,30,0.98),rgba(2,4,10,0.98))] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-4xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Make {city.name} Part of Your Story
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-6xl">
                Choose an exact block—or let Quick Pick find one
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Explore the LunaSphere Atlas for a specific location, or use the
                faster secure assignment flow for an available City Block. Every
                purchase is sold as a novelty gift and entertainment product.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/moon-map"
                className="rounded-xl bg-yellow-400 px-7 py-4 text-center text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
              >
                Choose on the Atlas
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/25 px-7 py-4 text-center text-sm font-black uppercase tracking-wide transition hover:border-cyan-300 hover:text-cyan-200"
              >
                Use Quick Pick
              </Link>
              <Link
                href="/hoa"
                className="rounded-xl border border-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-wide text-slate-300 transition hover:border-white/30 hover:text-white"
              >
                Explore HOA Benefits
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
