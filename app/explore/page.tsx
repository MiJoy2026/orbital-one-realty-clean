import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { lunarAttractions } from "@/lib/lunar-attractions";
import { lunarStateDetails } from "@/lib/lunar-state-details";

export const metadata: Metadata = {
  title: "Explore the Moon | Orbital One Realty",
  description:
    "Explore the Orbital One LunaSphere: 57 lunar states, 171 cities, 1,140 towns, famous Moon attractions, rural parcels, and the future LunaScape experience.",
};

const ownershipPaths = [
  {
    eyebrow: "Open Lunar Territory",
    title: "Rural Lunar Acre",
    description:
      "Choose a memorable piece of open lunar terrain with room to imagine your future LunaScape property, commemorative retreat, or family Moon legacy.",
    price: "$24.95",
    image: "/property-images/rural-acre.jpg",
    href: "/pricing",
    secondaryHref: "/moon-map",
    secondaryLabel: "Choose on the Atlas",
  },
  {
    eyebrow: "Community Property",
    title: "Lunar Town Block",
    description:
      "Become part of one of 1,140 named lunar towns—smaller communities designed around discovery, belonging, local identity, and future virtual neighborhoods.",
    price: "$39.95",
    image: "/property-images/town-block.jpg",
    href: "/pricing",
    secondaryHref: "/states",
    secondaryLabel: "Browse Lunar States",
  },
  {
    eyebrow: "Premier Lunar Address",
    title: "Lunar City Block",
    description:
      "Claim a city-centered novelty property inside one of 171 lunar cities, positioned for future LunaScape districts, landmarks, gathering places, and member experiences.",
    price: "$54.95",
    image: "/property-images/city-block.jpg",
    href: "/pricing",
    secondaryHref: "/moon-map",
    secondaryLabel: "Find a City on the Map",
  },
];

const discoveryRoutes = [
  {
    number: "01",
    title: "Enter the LunaSphere",
    description:
      "Navigate the interactive Moon Atlas, search locations, reveal state boundaries, discover cities and towns, inspect protected historic areas, and select an exact available property.",
    href: "/moon-map",
    label: "Open the Moon Atlas",
  },
  {
    number: "02",
    title: "Explore 57 Lunar States",
    description:
      "Every Orbital One state has its own identity, landscape story, three named cities, twenty named towns, rural territory, and nearby lunar landmarks.",
    href: "/states",
    label: "Browse All States",
  },
  {
    number: "03",
    title: "Use Quick Pick",
    description:
      "Prefer the fastest route? Choose Rural, Town, or City property and let Orbital One securely assign an available Grid V2 property before checkout.",
    href: "/pricing",
    label: "Let Orbital One Choose",
  },
  {
    number: "04",
    title: "Imagine Your LunaScape",
    description:
      "Every current-grid purchase includes a factual parcel image and a premium virtual-property scene—an early foundation for future LunaScape homes, communities, and experiences.",
    href: "/hoa",
    label: "Discover Member Benefits",
  },
];

const moonUpdates = [
  {
    status: "Now Live",
    title: "Quick Pick Property Assignment",
    description:
      "Customers can now receive a genuine available Rural, Town, or City property without first navigating the full Atlas.",
  },
  {
    status: "Now Live",
    title: "Two-Image LunaScape Collection",
    description:
      "Current-grid owners receive an exact terrain-based property view plus a polished virtual LunaScape property scene.",
  },
  {
    status: "Now Live",
    title: "Grid V2 Inventory Protection",
    description:
      "Property selection, reservation, checkout, and fulfillment work together to help prevent duplicate sales.",
  },
  {
    status: "2026 Charter Program",
    title: "Founding HOA Membership",
    description:
      "Early property owners receive ongoing member recognition, updates, future-access opportunities, and priority consideration for new LunaScape features.",
  },
];

const plannedExperiences = [
  {
    title: "Founding Member Welcome Briefing",
    description:
      "A digital introduction to Orbital One ownership, the LunaSphere, HOA benefits, and the roadmap toward future virtual-property experiences.",
  },
  {
    title: "LunaScape Preview Showcase",
    description:
      "A future member presentation highlighting evolving virtual-property scenes, possible enhancements, communities, and interactive concepts.",
  },
  {
    title: "Moon Atlas Discovery Night",
    description:
      "A guided online exploration of famous lunar attractions, state stories, city and town locations, and newly released property regions.",
  },
];

