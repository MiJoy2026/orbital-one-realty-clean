import { lunarStateDetails } from "@/lib/lunar-state-details";
import { prisma } from "@/lib/prisma";

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

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Lunar States
        </h1>

        <p className="mt-6 text-center text-xl text-gray-300">
          Explore all {stateNames.length} Orbital One lunar states. Each state
          includes 3 cities, 20 towns, and rural novelty acreage.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {stateNames.map((stateName) => {
            const details = lunarStateDetails[stateName];

            const stateProperties = properties.filter(
              (property) => property.state === stateName
            );

            const available = stateProperties.filter(
              (property) => property.status === "Available"
            ).length;

            const sold = stateProperties.filter(
              (property) => property.status === "Sold"
            ).length;

            return (
              <a
                key={stateName}
                href={`/states/${encodeURIComponent(stateName)}`}
                className="block rounded-3xl border border-white/20 bg-white/5 p-6 transition hover:border-yellow-400"
              >
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
                  Orbital One Lunar State
                </p>

                <h2 className="mt-3 text-2xl font-black">{stateName}</h2>

                <p className="mt-3 text-sm text-yellow-400">
                  {details.nickname || "Lunar Atlas Region"}
                </p>

                <div className="mt-5 space-y-2 text-gray-300">
                  <p>{details.cities.length} Cities</p>
                  <p>{details.towns.length} Towns</p>
                  <p>Rural Acreage</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold">
                    {available} Available
                  </span>

                  <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold">
                    {sold} Sold
                  </span>
                </div>

                <div className="mt-6 rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black">
                  View State
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}