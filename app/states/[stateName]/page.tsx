import { lunarStates, sampleProperties } from "../../../lib/moon-data";

export default async function StateDetailPage({
  params,
}: {
  params: Promise<{ stateName: string }>;
}) {
  const { stateName } = await params;

  const decodedName = decodeURIComponent(stateName);

  const state = lunarStates.find(
    (s) => s.name.toLowerCase() === decodedName.toLowerCase()
  );

  if (!state) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">State Not Found</h1>

        <a
          href="/states"
          className="mt-8 inline-block text-yellow-400"
        >
          Back to States
        </a>
      </main>
    );
  }

  const stateProperties = sampleProperties.filter(
    (property) => property.state === state.name
  );

  const available = stateProperties.filter(
    (property) => property.status === "Available"
  );

  const sold = stateProperties.filter(
    (property) => property.status === "Sold"
  );

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase">
          {state.name}
        </h1>

        <p className="mt-4 text-xl text-gray-300">
          One of Orbital One Realty&apos;s 57 lunar states.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400 p-6">
            <p className="text-4xl font-black text-yellow-400">
              {state.cities.length}
            </p>

            <p className="mt-2">Cities</p>
          </div>

          <div className="rounded-2xl border border-yellow-400 p-6">
            <p className="text-4xl font-black text-yellow-400">
              {state.towns.length}
            </p>

            <p className="mt-2">Towns</p>
          </div>

          <div className="rounded-2xl border border-yellow-400 p-6">
            <p className="text-4xl font-black text-yellow-400">
              {stateProperties.length}
            </p>

            <p className="mt-2">Properties Listed</p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase">
            Cities
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {state.cities.map((city) => (
              <div
                key={city}
                className="rounded-2xl border border-white/20 p-4"
              >
                {city}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase">
            Sample Towns
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {state.towns.slice(0, 8).map((town) => (
              <div
                key={town}
                className="rounded-2xl border border-white/20 p-4"
              >
                {town}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase">
            Properties
          </h2>

          <div className="mt-6 flex gap-4">
            <span className="rounded-full bg-green-600 px-4 py-2 font-bold">
              {available.length} Available
            </span>

            <span className="rounded-full bg-red-600 px-4 py-2 font-bold">
              {sold.length} Sold
            </span>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {stateProperties.map((property) => (
              <a
                key={property.id}
                href={`/explore/${property.id}`}
                className="rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-2xl font-black">
                  {property.id}
                </h3>

                <p className="mt-2 text-yellow-400">
                  {property.type}
                </p>

                <p className="mt-2">
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