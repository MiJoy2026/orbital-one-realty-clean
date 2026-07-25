import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getLunarCityHref,
  getLunarTownHref,
} from "@/lib/lunar-location-links";
import { prisma } from "@/lib/prisma";

function SearchChoicePage({
  query,
  type,
  choices,
}: {
  query: string;
  type: "City" | "Town";
  choices: { name: string; stateName: string; href: string }[];
}) {
  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-9">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          LunaSphere Search
        </p>
        <h1 className="mt-5 text-4xl font-black uppercase sm:text-6xl">
          Choose the Correct {type}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-400">
          The name <span className="font-black text-white">{query}</span> is used
          in more than one lunar state. Select the state you intended.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {choices.map((choice) => (
            <Link
              key={`${choice.stateName}-${choice.name}`}
              href={choice.href}
              className="rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-yellow-400/60"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
                {choice.stateName} State
              </p>
              <h2 className="mt-2 text-2xl font-black">{choice.name}</h2>
              <p className="mt-4 font-black text-yellow-400">Open {type} →</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default async function AtlasSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || "").trim();

  if (!query) {
    redirect("/moon-map");
  }

  const property = await prisma.property.findFirst({
    where: {
      id: {
        equals: query,
        mode: "insensitive",
      },
    },
  });

  if (property) {
    redirect(`/explore/${property.id}`);
  }

  const state = await prisma.lunarState.findFirst({
    where: {
      name: {
        equals: query,
        mode: "insensitive",
      },
    },
  });

  if (state) {
    redirect(`/states/${encodeURIComponent(state.name)}`);
  }

  const cities = await prisma.lunarCity.findMany({
    where: {
      name: {
        equals: query,
        mode: "insensitive",
      },
    },
    orderBy: { stateName: "asc" },
  });

  if (cities.length === 1) {
    redirect(getLunarCityHref(cities[0].stateName, cities[0].name));
  }

  if (cities.length > 1) {
    return (
      <SearchChoicePage
        query={query}
        type="City"
        choices={cities.map((city) => ({
          name: city.name,
          stateName: city.stateName,
          href: getLunarCityHref(city.stateName, city.name),
        }))}
      />
    );
  }

  const towns = await prisma.lunarTown.findMany({
    where: {
      name: {
        equals: query,
        mode: "insensitive",
      },
    },
    orderBy: { stateName: "asc" },
  });

  if (towns.length === 1) {
    redirect(getLunarTownHref(towns[0].stateName, towns[0].name));
  }

  if (towns.length > 1) {
    return (
      <SearchChoicePage
        query={query}
        type="Town"
        choices={towns.map((town) => ({
          name: town.name,
          stateName: town.stateName,
          href: getLunarTownHref(town.stateName, town.name),
        }))}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-9 text-center">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-red-400">
          LunaSphere Search
        </p>
        <h1 className="mt-5 text-4xl font-black uppercase sm:text-6xl">
          No Atlas Match Found
        </h1>
        <p className="mt-6 text-slate-400">
          We could not find a state, city, town, or property matching:
        </p>
        <p className="mt-4 text-2xl font-black text-yellow-400">{query}</p>
        <Link
          href="/moon-map"
          className="mt-8 inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
        >
          Back to Lunar Atlas
        </Link>
      </div>
    </main>
  );
}
