import CartButton from "../components/CartButton";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

import { getSessionUserId } from "../lib/session";

export const metadata: Metadata = {
  title: "Orbital One Realty",
  description: "Novelty lunar property by Orbital One Realty",
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

              <Link
                href="/explore"
                className="transition hover:text-yellow-400"
              >
                Explore
              </Link>

              <Link
                href="/states"
                className="transition hover:text-yellow-400"
              >
                States
              </Link>

              <Link
                href="/pricing"
                className="transition hover:text-yellow-400"
              >
                Pricing
              </Link>

              <Link href="/faq" className="transition hover:text-yellow-400">
                FAQ
              </Link>

              <Link href="/hoa" className="transition hover:text-yellow-400">
                HOA
              </Link>

              <Link
                href="/contact"
                className="transition hover:text-yellow-400"
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}