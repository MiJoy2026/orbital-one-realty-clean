import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Charter HOA Membership for Moon Property Owners | Orbital One",
  description:
    "Learn about the complimentary Orbital One Charter HOA membership included with qualifying novelty lunar property purchases, including updates and future member benefits.",
  path: "/hoa",
});

export default function HOAPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Orbital One HOA
        </h1>

        <p className="mt-6 text-center text-xl leading-8 text-gray-300">
          Every qualifying property purchase includes complimentary 2026
          Charter membership in the Orbital One novelty customer community. It
          is not a legally recognized homeowners association and does not govern
          legal real estate.
        </p>

        <div className="mt-12 rounded-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-yellow-400">
            Membership Benefits
          </h2>

          <ul className="mt-6 space-y-3">
            <li>✓ 2026 Charter HOA Member Recognition</li>
            <li>✓ Community News & Updates</li>
            <li>✓ Future Product and LunaScape Updates</li>
            <li>✓ Eligibility for Special Promotions</li>
            <li>✓ Priority Access to Future Member Experiences</li>
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-yellow-400">
            HOA Mission
          </h2>

          <p className="mt-4 text-gray-300">
            The Orbital One HOA connects novelty lunar property owners through
            newsletters, member recognition, product updates, possible future
            discounts, and early or priority access to evolving LunaSphere and
            LunaScape experiences.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-yellow-400">
            Membership Cost
          </h2>

          <p className="mt-4 text-2xl font-bold">
            Included FREE with every paid property purchase.
          </p>
        </div>
      </div>
    </main>
  );
}