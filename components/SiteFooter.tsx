import Link from "next/link";

import { LEGAL_ENTITY, LEGAL_LINKS } from "@/lib/legal-config";
import CookiePreferences from "./CookiePreferences";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#010208] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-lg font-black text-yellow-300">Orbital One Realty™</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Orbital One Realty products are novelty and entertainment products
            and do not convey legally recognized ownership of land or real estate
            on the Moon. Orbital One Realty is not affiliated with or endorsed by
            NASA or any government or space agency.
          </p>
          <p className="mt-5 text-xs leading-6 text-slate-500">
            © 2026 {LEGAL_ENTITY.legalName}. All rights reserved. Orbital One
            Realty™, LunaSphere™, and LunaScape™ are trademarks claimed by
            {` ${LEGAL_ENTITY.legalName}`}.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:justify-self-end">
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
      </div>
    </footer>
  );
}
