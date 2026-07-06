import { prisma } from "../../../lib/prisma";

export default async function StateDetailPage({
  params,
}: {
  params: Promise<{ stateName: string }>;
}) {
  const { stateName } = await params;
  const decodedName = decodeURIComponent(stateName);

  const state = await prisma.lunarState.findFirst({
    where: {
      name: {
        equals: decodedName,
        mode: "insensitive",
      },
    },
    include: {
      cities: {
        orderBy: { name: "asc" },
      },
      towns: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!state) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">State Not Found</h1>

        <a
          href="/moon-map"
          className="mt-6 inline-block rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400 hover:bg-yellow-400 hover:text-black"
        >
          Back to Lunar Atlas
        </a>
      </main>
    );
  }

  const stateProperties = await prisma.property.findMany({
    where: {
      state: state.name,
    },
    orderBy: {
      id: "asc",
    },
  });

  const available = stateProperties.filter(
    (property) => property.status !== "Sold"
  );

  const sold = stateProperties.filter((property) => property.status === "Sold");

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
          Orbital One Lunar State
        </p>

        <h1 className="mt-4 text-6xl font-black uppercase text-yellow-400">
          {state.name}
        </h1>

        <p className="mt-4 text-2xl font-bold">
          {state.theme || "Lunar State"}
        </p>

        <p className="mt-6 max-w-4xl text-lg text-gray-300">
          {state.description || "One of Orbital One Realty's 57 lunar states."}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/moon-map"
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            Back to Lunar Atlas
          </a>

          <a
            href="/pricing"
            className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
          >
            View Pricing
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-yellow-400 bg-white/5 p-6">
            <p className="text-4xl font-black text-yellow-400">
              {state.cities.length}
            </p>
            <p className="mt-2 uppercase text-gray-400">Cities</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-4xl font-black">{state.towns.length}</p>
            <p className="mt-2 uppercase text-gray-400">Towns</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-4xl font-black">50,000</p>
            <p className="mt-2 uppercase text-gray-400">Rural Acres</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-4xl font-black">{stateProperties.length}</p>
            <p className="mt-2 uppercase text-gray-400">Listings</p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            Cities
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {state.cities.map((city) => (
              <a
                key={city.id}
                href={`/cities/${encodeURIComponent(city.name)}`}
                className="rounded-2xl border border-white/20 bg-white/5 p-5 font-bold transition hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                {city.name}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            Towns
          </h2>

          <p className="mt-3 text-gray-400">
            Showing the first 8 of {state.towns.length} towns.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {state.towns.slice(0, 8).map((town) => (
              <a
                key={town.id}
                href={`/towns/${encodeURIComponent(town.name)}`}
                className="rounded-2xl border border-white/20 bg-white/5 p-5 font-bold transition hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                {town.name}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            Property Listings
          </h2>

          <div className="mt-6 flex flex-wrap gap-4">
            <span className="rounded-full bg-green-600 px-4 py-2 font-bold">
              {available.length} Available
            </span>

            <span className="rounded-full bg-red-600 px-4 py-2 font-bold">
              {sold.length} Sold
            </span>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {stateProperties.length > 0 ? (
              stateProperties.map((property) => (
                <a
                  key={property.id}
                  href={`/explore/${property.id}`}
                  className="rounded-3xl border border-white/20 bg-white/5 p-6 transition hover:border-yellow-400 hover:bg-yellow-400/10"
                >
                  <p className="text-sm font-bold uppercase text-yellow-400">
                    {property.type}
                  </p>

                  <h3 className="mt-2 text-3xl font-black">{property.id}</h3>

                  <p className="mt-2 text-gray-300">{property.size}</p>

                  <p className="mt-4 text-2xl font-black text-yellow-400">
                    ${property.price.toFixed(2)}
                  </p>
                </a>
              ))
            ) : (
              <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-gray-400 md:col-span-2">
                No individual listings are currently shown for this state yet.
                Rural acreage is still available through the state inventory
                system.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}