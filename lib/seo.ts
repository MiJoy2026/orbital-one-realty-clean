import type { Metadata } from "next";

export const SITE_NAME = "Orbital One Realty";
export const SITE_URL = "https://www.orbitalonerealty.com";
export const DEFAULT_OG_IMAGE = "/opengraph-image";
export const SEO_RELEASE_DATE = new Date("2026-07-25T00:00:00.000Z");

export const DEFAULT_SITE_DESCRIPTION =
  "Explore novelty Moon property gifts from Orbital One Realty. Choose lunar acreage, town blocks, or city blocks and receive personalized digital documents, LunaSphere map access, and Charter HOA membership.";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  follow?: boolean;
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = `${SITE_NAME} novelty lunar property experience`,
  type = "website",
  noIndex = false,
  follow = true,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type,
      locale: "en_US",
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow,
          nocache: true,
          googleBot: {
            index: false,
            follow,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function truncateDescription(value: string, maxLength = 158) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