export default function ExplorePage() {
  const stateNames = Object.keys(lunarStateDetails);
  const stateCount = stateNames.length;
  const cityCount = Object.values(lunarStateDetails).reduce(
    (total, state) => total + state.cities.length,
    0
  );
  const townCount = Object.values(lunarStateDetails).reduce(
    (total, state) => total + state.towns.length,
    0
  );
  const featuredAttractions = lunarAttractions
    .filter((attraction) => attraction.featured)
    .slice(0, 6);
  const featuredStateNames = [
    "Hammel",
    "Tycho",
    "Copernicus",
    "Tranquillitatis",
  ].filter((stateName) => lunarStateDetails[stateName]);

  return (
    <main className="min-h-screen bg-[#02040a] text-white">
      <section className="relative isolate min-h-[680px] overflow-hidden border-b border-yellow-400/20">
        <Image
          src="/atlas/moon-atlas-v2.jpg"
          alt="Orbital One LunaSphere Moon Atlas"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_42%,rgba(250,204,21,0.08),transparent_32%),linear-gradient(90deg,rgba(2,4,10,0.97)_0%,rgba(2,4,10,0.82)_42%,rgba(2,4,10,0.26)_75%,rgba(2,4,10,0.72)_100%)]" />
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.42em] text-yellow-400">
              Welcome to the Orbital One LunaSphere
            </p>
            <h1 className="mt-6 text-5xl font-black uppercase leading-[0.94] sm:text-6xl lg:text-8xl">
              A Moon Built
              <span className="block text-yellow-400">to Explore</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Travel through named lunar states, cities, towns, famous landmarks,
              protected historic regions, and purchasable novelty property—all
              connected through one growing lunar world.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/moon-map"
                className="rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
              >
                Enter the Moon Atlas
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/30 bg-black/45 px-7 py-4 text-sm font-black uppercase tracking-wide text-white backdrop-blur transition hover:border-yellow-400 hover:text-yellow-300"
              >
                Quick Pick a Property
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Explore for fun, choose an exact location, or let Orbital One assign
              an available property for you.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          {[
            [stateCount, "Lunar States"],
            [cityCount, "Named Cities"],
            [townCount, "Named Towns"],
            [lunarAttractions.length, "Featured Landmarks"],
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
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
            Choose Your Route
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
            There Is More Than One Way to Discover the Moon
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            Take the scenic route through the full LunaSphere, browse by state,
            let Quick Pick assign an available location, or learn how today&apos;s
            property images connect to tomorrow&apos;s LunaScape experience.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {discoveryRoutes.map((route) => (
            <article
              key={route.number}
              className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-7 transition hover:-translate-y-1 hover:border-yellow-400/60"
            >
              <div className="flex items-start gap-5">
                <span className="text-4xl font-black text-yellow-400/35">
                  {route.number}
                </span>
                <div>
                  <h3 className="text-2xl font-black">{route.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">
                    {route.description}
                  </p>
                  <Link
                    href={route.href}
                    className="mt-6 inline-flex font-black text-yellow-400 transition group-hover:text-yellow-300"
                  >
                    {route.label} →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#070b14] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Famous Lunar Destinations
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                Explore the Landmarks That Made Moon History
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                Visit iconic landing sites, impact craters, lunar seas, and mountain
                ranges—then discover the Orbital One states and property regions around them.
              </p>
            </div>
            <Link
              href="/moon-map"
              className="rounded-xl border border-yellow-400/50 px-5 py-3 text-sm font-black uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
            >
              Find Them on the Atlas
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredAttractions.map((attraction) => (
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
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/65 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur">
                    {attraction.type}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                    {attraction.state} State
                  </p>
                  <h3 className="mt-2 text-2xl font-black">{attraction.name}</h3>
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

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Explore at Every Scale
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              From Entire States to One Personal Place
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              The LunaSphere is designed like a world: broad states organize the
              Moon, cities create major destinations, towns create smaller communities,
              and rural parcels preserve the feeling of open lunar territory.
            </p>

            <div className="mt-8 space-y-4">
              {[
                ["States", "57 distinct regions with stories, identities, cities, towns, attractions, and rural territory."],
                ["Cities", "171 major lunar addresses envisioned as future hubs for commerce, landmarks, and virtual experiences."],
                ["Towns", "1,140 smaller named communities offering local identity and a more personal neighborhood feeling."],
                ["Rural Parcels", "Open lunar property for customers who value scenery, space, simplicity, and imagination."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <h3 className="font-black text-yellow-400">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {featuredStateNames.map((stateName) => {
              const state = lunarStateDetails[stateName];
              return (
                <Link
                  key={stateName}
                  href={`/states/${encodeURIComponent(stateName)}`}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-400/[0.10] via-white/[0.04] to-transparent p-6 transition hover:-translate-y-1 hover:border-yellow-400/70"
                >
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-400">
                    Featured Lunar State
                  </p>
                  <h3 className="mt-3 text-2xl font-black">{stateName}</h3>
                  <p className="mt-1 text-sm font-bold text-cyan-200">
                    {state.nickname}
                  </p>
                  <p className="mt-4 line-clamp-4 leading-7 text-slate-400">
                    {state.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      {state.cities.length} Cities
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      {state.towns.length} Towns
                    </span>
                  </div>
                  <p className="mt-6 font-black text-yellow-400">Enter State →</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
              Choose Your Place
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              Three Ways to Own a Piece of the Experience
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Every purchase is novelty and commemorative, but every property can
              still feel personal through its location, documents, exact parcel view,
              LunaScape scene, and ongoing HOA connection.
            </p>
          </div>

          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {ownershipPaths.map((product) => (
              <article
                key={product.title}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#070b14]"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent" />
                </div>
                <div className="p-7">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                    {product.eyebrow}
                  </p>
                  <div className="mt-3 flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-black">{product.title}</h3>
                    <p className="text-2xl font-black text-yellow-400">
                      {product.price}
                    </p>
                  </div>
                  <p className="mt-4 leading-7 text-slate-400">
                    {product.description}
                  </p>
                  <div className="mt-7 space-y-3">
                    <Link
                      href={product.href}
                      className="block rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black transition hover:bg-yellow-300"
                    >
                      Quick Pick & Personalize
                    </Link>
                    <Link
                      href={product.secondaryHref}
                      className="block rounded-xl border border-white/20 px-5 py-3 text-center font-black text-white transition hover:border-yellow-400 hover:text-yellow-300"
                    >
                      {product.secondaryLabel}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 xl:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              What&apos;s New on the Moon
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase">
              The LunaSphere Is Growing
            </h2>
            <div className="mt-8 space-y-4">
              {moonUpdates.map((update) => (
                <article
                  key={update.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
                >
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-200">
                    {update.status}
                  </span>
                  <h3 className="mt-4 text-xl font-black">{update.title}</h3>
                  <p className="mt-2 leading-7 text-slate-400">
                    {update.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
              Planned Member Experiences
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase">
              Events Beyond the Purchase
            </h2>
            <p className="mt-5 leading-7 text-slate-400">
              These experiences are part of the future member roadmap. Dates and
              participation details will be announced through Orbital One HOA communications.
            </p>
            <div className="mt-8 space-y-4">
              {plannedExperiences.map((experience, index) => (
                <article
                  key={experience.title}
                  className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.055] p-6"
                >
                  <div className="flex gap-5">
                    <span className="text-3xl font-black text-yellow-400/45">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-xl font-black">{experience.title}</h3>
                      <p className="mt-2 leading-7 text-slate-400">
                        {experience.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-yellow-400/20 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.10),transparent_48%),#050812] px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.4em] text-yellow-400">
            Your Moon Journey Starts Here
          </p>
          <h2 className="mt-5 text-4xl font-black uppercase sm:text-6xl">
            Explore It. Choose It. Make It Yours.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Navigate the full LunaSphere for the exact experience, or use Quick
            Pick when you want Orbital One to securely assign a great available property.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/moon-map"
              className="rounded-xl bg-yellow-400 px-7 py-4 font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
            >
              Explore the Atlas
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-white/30 px-7 py-4 font-black uppercase tracking-wide text-white transition hover:border-cyan-300 hover:text-cyan-200"
            >
              Quick Pick a Property
            </Link>
          </div>
          <p className="mt-7 text-xs leading-6 text-slate-500">
            Orbital One Realty properties are novelty and commemorative products
            for entertainment and gifting. Purchases do not convey legal ownership
            of real estate on the Moon.
          </p>
        </div>
      </section>
    </main>
  );
}
