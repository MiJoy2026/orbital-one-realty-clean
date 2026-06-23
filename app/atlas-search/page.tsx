import { redirect } from "next/navigation";
import { lunarStates, sampleProperties } from "../../lib/moon-data";

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

  const lowerQuery = query.toLowerCase();

  const property = sampleProperties.find(
    (item) => item.id.toLowerCase() === lowerQuery
  );

  if (property) {
    redirect(`/explore/${property.id}`);
  }

  const state = lunarStates.find(
    (item) => item.name.toLowerCase() === lowerQuery
  );

  if (state) {
    redirect(`/states/${encodeURIComponent(state.name)}`);
  }

  const city = lunarStates
    .flatMap((state) => state.cities)
    .find((city) => city.toLowerCase() === lowerQuery);

  if (city) {
    redirect(`/cities/${encodeURIComponent(city)}`);
  }

  const town = lunarStates
    .flatMap((state) => state.towns)
    .find((town) => town.toLowerCase() === lowerQuery);

  if (town) {
    redirect(`/towns/${encodeURIComponent(town)}`);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/20 bg-white/5 p-8 text-center">
        <h1 className="text-5xl font-black uppercase text-red-500">
          No Atlas Match Found
        </h1>

        <p className="mt-6 text-gray-300">
          We could not find a state, city, town, or property matching:
        </p>

        <p className="mt-4 text-2xl font-black text-yellow-400">
          {query}
        </p>

        <a
          href="/moon-map"
          className="mt-8 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
        >
          Back to Lunar Atlas
        </a>
      </div>
    </main>
  );
}