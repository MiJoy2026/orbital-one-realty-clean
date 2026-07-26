import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/components/JsonLd";

import { getLunarAttractionsByState } from "@/lib/lunar-attractions";
import {
  getLunarCityHref,
  getLunarTownHref,
} from "@/lib/lunar-location-links";
import { lunarStateDetails } from "@/lib/lunar-state-details";
import { prisma } from "@/lib/prisma";
import { SITE_URL, createPageMetadata, truncateDescription } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stateName: string }>;
}): Promise<Metadata> {
  const { stateName } = await params;
  const decodedName = decodeURIComponent(stateName);
  const officialStateName = Object.keys(lunarStateDetails).find(
    (name) => name.toLowerCase() === decodedName.toLowerCase()
  );

  if (!officialStateName) {
    return createPageMetadata({
      title: "Lunar State Not Found | Orbital One Realty",
      description: "The requested LunaSphere lunar state could not be found.",
      path: `/states/${encodeURIComponent(decodedName)}`,
      noIndex: true,
      follow: false,
    });
  }

  const state = lunarStateDetails[officialStateName];
  const heroAttraction = getLunarAttractionsByState(officialStateName)[0];

  return createPageMetadata({
    title: `${officialStateName} Lunar State: Cities, Towns & Moon Property | Orbital One Realty`,
    description: truncateDescription(
      `${state.description} Explore its three cities, twenty towns, landmarks, and novelty lunar property options.`
    ),
    path: `/states/${encodeURIComponent(officialStateName)}`,
    image: heroAttraction?.image ?? "/atlas/moon-atlas-v2.jpg",
    imageAlt: `${officialStateName} lunar state in the LunaSphere Moon atlas`,
  });
}

const propertyPaths = [
  {
    title: "Rural Lunar Acre",
    price: "$24.95",
    image: "/property-images/rural-acre.jpg",
    description:
      "A one-acre novelty property within the state’s open lunar territory, paired with a personalized deed and LunaScape imagery.",
    detail: "Best for open-space explorers",
  },
  {
    title: "Lunar Town Block",
    price: "$39.95",
    image: "/property-images/town-block.jpg",
    description:
      "A named community location with a neighborhood-style identity and room for future virtual town experiences.",
    detail: "Best for community-minded owners",
  },
  {
    title: "Lunar City Block",
    price: "$54.95",
    image: "/property-images/city-block.jpg",
    description:
      "A premium address inside one of the state’s three major city regions, designed for a more urban LunaSphere experience.",
    detail: "Best for premium lunar addresses",
  },
];

