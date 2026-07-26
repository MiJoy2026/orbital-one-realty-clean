import type { Metadata } from "next";

import JsonLd from "@/components/JsonLd";
import {
  ADDITIONAL_RURAL_ACRE_PRICE,
  PROPERTY_PRICES,
} from "@/lib/purchase-constants";
import {
  ORGANIZATION_ID,
  SITE_URL,
  createPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Moon Property Prices: Acres, Town & City Blocks | Orbital One",
  description:
    "Compare Orbital One novelty Moon property prices: half acres $16.95, rural acres $24.95, adjoining acres $7.95, town blocks $39.95, and city blocks $54.95.",
  path: "/pricing",
  image: "/pricing/pricing-hero.png",
  imageAlt: "Orbital One Realty novelty Moon property pricing",
});

const products = [
  {
    name: "Half-Acre Novelty Lunar Property",
    description:
      "A personalized half-acre novelty Moon property with digital deed, property records, imagery, and Charter HOA membership.",
    image: `${SITE_URL}/property-images/rural-acre.jpg`,
    price: PROPERTY_PRICES["Half Acre"],
    sku: "rural-half-acre",
    category: "Novelty lunar property",
  },
  {
    name: "One-Acre Novelty Lunar Property",
    description:
      `A full novelty lunar acre with adjoining additional rural acres available for $${ADDITIONAL_RURAL_ACRE_PRICE.toFixed(2)} each in the same connected purchase.`,
    image: `${SITE_URL}/property-images/rural-acre.jpg`,
    price: PROPERTY_PRICES["Rural Acre"],
    sku: "rural-one-acre",
    category: "Novelty lunar property",
  },
  {
    name: "Novelty Lunar Town Block",
    description:
      "A personalized novelty property block located inside one of 1,140 named LunaSphere lunar towns.",
    image: `${SITE_URL}/property-images/town-block.jpg`,
    price: PROPERTY_PRICES["Town Block"],
    sku: "town-block",
    category: "Novelty lunar town property",
  },
  {
    name: "Novelty Lunar City Block",
    description:
      "A premium personalized novelty property block located inside one of 171 named LunaSphere lunar cities.",
    image: `${SITE_URL}/property-images/city-block.jpg`,
    price: PROPERTY_PRICES["City Block"],
    sku: "city-block",
    category: "Novelty lunar city property",
  },
];

const pricingStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Orbital One Realty Novelty Moon Property Collection",
  url: `${SITE_URL}/pricing`,
  numberOfItems: products.length,
  itemListElement: products.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.image,
      sku: product.sku,
      category: product.category,
      brand: {
        "@type": "Brand",
        name: "Orbital One Realty",
      },
      manufacturer: { "@id": ORGANIZATION_ID },
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Legal status",
        value:
          "Novelty and entertainment product; does not convey legally recognized lunar real estate ownership.",
      },
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/pricing`,
        priceCurrency: "USD",
        price: product.price.toFixed(2),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": ORGANIZATION_ID },
      },
    },
  })),
};

export default function PricingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd data={pricingStructuredData} />
      {children}
    </>
  );
}
