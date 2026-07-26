import type { Metadata } from "next";

import JsonLd from "@/components/JsonLd";
import { PASSPORT_PRICE } from "@/lib/purchase-constants";
import { SITE_URL, createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Personalized Novelty Lunar Passport | Orbital One Realty",
  description:
    "Add a personalized Orbital One Lunar Passport to a novelty Moon property order. This $4.99 digital keepsake is not identification or a valid travel document.",
  path: "/passports",
});

const passportStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Personalized Novelty Lunar Passport",
  description:
    "An optional personalized digital Lunar Passport keepsake for Orbital One novelty Moon property orders. Not valid for travel, identification, or citizenship.",
  image: `${SITE_URL}/orbital-one-logo.png`,
  sku: "lunar-passport",
  category: "Novelty space gift",
  brand: {
    "@type": "Brand",
    name: "Orbital One Realty",
  },
  offers: {
    "@type": "Offer",
    url: `${SITE_URL}/passports`,
    priceCurrency: "USD",
    price: PASSPORT_PRICE.toFixed(2),
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
  },
};

export default function PassportsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <JsonLd data={passportStructuredData} />
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <section>
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
            Personalized Space Keepsake
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase">
            Novelty Lunar Passports
          </h1>

          <p className="mt-6 text-xl text-gray-300">
            Complete an Orbital One novelty Moon property gift with a
            personalized digital Lunar Passport.
          </p>

          <p className="mt-8 text-6xl font-black text-yellow-400">
            ${PASSPORT_PRICE.toFixed(2)}
          </p>

          <p className="mt-4 leading-7 text-gray-300">
            Each passport is an optional novelty keepsake and is not
            government-issued identification, proof of citizenship, or a valid
            travel document. Availability and personalization options are shown
            during the property-order process.
          </p>
        </section>

        <section className="rounded-3xl border border-yellow-400 p-8">
          <div className="rounded-2xl bg-yellow-400 p-8 text-black">
            <p className="text-sm font-bold uppercase tracking-[0.35em]">
              Orbital One Realty
            </p>

            <h2 className="mt-10 text-4xl font-black uppercase">
              Lunar Passport
            </h2>

            <p className="mt-8 font-semibold">
              Holder Name: ____________________
            </p>

            <p className="mt-4 font-semibold">
              Passport No: OOR-2026-0001
            </p>

            <p className="mt-10 text-sm">
              Novelty commemorative item only. Not valid for travel,
              identification, citizenship, or legal purposes.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
