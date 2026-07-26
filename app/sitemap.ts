import type { MetadataRoute } from "next";

import { lunarAttractions } from "@/lib/lunar-attractions";
import {
  getLunarCityHref,
  getLunarTownHref,
} from "@/lib/lunar-location-links";
import { lunarStateDetails } from "@/lib/lunar-state-details";
import { absoluteUrl, SEO_RELEASE_DATE } from "@/lib/seo";

const staticPages: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  images?: string[];
}> = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "weekly",
    images: ["/backgrounds/account-bg.jpg", "/property-images/rural-acre.jpg"],
  },
  {
    path: "/explore",
    priority: 0.95,
    changeFrequency: "weekly",
    images: ["/atlas/moon-atlas-v2.jpg"],
  },
  {
    path: "/pricing",
    priority: 0.95,
    changeFrequency: "weekly",
    images: ["/pricing/pricing-hero.png"],
  },
  {
    path: "/states",
    priority: 0.9,
    changeFrequency: "weekly",
    images: ["/atlas/moon-atlas-v2.jpg"],
  },
  {
    path: "/moon-map",
    priority: 0.9,
    changeFrequency: "weekly",
    images: ["/atlas/moon-atlas-v2.jpg"],
  },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/hoa", priority: 0.75, changeFrequency: "monthly" },
  { path: "/passports", priority: 0.75, changeFrequency: "monthly" },
  { path: "/verify", priority: 0.65, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.25, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.25, changeFrequency: "yearly" },
  { path: "/refunds", priority: 0.25, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
  {
    path: "/shipping-delivery",
    priority: 0.25,
    changeFrequency: "yearly",
  },
  { path: "/accessibility", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal-notice", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: SEO_RELEASE_DATE,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    images: page.images?.map(absoluteUrl),
  }));

  const stateEntries: MetadataRoute.Sitemap = Object.entries(
    lunarStateDetails
  ).map(([stateName]) => ({
    url: absoluteUrl(`/states/${encodeURIComponent(stateName)}`),
    lastModified: SEO_RELEASE_DATE,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const cityEntries: MetadataRoute.Sitemap = Object.entries(
    lunarStateDetails
  ).flatMap(([stateName, state]) =>
    state.cities.map((city) => ({
      url: absoluteUrl(getLunarCityHref(stateName, city.name)),
      lastModified: SEO_RELEASE_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }))
  );

  const townEntries: MetadataRoute.Sitemap = Object.entries(
    lunarStateDetails
  ).flatMap(([stateName, state]) =>
    state.towns.map((town) => ({
      url: absoluteUrl(getLunarTownHref(stateName, town.name)),
      lastModified: SEO_RELEASE_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    }))
  );

  const attractionEntries: MetadataRoute.Sitemap = lunarAttractions.map(
    (attraction) => ({
      url: absoluteUrl(`/attractions/${encodeURIComponent(attraction.id)}`),
      lastModified: SEO_RELEASE_DATE,
      changeFrequency: "monthly",
      priority: attraction.featured ? 0.8 : 0.65,
      images: [absoluteUrl(attraction.image)],
    })
  );

  return [
    ...staticEntries,
    ...stateEntries,
    ...cityEntries,
    ...townEntries,
    ...attractionEntries,
  ];
}
