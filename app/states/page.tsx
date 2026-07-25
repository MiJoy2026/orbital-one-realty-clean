import Image from "next/image";
import Link from "next/link";

import { lunarStateDetails } from "@/lib/lunar-state-details";
import { prisma } from "@/lib/prisma";

const featuredStateNames = [
  "Hammel",
  "Tycho",
  "Copernicus",
  "Tranquillitatis",
];

export default async function StatesPage() {
  const stateNames = Object.keys(lunarStateDetails).sort((a, b) =>
    a.localeCompare(b)
  );
  const properties = await prisma.property.findMany({
    select: {
      state: true,
      status: true,
    },
  });
  const cityCount = Object.values(lunarStateDetails).reduce(
    (total, state) => total + state.cities.length,
    0
  );
  const townCount = Object.values(lunarStateDetails).reduce(
    (total, state) => total + state.towns.length,
    0
  );
  const featuredStates = featuredStateNames.filter(
    (stateName) => lunarStateDetails[stateName]
  );

  return (
    <main className="min-h-screen bg-[#02040a] text-white">
      <section className="relative isolate min-h-[620px] overflow-hidden border-b border-yellow-400/20">
        <Image
          src="/atlas/moon-atlas-v2.jpg"
          alt="Orbital One LunaSphere lunar states"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(34,211,238,0.10),transparent_28%),linear-gradient(90deg,rgba(2,4,10,0.98)_0%,rgba(2,4,10,0.88)_46%,rgba(2,4,10,0.28)_78%,rgba(2,4,10,0.78)_100%)]" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-6 py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.42em] text-yellow-400">
              LunaSphere State Directory
            </p>
            <h1 className="mt-6 text-6xl font-black uppercase leading-[0.92] sm:text-7xl lg:text-8xl">
              57 Worlds
              <span className="block text-yellow-400">Within One Moon</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
              Every Orbital One lunar state has its own identity, three named
              cities, twenty towns, open rural territory, and connections to the
              larger LunaSphere experience.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/moon-map"
                className="rounded-xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
              >
                View States on the Atlas
              </Link>
              <Link
                href="/explore"
                className="rounded-xl border border-white/30 bg-black/45 px-7 py-4 text-sm font-black uppercase tracking-wide text-white backdrop-blur transition hover:border-yellow-400 hover:text-yellow-300"
              >
                Return to Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          {[
            [stateNames.length, "Lunar States"],
            [cityCount, "Named Cities"],
            [townCount, "Named Towns"],
            ["50,000", "Rural Acres per State"],
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
            Featured Starting Points
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
            Begin with a Signature State
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            These destinations offer recognizable lunar stories, distinctive
            identities, and strong connections to featured Atlas landmarks.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredStates.map((stateName, index) => {
            const details = lunarStateDetails[stateName];

            return (
              <Link
                key={stateName}
                href={`/states/${encodeURIComponent(stateName)}`}
                className="group rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-7 transition hover:-translate-y-1 hover:border-yellow-400/60"
              >
                <p className="text-5xl font-black text-yellow-400/25">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
                  {details.nickname}
                </p>
                <h3 className="mt-2 text-3xl font-black">{stateName}</h3>
                <p className="mt-4 line-clamp-4 leading-7 text-slate-400">
                  {details.description}
                </p>
                <p className="mt-7 font-black text-yellow-400 transition group-hover:text-yellow-300">
                  Enter State →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#070b14] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
                Complete State Directory
              </p>
              <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
                Explore All 57 Lunar States
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                Open any state to discover its cities, all twenty towns, defining
                highlights, nearby landmarks, property paths, and live activity.
              </p>
            </div>
            <Link
              href="/pricing"
              className="rounded-xl border border-yellow-400/50 px-5 py-3 text-sm font-black uppercase tracking-wide text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
            >
              Use Quick Pick Instead
            </Link>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stateNames.map((stateName, index) => {
              const details = lunarStateDetails[stateName];
              const stateProperties = properties.filter(
                (property) => property.state === stateName
              );
              const available = stateProperties.filter(
                (property) => property.status === "Available"
              ).length;
              const reserved = stateProperties.filter(
                (property) => property.status === "Reserved"
              ).length;
              const sold = stateProperties.filter(
                (property) => property.status === "Sold"
              ).length;

              return (
                <Link
                  key={stateName}
                  href={`/states/${encodeURIComponent(stateName)}`}
                  className="group rounded-[2rem] border border-white/10 bg-black/35 p-7 transition hover:-translate-y-1 hover:border-yellow-400/60"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-400">
                        State {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-3 text-3xl font-black">{stateName}</h3>
                      <p className="mt-2 font-bold text-cyan-200">
                        {details.nickname || "LunaSphere Atlas Region"}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-400">
                      {details.cities.length} Cities
                    </span>
                  </div>

                  <p className="mt-5 line-clamp-3 leading-7 text-slate-400">
                    {details.description}
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                    {[
                      [available, "Available"],
                      [reserved, "Reserved"],
                      [sold, "Sold"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/10 bg-white/[0.035] px-2 py-3"
                      >
                        <p className="text-xl font-black text-yellow-400">
                          {value}
                        </p>
                        <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 text-sm">
                    <span className="font-bold text-slate-500">
                      {details.towns.length} Towns · Rural Territory
                    </span>
                    <span className="font-black text-yellow-400 transition group-hover:text-yellow-300">
                      Explore →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-yellow-400/25 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-9 text-center sm:p-14">
          <p className="text-sm font-black uppercase tracking-[0.38em] text-yellow-400">
            Two Ways to Choose
          </p>
          <h2 className="mt-5 text-4xl font-black uppercase sm:text-6xl">
            Explore Deeply or Launch Quickly
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Browse states and communities for the full LunaSphere experience, or
            use Quick Pick to reserve a real available property without searching
            the entire Atlas.
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
        </div>
      </section>
    </main>
  );
}
