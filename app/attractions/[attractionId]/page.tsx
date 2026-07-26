import AttractionGallery from "@/components/AttractionGallery";
import JsonLd from "@/components/JsonLd";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { lunarAttractions } from "../../../lib/lunar-attractions";
import { getNearbyPropertiesForAttraction } from "../../../lib/attraction-service";
import { ORGANIZATION_ID, SITE_URL, createPageMetadata, truncateDescription } from "../../../lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ attractionId: string }>;
}): Promise<Metadata> {
  const { attractionId } = await params;
  const attraction = lunarAttractions.find(
    (item) => item.id.toLowerCase() === attractionId.toLowerCase()
  );

  if (!attraction) {
    return createPageMetadata({
      title: "Moon Landmark Not Found | Orbital One Realty",
      description: "The requested LunaSphere Moon landmark could not be found.",
      path: `/attractions/${encodeURIComponent(attractionId)}`,
      noIndex: true,
      follow: false,
    });
  }

  return createPageMetadata({
    title: `${attraction.name}: Moon Landmark Guide | Orbital One Realty`,
    description: truncateDescription(
      `${attraction.description} Explore its history, facts, LunaSphere location, imagery, and nearby novelty lunar property.`
    ),
    path: `/attractions/${encodeURIComponent(attraction.id)}`,
    image: attraction.image,
    imageAlt: `${attraction.name} on the Moon`,
    type: "article",
  });
}

export default async function AttractionDetailPage({
  params,
}: {
  params: Promise<{ attractionId: string }>;
}) {
  const { attractionId } = await params;

  const attraction = lunarAttractions.find(
    (item) => item.id.toLowerCase() === attractionId.toLowerCase()
  );

  if (!attraction) {
    notFound();
  }

  const nearbyProperties = await getNearbyPropertiesForAttraction(attraction.id, 6);

  const canonicalUrl = `${SITE_URL}/attractions/${encodeURIComponent(
    attraction.id
  )}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Explore the Moon",
          item: `${SITE_URL}/explore`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: attraction.name,
          item: canonicalUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: attraction.name,
      description: attraction.description,
      image: `${SITE_URL}${attraction.image}`,
      mainEntityOfPage: canonicalUrl,
      about: {
        "@type": "Place",
        name: attraction.name,
        description: attraction.description,
      },
      publisher: { "@id": ORGANIZATION_ID },
      author: { "@id": ORGANIZATION_ID },
      inLanguage: "en-US",
    },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <JsonLd data={structuredData} />
      <div className="mx-auto max-w-6xl">
        <Image
          src={attraction.image}
          alt={attraction.name}
          width={1200}
          height={650}
          className="mb-10 h-[420px] w-full rounded-3xl border border-yellow-400/30 object-cover"
        />
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          Lunar Attraction
        </p>

        <h1 className="mt-4 text-6xl font-black uppercase text-yellow-400">
          {attraction.name}
        </h1>

        <p className="mt-4 text-2xl font-bold">{attraction.type}</p>
        {attraction.featured && (
        <p className="mt-4 inline-block rounded-full border border-yellow-400 px-4 py-2 text-sm font-black uppercase text-yellow-400">
          Featured Lunar Landmark
        </p>
      )}

      {attraction.tagline && (
        <p className="mt-6 text-2xl font-bold text-gray-200">
          “{attraction.tagline}”
        </p>
      )}

        <p className="mt-6 max-w-4xl text-lg text-gray-300">
          {attraction.description}
        </p>

        {attraction.quickFacts && (
  <div className="mt-10 rounded-3xl border border-yellow-400/30 bg-white/5 p-8">
    <h2 className="text-2xl font-black uppercase text-yellow-400">
      Quick Facts
    </h2>

    <div className="mt-6 grid gap-6 md:grid-cols-2">
      {attraction.quickFacts.map((fact) => (
        <div
          key={fact.label}
          className="rounded-2xl border border-white/10 bg-black/30 p-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            {fact.label}
          </p>

          <p className="mt-2 text-xl font-black text-white">
            {fact.value}
          </p>
        </div>
      ))}
        {attraction.history && (
          <section className="mt-12 rounded-3xl border border-yellow-400/30 bg-white/5 p-8">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            Historical Overview
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            {attraction.history}
          </p>
          </section>
        )}
        {attraction.gallery && (
        <AttractionGallery
           images={attraction.gallery}
           title={attraction.name}
        />
        )}
    </div>
  </div>
)}

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href={`/moon-map?attraction=${encodeURIComponent(attraction.id)}`}
            className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
          >
            Show on Atlas
          </a>

          <a
            href="/moon-map"
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            Back to Lunar Atlas
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">State</p>
            <p className="mt-2 text-2xl font-black">{attraction.state}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Coordinates</p>
            <p className="mt-2 text-2xl font-black">
              X: {attraction.x} · Y: {attraction.y}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Nearby Properties</p>
            <p className="mt-2 text-2xl font-black">
              {nearbyProperties.length}
            </p>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-black uppercase text-yellow-400">
            Nearby Properties
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {nearbyProperties.map((property: any) => (
              <a
                key={property.id}
                href={`/explore/${property.id}`}
                className="rounded-3xl border border-white/20 bg-white/5 p-6 transition hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                <p className="text-3xl font-black text-yellow-400">
                  {property.id}
                </p>

                <p className="mt-2">{property.type}</p>

                <p className="mt-2 text-gray-300">{property.state}</p>

                <p className="mt-4 text-2xl font-black">
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