import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";

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

  const property = await prisma.property.findFirst({
    where: {
      id: {
        equals: query,
        mode: "insensitive",
      },
    },
  });

  if (property) {
    redirect(`/explore/${property.id}`);
  }

  const state = await prisma.lunarState.findFirst({
    where: {
      name: {
        equals: query,
        mode: "insensitive",
      },
    },
  });

  if (state) {
    redirect(`/states/${encodeURIComponent(state.name)}`);
  }

  const city = await prisma.lunarCity.findFirst({
    where: {
      name: {
        equals: query,
        mode: "insensitive",
      },
    },
  });

  if (city) {
    redirect(`/cities/${encodeURIComponent(city.name)}`);
  }

  const town = await prisma.lunarTown.findFirst({
    where: {
      name: {
        equals: query,
        mode: "insensitive",
      },
    },
  });

  if (town) {
    redirect(`/towns/${encodeURIComponent(town.name)}`);
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

        <p className="mt-4 text-2xl font-black text-yellow-400">{query}</p>

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