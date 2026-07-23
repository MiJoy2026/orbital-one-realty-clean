"use client";

import Link from "next/link";

import type { PublicLunaSphereProtectedArea } from "@/lib/lunasphere-public-geography";

export default function ProtectedAreaInfoPanel({
  area,
}: {
  area: PublicLunaSphereProtectedArea;
}) {
  return (
    <aside className="rounded-3xl border border-rose-400/30 bg-black/75 p-6 shadow-2xl backdrop-blur lg:h-full lg:overflow-y-auto">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-rose-300">
        Protected LunaSphere Territory
      </p>

      <h2 className="mt-3 text-3xl font-black text-white">{area.name}</h2>
      <p className="mt-2 text-sm text-gray-400">{area.stateName}</p>

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-400">Classification</span>
          <span className="text-right font-bold text-rose-200">
            {area.category}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-400">Property Inventory</span>
          <span className="font-bold text-white">Not for sale</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-400">LunaSphere ID</span>
          <span className="text-right font-mono text-xs text-gray-300">
            {area.id}
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-gray-300">
        {area.description}
      </p>

      <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
        <p className="font-black">Protected from property sales</p>
        <p className="mt-2 opacity-80">
          Rural parcels, City Blocks, and Town Blocks that touch this boundary are automatically excluded from inventory.
        </p>
      </div>

      {area.attractionId && (
        <Link
          href={`/attractions/${area.attractionId}`}
          className="mt-6 block rounded-xl bg-rose-300 px-4 py-3 text-center font-black text-black transition hover:brightness-110"
        >
          View Related Lunar Attraction
        </Link>
      )}
    </aside>
  );
}
