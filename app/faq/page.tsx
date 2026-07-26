import type { Metadata } from "next";

import JsonLd from "@/components/JsonLd";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Moon Property FAQ: Prices, Deeds, Gifts & Ownership | Orbital One",
  description:
    "Get clear answers about Orbital One novelty Moon property, lunar deeds, prices, gifts, LunaSphere locations, digital delivery, HOA membership, and legal ownership.",
  path: "/faq",
});

const faqs = [
  {
    question: "Do I legally own land on the Moon?",
    answer:
      "No. Orbital One Realty sells novelty and commemorative products for entertainment, gifting, and collecting. Purchases do not convey government-recognized ownership of lunar real estate, legal title, development rights, mineral rights, or a right to occupy a location on the Moon.",
  },
  {
    question: "What is Orbital One Realty?",
    answer:
      "Orbital One Realty is a novelty Moon property experience operated by MiJoy Enterprises LLC. Customers can explore the LunaSphere Moon atlas, choose an available rural parcel, town block, or city block, and receive a personalized digital ownership collection.",
  },
  {
    question: "How much does novelty Moon property cost?",
    answer:
      "A half-acre novelty lunar property is $16.95. The first full rural acre is $24.95, and each edge-adjoining additional rural acre in the same connected purchase is $7.95. A Lunar Town Block is $39.95, and a Lunar City Block is $54.95. Each additional deed name is $1.99.",
  },
  {
    question: "What comes with a property purchase?",
    answer:
      "A qualifying purchase includes personalized novelty property documents, property and certificate records, terrain-based and LunaScape imagery, welcome and membership materials, customer portfolio access, and complimentary 2026 Charter HOA membership. The exact collection is shown before checkout.",
  },
  {
    question: "Can I choose the exact location?",
    answer:
      "Yes. You can use the interactive LunaSphere Moon map to search states, cities, towns, landmarks, and available properties. You can also use Quick Pick when you prefer Orbital One to securely assign an available property from the selected category.",
  },
  {
    question: "How are duplicate property sales prevented?",
    answer:
      "Orbital One uses live inventory status, temporary reservations, server-side checkout validation, payment verification, and fulfillment controls. Sold properties are marked unavailable, and expired reservations are released back into inventory.",
  },
  {
    question: "Can I add another name to the deed?",
    answer:
      "Yes. Additional deed names can be added for $1.99 each where the personalization form offers that option. Review all spelling, capitalization, and punctuation carefully before checkout because production may begin immediately after payment.",
  },
  {
    question: "Can I purchase a lunar property as a gift?",
    answer:
      "Yes. Orbital One property is designed to work as a memorable space-themed gift. You can enter recipient details and an optional gift message during personalization. The purchaser remains responsible for the order and for providing accurate recipient information.",
  },
  {
    question: "How are my documents delivered?",
    answer:
      "Orbital One products are primarily personalized digital products. Documents and images may be delivered through the order-success page, customer account, email, secure download links, or a combination of those methods. Printed or mailed copies are not included unless a product listing specifically says otherwise.",
  },
  {
    question: "What is the Orbital One HOA?",
    answer:
      "The Orbital One HOA is a novelty customer and community membership, not a legally recognized homeowners association. Qualifying purchases include complimentary 2026 Charter HOA membership with founding recognition, communications, future updates, and possible member benefits.",
  },
  {
    question: "What is a novelty Lunar Passport?",
    answer:
      "The Orbital One Lunar Passport is an optional personalized novelty keepsake currently priced at $4.99. It is not government-issued identification, proof of citizenship, or a valid travel document.",
  },
  {
    question: "What are LunaSphere and LunaScape?",
    answer:
      "LunaSphere is Orbital One's proprietary Moon atlas, geography, property-identification, search, reservation, and inventory experience. LunaScape is the branded visual and future-experience concept connected to virtual property scenes, enhancements, and communities. Planned future features are not guaranteed by a property purchase.",
  },
  {
    question: "Can I verify an Orbital One certificate?",
    answer:
      "Yes. Use the Certificate Verification page and enter the certificate number exactly as shown on the document. Individual customer records and certificate details are protected from general search-engine indexing.",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <JsonLd data={faqStructuredData} />
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          Moon Property Help Center
        </p>
        <h1 className="mt-4 text-center text-5xl font-black uppercase">
          Novelty Moon Property Questions
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-gray-300">
          Clear answers about pricing, personalized lunar deeds, gifts,
          LunaSphere locations, digital delivery, HOA membership, and the
          important distinction between novelty products and legal real estate.
        </p>

        <div className="mt-12 space-y-6">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-white/20 bg-white/[0.03] p-6"
            >
              <h2 className="text-2xl font-bold text-yellow-400">
                {faq.question}
              </h2>
              <p className="mt-3 leading-7 text-gray-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
