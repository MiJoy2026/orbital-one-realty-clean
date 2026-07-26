import Link from "next/link";

import { LEGAL_ENTITY, LEGAL_LINKS } from "@/lib/legal-config";
import CookiePreferences from "./CookiePreferences";

const exploreLinks = [
  { href: "/explore", label: "Explore the Moon" },
  { href: "/moon-map", label: "Interactive Moon Map" },
  { href: "/states", label: "Lunar States" },
  { href: "/pricing", label: "Property Pricing" },
  { href: "/faq", label: "Moon Property FAQ" },
  { href: "/hoa", label: "Charter HOA" },
  { href: "/passports", label: "Lunar Passports" },
  { href: "/verify", label: "Verify Certificate" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#010208] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Link
            href="/"
            className="text-lg font-black text-yellow-300 transition hover:text-yellow-200"
          >
            Orbital One Realty™
          </Link>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Explore novelty Moon property gifts through LunaSphere™, including
            rural lunar acreage, named town blocks, premium city blocks,
            personalized digital deeds, LunaScape™ imagery, and complimentary
            Charter HOA membership.
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-6 text-slate-500">
            Orbital One Realty products are novelty and entertainment products
            and do not convey legally recognized ownership of land or real
            estate on the Moon. Orbital One Realty is not affiliated with or
            endorsed by NASA or any government or space agency.
          </p>
          <p className="mt-5 text-xs leading-6 text-slate-500">
            © 2026 {LEGAL_ENTITY.legalName}. All rights reserved. Orbital One
            Realty™, LunaSphere™, and LunaScape™ are trademarks claimed by
            {` ${LEGAL_ENTITY.legalName}`}.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:justify-self-end">
          <nav aria-label="Explore Orbital One Realty">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Explore
            </p>
            <div className="mt-4 grid gap-3">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-400 transition hover:text-yellow-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="Orbital One Realty legal policies">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
              Legal & Privacy
            </p>
            <div className="mt-4 grid gap-3">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-400 transition hover:text-yellow-300"
                >
                  {link.label}
                </Link>
              ))}
              <CookiePreferences />
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
