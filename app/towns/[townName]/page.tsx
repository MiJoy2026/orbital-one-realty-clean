import { prisma } from "../../../lib/prisma";
import { lunarStates, sampleProperties } from "../../../lib/moon-data";

export default async function TownDetailPage({
  params,
}: {
  params: Promise<{ townName: string }>;
}) {
  const { townName } = await params;
  const decodedTownName = decodeURIComponent(townName);

  const state = lunarStates.find((lunarState) =>
    lunarState.towns.includes(decodedTownName)
  );

  if (!state) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">Town Not Found</h1>

        <a href="/moon-map" className="mt-8 inline-block text-yellow-400">
          Back to Lunar Atlas
        </a>
      </main>
    );
  }

  const townProperties = sampleProperties.filter(
    (property) => property.town === decodedTownName
  );
   const dbProperties = await prisma.property.findMany();

const townPropertiesWithLiveStatus = townProperties.map((property) => {
  const dbProperty = dbProperties.find((item) => item.id === property.id);

  return {
    ...property,
    status: dbProperty?.status || property.status,
  };
});
  const available = townPropertiesWithLiveStatus.filter(
  (property) => property.status === "Available"
);

const sold = townPropertiesWithLiveStatus.filter(
  (property) => property.status === "Sold"
);

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
          {state.name}
        </p>

        <h1 className="mt-3 text-5xl font-black uppercase">
          {decodedTownName}
        </h1>

        <p className="mt-6 max-w-4xl text-lg text-gray-300">
          {decodedTownName} is one of 20 town regions within the lunar state of{" "}
          {state.name}. Town Blocks offer a fun, community-style novelty lunar
          property experience within the Orbital One Realty atlas.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={`/states/${encodeURIComponent(state.name)}`}
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            Back to {state.name}
          </a>

          <a
            href="/moon-map"
            className="rounded-xl border border-white/30 px-6 py-3 font-black text-white hover:bg-white hover:text-black"
          >
            Back to Lunar Atlas
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400 p-6">
            <p className="text-4xl font-black text-yellow-400">
              {townPropertiesWithLiveStatus.length}
            </p>
            <p className="mt-2">Town Blocks Listed</p>
          </div>

          <div className="rounded-2xl border border-green-500 p-6">
            <p className="text-4xl font-black text-green-400">
              {available.length}
            </p>
            <p className="mt-2">Available</p>
          </div>

          <div className="rounded-2xl border border-red-500 p-6">
            <p className="text-4xl font-black text-red-400">{sold.length}</p>
            <p className="mt-2">Sold</p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase">
            Town Block Properties
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {townPropertiesWithLiveStatus.length > 0 ? (
              townPropertiesWithLiveStatus.map((property) => (
                <a
                  key={property.id}
                  href={`/explore/${property.id}`}
                  className="rounded-2xl border border-white/20 p-6 hover:border-yellow-400"
                >
                  <h3 className="text-2xl font-black">{property.id}</h3>
                  <p className="mt-2 text-yellow-400">{property.type}</p>
                  <p className="mt-2">{property.size}</p>
                  <p className="mt-2 font-bold">
                    ${property.price.toFixed(2)}
                  </p>
                </a>
              ))
            ) : (
              <p className="text-gray-400">
                No town blocks are currently listed in this town.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}