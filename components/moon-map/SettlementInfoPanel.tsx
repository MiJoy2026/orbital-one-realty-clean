"use client";

import Link from "next/link";

import type { PublicLunaSphereSettlement } from "@/lib/lunasphere-public-geography";

export default function SettlementInfoPanel({
  settlement,
}: {
  settlement: PublicLunaSphereSettlement;
}) {
  const isCity = settlement.kind === "city";
  const detailHref = isCity
    ? `/cities/${encodeURIComponent(settlement.name)}`
    : `/towns/${encodeURIComponent(settlement.name)}`;

  return (
    <aside className="rounded-3xl border border-white/15 bg-black/75 p-6 shadow-2xl backdrop-blur">
      <p
        className={`text-xs font-black uppercase tracking-[0.28em] ${
          isCity ? "text-cyan-300" : "text-amber-300"
        }`}
      >
        {isCity ? "Lunar City Territory" : "Lunar Town Territory"}
      </p>

      <h2 className="mt-3 text-3xl font-black text-white">
        {settlement.name}
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        {settlement.stateName} · Territory {settlement.territoryNumber}
      </p>

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-400">Classification</span>
          <span className="font-bold text-white">
            {isCity ? "City" : "Town"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-400">Parent State</span>
          <span className="text-right font-bold text-white">
            {settlement.stateName}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-400">LunaSphere ID</span>
          <span className="text-right font-mono text-xs text-gray-300">
            {settlement.id}
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-gray-300">
        {isCity
          ? "This approved city territory now contains multiple individually saleable City Blocks. Zoom in to view the block grid."
          : "This approved town territory now contains multiple individually saleable Town Blocks. Zoom in to view the block grid."}
      </p>

      <div
        className={`mt-5 rounded-2xl p-4 text-sm ${
          isCity
            ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
            : "border border-amber-400/30 bg-amber-400/10 text-amber-100"
        }`}
      >
        <p className="font-black">
          {isCity ? "City Blocks · $54.95 each" : "Town Blocks · $39.95 each"}
        </p>
        <p className="mt-2 opacity-80">
          Preview blocks appear as you zoom in. Individual blocks become selectable at zoom level 7.
        </p>
      </div>

      <Link
        href={detailHref}
        className={`mt-6 block rounded-xl px-4 py-3 text-center font-black text-black transition hover:brightness-110 ${
          isCity ? "bg-cyan-300" : "bg-amber-300"
        }`}
      >
        View {isCity ? "City" : "Town"}
      </Link>
    </aside>
  );
}
