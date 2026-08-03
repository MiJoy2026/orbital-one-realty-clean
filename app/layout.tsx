import { CartProvider } from "@/context/CartContext";
import CartButton from "@/components/CartButton";
import SiteFooter from "@/components/SiteFooter";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

import { getSessionUserId } from "@/lib/session";
import {
  DEFAULT_SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Novelty Moon Property Gifts & Lunar Land Deeds | Orbital One Realty",
  description: DEFAULT_SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "MiJoy Enterprises LLC" }],
  creator: "MiJoy Enterprises LLC",
  publisher: "MiJoy Enterprises LLC",
  category: "Novelty gifts and entertainment",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
  google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  other: {
    ...(process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : {}),
    "p:domain_verify": "476de25907dcce72cd8707ac789cf900",
  },
},
  robots: {
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: "Novelty Moon Property Gifts & Lunar Land Deeds",
    description: DEFAULT_SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Orbital One Realty novelty lunar property and LunaSphere Moon atlas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Novelty Moon Property Gifts & Lunar Land Deeds",
    description: DEFAULT_SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getSessionUserId();
  const isLoggedIn = Boolean(userId);

  return (
    <html lang="en">
      <body>
        <CartProvider>
        <GoogleAnalytics />
         <MetaPixel />
          <nav className="sticky top-0 z-50 border-b border-yellow-400/20 bg-black/95 text-white backdrop-blur">
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex items-center justify-between gap-4 py-1">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/orbital-one-logo.png"
                    alt="Orbital One Realty"
                    width={700}
                    height={120}
                    priority
                    className="h-[100px] w-auto object-contain"
                  />
                </Link>

                <div className="flex items-center gap-3">
                  <Link
                    href={isLoggedIn ? "/account" : "/login"}
                    className="rounded-full border border-yellow-400 px-4 py-1.5 font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
                  >
                    {isLoggedIn ? "👤 My Account" : "👤 Sign In"}
                  </Link>

                  <CartButton />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-white/10 py-2 text-sm font-bold uppercase tracking-wider">
                <Link href="/" className="transition hover:text-yellow-400">
                  Home
                </Link>
                <Link href="/explore" className="transition hover:text-yellow-400">
                  Explore
                </Link>
                <Link href="/states" className="transition hover:text-yellow-400">
                  States
                </Link>
                <Link href="/pricing" className="transition hover:text-yellow-400">
                  Pricing
                </Link>
                <Link href="/faq" className="transition hover:text-yellow-400">
                  FAQ
                </Link>
                <Link href="/hoa" className="transition hover:text-yellow-400">
                  HOA
                </Link>
                <Link href="/creators" className="transition hover:text-yellow-400">
                  Creators
                </Link><Link href="/contact" className="transition hover:text-yellow-400">
                  Contact
                </Link>
              </div>
            </div>
          </nav>

          {children}
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
