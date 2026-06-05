import { lunarStates, sampleProperties } from "../../lib/moon-data";

export default function StatesPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Lunar States
        </h1>

        <p className="mt-6 text-center text-xl text-gray-300">
          Explore all 57 Orbital One lunar states. Each state includes 3 cities,
          20 towns, and rural novelty acreage.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {lunarStates.map((state) => {
            const stateProperties = sampleProperties.filter(
              (property) => property.state === state.name
            );

            const available = stateProperties.filter(
              (property) => property.status === "Available"
            ).length;

            const sold = stateProperties.filter(
              (property) => property.status === "Sold"
            ).length;

            return (
              <a
                 key={state.id}
                 href={`/states/${encodeURIComponent(state.name)}`}
                 className="block rounded-3xl border border-white/20 bg-white/5 p-6 hover:border-yellow-400"
              >
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
                  State {state.id}
                </p>

                <h2 className="mt-3 text-2xl font-black">
                  {state.name}
                </h2>

                <div className="mt-5 space-y-2 text-gray-300">
                  <p>3 Cities</p>
                  <p>20 Towns</p>
                  <p>Rural Acreage</p>
                </div>

                <div className="mt-5 flex gap-2">
                  <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold">
                    {available} Available
                  </span>

                  <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold">
                    {sold} Sold
                  </span>
                </div>

                <a
                  href="/explore"
                  className="mt-6 block rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black"
                >
                  View Properties
                </a>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}