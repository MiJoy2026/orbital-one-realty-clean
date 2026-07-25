import Image from "next/image";
import Link from "next/link";

import {
  getLunarTownByName,
  getLunarTownMatches,
  getPropertiesByTown,
} from "@/lib/atlas-service";
import { getLunarAttractionsByState } from "@/lib/lunar-attractions";
import {
  getLunarCityHref,
  getLunarTownHref,
} from "@/lib/lunar-location-links";
import { lunarStateDetails } from "@/lib/lunar-state-details";

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

export default async function TownDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ townName: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const { townName } = await params;
  const { state: requestedState } = await searchParams;

  const decodedTownName = decodeURIComponent(townName);
  const decodedStateName = requestedState
    ? decodeURIComponent(requestedState)
    : undefined;

  const matches = getLunarTownMatches(decodedTownName);

  if (!decodedStateName && matches.length > 1) {
    return (
      <main className="min-h-screen bg-[#030604] px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.25rem] border border-amber-200/15 bg-white/[0.04] shadow-2xl shadow-black/50">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_42%)] p-8 sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">
              LunaSphere Location Check
            </p>

            <h1 className="mt-5 text-4xl font-black uppercase leading-none sm:text-6xl">
              Choose the Correct {decodedTownName}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
              More than one lunar state contains a town with this name. Select
              the correct state to open that town and its state-scoped Town
              Block inventory.
            </p>
          </div>

          <div className="grid gap-4 p-8 sm:grid-cols-2 sm:p-12">
            {matches.map((match) => (
              <Link
                key={`${match.state.name}-${match.name}`}
                href={getLunarTownHref(match.state.name, match.name)}
                className="group rounded-3xl border border-white/10 bg-black/30 p-6 transition hover:-translate-y-1 hover:border-amber-300/60 hover:bg-amber-300/[0.06]"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                  {match.state.name} State
                </p>

                <h2 className="mt-3 text-3xl font-black">{match.name}</h2>

                <p className="mt-4 leading-7 text-slate-400">
                  {match.description}
                </p>

                <p className="mt-6 font-black text-amber-300 transition group-hover:text-yellow-200">
                  Enter this town →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const town = await getLunarTownByName(
    decodedTownName,
    decodedStateName
  );

  if (!town) {
    return (
      <main className="min-h-screen bg-[#030604] px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">
            LunaSphere Atlas
          </p>

          <h1 className="mt-5 text-5xl font-black uppercase sm:text-6xl">
            Town Not Found
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            This town-and-state combination is not part of the active Orbital
            One lunar directory.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/states"
              className="rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
            >
              Browse Lunar States
            </Link>

            <Link
              href="/moon-map"
              className="rounded-xl border border-white/20 px-7 py-4 text-sm font-black uppercase tracking-wide transition hover:border-amber-300 hover:text-amber-200"
            >
              Open Moon Atlas
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const stateDetail = lunarStateDetails[town.state.name];

  if (!stateDetail) {
    return (
      <main className="min-h-screen bg-[#030604] px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
          <h1 className="text-5xl font-black uppercase">
            Town Data Unavailable
          </h1>

          <Link
            href="/states"
            className="mt-8 inline-block text-yellow-400"
          >
            Browse Lunar States
          </Link>
        </div>
      </main>
    );
  }

  const [townProperties, stateAttractions] = await Promise.all([
    getPropertiesByTown(town.name, town.state.name),
    Promise.resolve(getLunarAttractionsByState(town.state.name)),
  ]);

  const available = townProperties.filter(
    (property) => property.status === "Available"
  );

  const reserved = townProperties.filter(
    (property) => property.status === "Reserved"
  );

  const sold = townProperties.filter(
    (property) => property.status === "Sold"
  );

  const orderedProperties = [...townProperties].sort((first, second) => {
    const statusDifference =
      (statusOrder[first.status] ?? 9) -
      (statusOrder[second.status] ?? 9);

    return statusDifference || first.id.localeCompare(second.id);
  });

  const featuredProperties = orderedProperties.slice(0, 8);

  const townIndex =
    stateDetail.towns.findIndex(
      (candidate) =>
        candidate.name.toLowerCase() === town.name.toLowerCase()
    ) + 1;

  const nearbyCities = stateDetail.cities.slice(0, 3);

  const sisterTowns = [...stateDetail.towns]
    .filter(
      (candidate) =>
        candidate.name.toLowerCase() !== town.name.toLowerCase()
    )
    .sort(
      (first, second) =>
        Number(Boolean(second.featured)) -
        Number(Boolean(first.featured))
    )
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#030604] text-white">
      <section className="relative isolate min-h-[690px] overflow-hidden border-b border-amber-200/15">
        <Image
          src="/lunascape/virtual-scenes/town-community.jpg"
          alt={`Warm lunar hometown community representing ${town.name}, ${town.state.name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(250,204,21,0.13),transparent_31%),radial-gradient(circle_at_84%_72%,rgba(74,222,128,0.08),transparent_24%),linear-gradient(90deg,rgba(3,6,4,0.99)_0%,rgba(3,6,4,0.93)_46%,rgba(3,6,4,0.36)_78%,rgba(3,6,4,0.86)_100%)]" />

        <div className="relative mx-auto flex min-h-[690px] max-w-7xl items-center px-6 py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              <Link
                href="/explore"
                className="transition hover:text-yellow-400"
              >
                Explore
              </Link>

              <span>•</span>

              <Link
                href="/states"
                className="transition hover:text-yellow-400"
              >
                Lunar States
              </Link>

              <span>•</span>

              <Link
                href={`/states/${encodeURIComponent(town.state.name)}`}
                className="transition hover:text-yellow-400"
              >
                {town.state.name}
              </Link>

              <span>•</span>

              <span className="text-amber-200">{town.name}</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <p className="text-sm font-black uppercase tracking-[0.42em] text-amber-300">
                Orbital One Lunar Town
              </p>

              {town.featured && (
                <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-200">
                  Featured Hometown
                </span>
              )}
            </div>

            <h1 className="mt-5 text-6xl font-black uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
              {town.name}
            </h1>

            <p className="mt-5 text-xl font-black text-yellow-300 sm:text-3xl">
              Town {String(Math.max(townIndex, 1)).padStart(2, "0")} of{" "}
              {town.state.name} · {stateDetail.nickname}
            </p>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
              {town.description}
            </p>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              A smaller lunar community where neighborhood identity, quiet
              terrain, and hometown character come first.
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
                className="rounded-xl border border-amber-200/40 bg-amber-300/10 px-7 py-4 text-sm font-black uppercase tracking-wide text-amber-100 backdrop-blur transition hover:border-amber-200 hover:bg-amber-300/20"
              >
                Quick Pick a Town Block
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          {[
            [townProperties.length.toLocaleString(), "Town Blocks Recorded"],
            [available.length.toLocaleString(), "Available Now"],
            [reserved.length.toLocaleString(), "Reserved"],
            [sold.length.toLocaleString(), "Sold"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="bg-[#060a07] px-5 py-8 text-center"
            >
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
            <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">
              Town Identity
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              A Lunar Hometown Inside {town.state.name}
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Town Blocks offer a more intimate LunaSphere experience than the
              larger City destinations. Each block belongs to a named town, a
              specific lunar state, and a fixed Grid V2 location.
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
                label: "Community Character",
                value: "Lunar Hometown",
                text: "A smaller settlement identity with a welcoming neighborhood feel.",
              },
              {
                label: "Property Type",
                value: "Town Block",
                text: "A named community address with a fixed Atlas location.",
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
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-200/[0.08] to-transparent p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                  {item.label}
                </p>

                <h3 className="mt-3 text-xl font-black text-white">
                  {item.value}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#070b08] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Live Town Inventory
              </p>

              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                Discover a Town Block
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-400">
                Open a recorded block to review its exact property page. Use
                the Moon Atlas to choose a specific location or Quick Pick for
                the fastest secure assignment.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/moon-map"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-black uppercase tracking-wide transition hover:border-amber-300 hover:text-amber-200"
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
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-black/35 transition hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-yellow-400/[0.05]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src="/property-images/town-block.jpg"
                      alt={`${property.id} Town Block`}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <p className="break-all text-lg font-black text-yellow-300">
                        {property.id}
                      </p>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider ${statusClass(
                          property.status
                        )}`}
                      >
                        {property.status}
                      </span>
                    </div>

                    <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                      {property.type}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      {property.size}
                    </p>

                    <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                      <p className="text-2xl font-black">
                        ${property.price.toFixed(2)}
                      </p>

                      <span className="text-sm font-black text-yellow-400 transition group-hover:text-yellow-300">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[2rem] border border-amber-300/20 bg-amber-300/[0.06] p-8 sm:p-10">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">
                Town Inventory Opening Soon
              </p>

              <h3 className="mt-4 text-3xl font-black uppercase">
                Choose through the Atlas or Quick Pick
              </h3>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
                No individual Town Block records are currently displayed for{" "}
                {town.name}. The live Atlas and secure Quick Pick flow can
                still guide customers to available town-category inventory.
              </p>
            </div>
          )}

          {townProperties.length > featuredProperties.length && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Showing {featuredProperties.length} of {townProperties.length}{" "}
              recorded Town Blocks. Open the Moon Atlas to continue exploring
              this town&apos;s inventory.
            </p>
          )}
        </div>
      </section>

      {stateAttractions.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-300">
              State Landmarks
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              Explore Near {town.name}
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              These LunaSphere landmarks provide geographic and historical
              context for properties throughout {town.state.name} State.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {stateAttractions.slice(0, 3).map((attraction) => (
              <Link
                key={attraction.id}
                href={`/attractions/${attraction.id}`}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/50"
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

                  <p className="mt-5 font-black text-yellow-400">
                    Explore landmark →
                  </p>
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
                More of {town.state.name}
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-400">
                Visit the state&apos;s cities, discover neighboring towns, or
                return to the full state profile for landmarks and rural
                territory.
              </p>

              <Link
                href={`/states/${encodeURIComponent(town.state.name)}`}
                className="mt-8 inline-flex rounded-xl border border-yellow-400/50 px-6 py-3 text-sm font-black uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
              >
                View {town.state.name} State
              </Link>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
                  Nearby Cities
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {nearbyCities.map((city) => (
                    <Link
                      key={city.name}
                      href={getLunarCityHref(
                        town.state.name,
                        city.name
                      )}
                      className="rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-amber-300/50"
                    >
                      <h3 className="text-xl font-black">{city.name}</h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                        {city.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
                  Neighboring Towns
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {sisterTowns.map((sisterTown) => (
                    <Link
                      key={sisterTown.name}
                      href={getLunarTownHref(
                        town.state.name,
                        sisterTown.name
                      )}
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-black transition hover:border-emerald-300/50 hover:text-emerald-200"
                    >
                      {sisterTown.name} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="overflow-hidden rounded-[2.5rem] border border-yellow-400/25 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.17),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.08),transparent_30%),linear-gradient(135deg,rgba(8,15,10,0.98),rgba(3,6,4,0.98))] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-4xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Make {town.name} Your Lunar Hometown
              </p>

              <h2 className="mt-4 text-4xl font-black uppercase sm:text-6xl">
                Choose an exact block—or let Quick Pick find one
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Explore the LunaSphere Atlas for a specific Town Block, or use
                the faster secure assignment flow. Every purchase is sold as a
                novelty gift and entertainment product.
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
                className="rounded-xl border border-white/25 px-7 py-4 text-center text-sm font-black uppercase tracking-wide transition hover:border-amber-300 hover:text-amber-200"
              >
                Use Quick Pick
              </Link>

              <Link
                href="/hoa"
                className="rounded-xl border border-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-wide text-slate-300 transition hover:border-emerald-300/50 hover:text-emerald-200"
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