export default async function StateDetailPage({
  params,
}: {
  params: Promise<{ stateName: string }>;
}) {
  const { stateName } = await params;
  const decodedName = decodeURIComponent(stateName);
  const officialStateName = Object.keys(lunarStateDetails).find(
    (name) => name.toLowerCase() === decodedName.toLowerCase()
  );

  if (!officialStateName) {
    notFound();
  }

  const state = lunarStateDetails[officialStateName];
  const stateProperties = await prisma.property.findMany({
    where: { state: officialStateName },
    orderBy: { updatedAt: "desc" },
  });
  const stateAttractions = getLunarAttractionsByState(officialStateName);
  const preferredAttractionIds = new Set(state.featuredAttractionIds ?? []);
  const orderedAttractions = [...stateAttractions].sort((a, b) => {
    const aPreferred = preferredAttractionIds.has(a.id) ? 1 : 0;
    const bPreferred = preferredAttractionIds.has(b.id) ? 1 : 0;
    return bPreferred - aPreferred;
  });
  const heroAttraction = orderedAttractions[0] ?? null;
  const heroImage = heroAttraction?.image ?? "/atlas/moon-atlas-v2.jpg";

  const availableRecords = stateProperties.filter(
    (property) => property.status === "Available"
  ).length;
  const reservedRecords = stateProperties.filter(
    (property) => property.status === "Reserved"
  ).length;
  const soldRecords = stateProperties.filter(
    (property) => property.status === "Sold"
  ).length;

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Lunar States",
        item: `${SITE_URL}/states`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: officialStateName,
        item: `${SITE_URL}/states/${encodeURIComponent(officialStateName)}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-white">
      <JsonLd data={breadcrumbStructuredData} />
      <section className="relative isolate min-h-[680px] overflow-hidden border-b border-yellow-400/20">
        <Image
          src={heroImage}
          alt={
            heroAttraction
              ? `${heroAttraction.name} in ${officialStateName} State`
              : `${officialStateName} lunar state in the LunaSphere Atlas`
          }
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(250,204,21,0.12),transparent_30%),linear-gradient(90deg,rgba(2,4,10,0.98)_0%,rgba(2,4,10,0.9)_45%,rgba(2,4,10,0.35)_78%,rgba(2,4,10,0.82)_100%)]" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-6 py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
              <Link href="/explore" className="transition hover:text-yellow-400">
                Explore
              </Link>
              <span>•</span>
              <Link href="/states" className="transition hover:text-yellow-400">
                Lunar States
              </Link>
              <span>•</span>
              <span className="text-yellow-400">{officialStateName}</span>
            </div>

            <p className="mt-8 text-sm font-black uppercase tracking-[0.42em] text-yellow-400">
              Orbital One Lunar State
            </p>
            <h1 className="mt-5 text-6xl font-black uppercase leading-[0.92] sm:text-7xl lg:text-8xl">
              {officialStateName}
            </h1>
            <p className="mt-5 text-2xl font-black text-cyan-200 sm:text-3xl">
              {state.nickname || "LunaSphere Atlas Region"}
            </p>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
              {state.description}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/moon-map"
                className="rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
              >
                Open the Moon Atlas
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/30 bg-black/45 px-7 py-4 text-sm font-black uppercase tracking-wide text-white backdrop-blur transition hover:border-yellow-400 hover:text-yellow-300"
              >
                Quick Pick a Property
              </Link>
            </div>

            {heroAttraction && (
              <Link
                href={`/attractions/${heroAttraction.id}`}
                className="mt-6 inline-flex text-sm font-bold text-slate-300 transition hover:text-yellow-400"
              >
                Hero destination: {heroAttraction.name} →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          {[
            [state.cities.length, "Named Cities"],
            [state.towns.length, "Named Towns"],
            ["50,000", "Rural Acres"],
            [orderedAttractions.length, "Atlas Landmarks"],
          ].map(([value, label]) => (
            <div key={label} className="bg-[#050812] px-5 py-8 text-center">
              <p className="text-4xl font-black text-yellow-400 sm:text-5xl">
                {value}
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              State Identity
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              What Makes {officialStateName} Distinct
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Every Orbital One state has its own name, story, communities, and
              sense of place. These details make a property feel connected to a
              larger lunar world rather than just a coordinate on a map.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {state.highlights.map((highlight, index) => (
              <article
                key={highlight}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.26em] text-yellow-400/70">
                  Highlight {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 text-lg font-bold leading-7 text-slate-100">
                  {highlight}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#070b14] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
              Three Major Destinations
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              Cities of {officialStateName}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Each state contains three city regions. City Blocks represent the
              premium urban-style addresses in the LunaSphere experience.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {state.cities.map((city, index) => (
              <Link
                key={city.name}
                href={getLunarCityHref(officialStateName, city.name)}
                className="group rounded-[2rem] border border-white/10 bg-black/35 p-7 transition hover:-translate-y-1 hover:border-yellow-400/60"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="text-5xl font-black text-yellow-400/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {city.featured && (
                    <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-300">
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="mt-7 text-3xl font-black">{city.name}</h3>
                <p className="mt-4 leading-7 text-slate-400">
                  {city.description}
                </p>
                <p className="mt-7 font-black text-yellow-400 transition group-hover:text-yellow-300">
                  Explore City →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Twenty Named Communities
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              Towns of {officialStateName}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Towns provide a smaller-community identity for owners who prefer a
              named neighborhood-style destination instead of a major city or an
              open rural parcel.
            </p>
          </div>
          <Link
            href="/moon-map"
            className="rounded-xl border border-yellow-400/50 px-5 py-3 text-sm font-black uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
          >
            Locate Towns on the Atlas
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {state.towns.map((town, index) => (
            <Link
              key={`${officialStateName}-${town.name}`}
              href={getLunarTownHref(officialStateName, town.name)}
              className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-yellow-400/55 hover:bg-yellow-400/[0.06]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400/70">
                  Town {String(index + 1).padStart(2, "0")}
                </p>
                {town.featured && (
                  <span className="text-xs font-black uppercase text-cyan-300">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-xl font-black">{town.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {town.description}
              </p>
              <p className="mt-5 text-sm font-black text-yellow-400">
                Visit Town →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {orderedAttractions.length > 0 && (
        <section className="border-y border-white/10 bg-[#070b14] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Atlas Destinations
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                Landmarks in {officialStateName}
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                Explore the historic sites, craters, lunar seas, and natural
                formations associated with this state in the Orbital One Atlas.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {orderedAttractions.map((attraction) => (
                <Link
                  key={attraction.id}
                  href={`/attractions/${attraction.id}`}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-black/35 transition hover:-translate-y-1 hover:border-yellow-400/60"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={attraction.image}
                      alt={attraction.name}
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/65 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur">
                      {attraction.type}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-black">{attraction.name}</h3>
                    <p className="mt-3 leading-7 text-slate-400">
                      {attraction.tagline || attraction.description}
                    </p>
                    <p className="mt-5 font-black text-yellow-400">
                      Explore Destination →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
            Property Paths
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
            Choose How You Belong in {officialStateName}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            Select an exact location through the Atlas or use Quick Pick for a
            faster assignment from available LunaSphere inventory.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {propertyPaths.map((path) => (
            <article
              key={path.title}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={path.image}
                  alt={path.title}
                  fill
                  sizes="(min-width: 1024px) 31vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
              </div>
              <div className="p-7">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  {path.detail}
                </p>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-black">{path.title}</h3>
                  <p className="text-2xl font-black text-yellow-400">
                    {path.price}
                  </p>
                </div>
                <p className="mt-4 leading-7 text-slate-400">
                  {path.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/pricing"
            className="rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
          >
            Quick Pick & Personalize
          </Link>
          <Link
            href="/moon-map"
            className="rounded-xl border border-white/25 px-7 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-yellow-400 hover:text-yellow-300"
          >
            Choose an Exact Location
          </Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-[#050812] p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Live State Activity
              </p>
              <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">
                Property Records Already Created in {officialStateName}
              </h2>
              <p className="mt-4 max-w-3xl leading-7 text-slate-400">
                These figures reflect properties already selected, reserved, or
                sold through Orbital One. They are not the state’s full inventory
                capacity; the Atlas and Quick Pick systems create valid property
                records as customers choose locations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                [availableRecords, "Available"],
                [reservedRecords, "Reserved"],
                [soldRecords, "Sold"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="min-w-24 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5"
                >
                  <p className="text-3xl font-black text-yellow-400">{value}</p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-yellow-400/25 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-9 text-center sm:p-14">
          <p className="text-sm font-black uppercase tracking-[0.38em] text-yellow-400">
            Your Place in the LunaSphere
          </p>
          <h2 className="mt-5 text-4xl font-black uppercase sm:text-6xl">
            Begin Your {officialStateName} Mission
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Explore every city and town, visit nearby landmarks, or let Orbital
            One assign an available property and reserve it while you complete
            your personalization.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/moon-map"
              className="rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
            >
              Explore the Atlas
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-white/25 px-7 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-yellow-400 hover:text-yellow-300"
            >
              Start Quick Pick
            </Link>
          </div>
          <p className="mt-7 text-xs leading-6 text-slate-500">
            Orbital One properties are novelty and entertainment products and do
            not convey legal ownership recognized by any government or space agency.
          </p>
        </div>
      </section>
    </main>
  );
}
