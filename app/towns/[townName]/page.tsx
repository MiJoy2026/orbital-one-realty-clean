import {
  getLunarTownByName,
  getPropertiesByTown,
} from "../../../lib/atlas-service";

export default async function TownDetailPage({
  params,
}: {
  params: Promise<{ townName: string }>;
}) {
  const { townName } = await params;
  const decodedTownName = decodeURIComponent(townName);

  const town = await getLunarTownByName(decodedTownName);

  if (!town) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">Town Not Found</h1>

        <a href="/moon-map" className="mt-8 inline-block text-yellow-400">
          Back to Lunar Atlas
        </a>
      </main>
    );
  }

  const townProperties = await getPropertiesByTown(town.name);

  const available = townProperties.filter(
    (property) => property.status !== "Sold"
  );

  const sold = townProperties.filter((property) => property.status === "Sold");

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
          {town.state.name} Town Region
        </p>

        <h1 className="mt-4 text-6xl font-black uppercase text-yellow-400">
          {town.name}
        </h1>

        <p className="mt-6 max-w-4xl text-lg text-gray-300">
          {town.name} is one of 20 town regions within the lunar state of{" "}
          {town.state.name}. Town Blocks offer a community-style novelty lunar
          property experience within the Orbital One Realty atlas.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={`/states/${encodeURIComponent(town.state.name)}`}
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            Back to {town.state.name}
          </a>

          <a
            href="/moon-map"
            className="rounded-xl border border-white/30 px-6 py-3 font-black text-white"
          >
            Back to Lunar Atlas
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400 bg-white/5 p-6">
            <p className="text-4xl font-black text-yellow-400">
              {townProperties.length}
            </p>
            <p className="mt-2 uppercase text-gray-400">Town Blocks Listed</p>
          </div>

          <div className="rounded-2xl border border-green-500 bg-green-950/30 p-6">
            <p className="text-4xl font-black text-green-400">
              {available.length}
            </p>
            <p className="mt-2 uppercase text-gray-400">Available</p>
          </div>

          <div className="rounded-2xl border border-red-500 bg-red-950/30 p-6">
            <p className="text-4xl font-black text-red-400">{sold.length}</p>
            <p className="mt-2 uppercase text-gray-400">Sold</p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            Town Block Properties
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {townProperties.length > 0 ? (
              townProperties.map((property) => (
                <a
                  key={property.id}
                  href={`/explore/${property.id}`}
                  className="rounded-3xl border border-white/20 bg-white/5 p-6 transition hover:border-yellow-400 hover:bg-yellow-400/10"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-3xl font-black text-yellow-400">
                      {property.id}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        property.status === "Sold"
                          ? "bg-red-600 text-white"
                          : "bg-green-500 text-black"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <p className="mt-3 font-bold text-yellow-400">
                    {property.type}
                  </p>

                  <p className="mt-2 text-gray-300">{property.size}</p>

                  <p className="mt-4 text-2xl font-black">
                    ${property.price.toFixed(2)}
                  </p>
                </a>
              ))
            ) : (
              <div className="rounded-3xl border border-white/20 bg-white/5 p-8 text-gray-400 md:col-span-2">
                No town blocks are currently listed in this town.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}