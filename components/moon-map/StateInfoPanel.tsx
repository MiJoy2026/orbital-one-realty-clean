"use client";

import { lunarStateDetails } from "@/lib/lunar-state-details";

type StateSummary = {
  name: string;
  cities: string[];
  towns: string[];
};

export default function StateInfoPanel({
  selectedState,
  stateSummary,
}: {
  selectedState: string | null;
  stateSummary: StateSummary | null;
}) {
  if (!selectedState || !stateSummary) {
    return (
      <div className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
          State Information
        </p>

        <p className="mt-6 text-gray-400">
          Select a lunar state to view its cities, towns, highlights, and
          available property types.
        </p>
      </div>
    );
  }

  const details = lunarStateDetails[selectedState];

  return (
    <div className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
        Orbital One Lunar State
      </p>

      <h2 className="mt-4 text-4xl font-black text-yellow-400">
        {selectedState}
      </h2>

      {details?.nickname && (
        <p className="mt-2 text-lg font-bold text-white">
          {details.nickname}
        </p>
      )}

      <p className="mt-6 leading-7 text-gray-300">
        {details?.description ||
          `${selectedState} is part of the official Orbital One Realty lunar atlas.`}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-3xl font-black text-yellow-400">
            {stateSummary.cities.length}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
            Cities
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-3xl font-black text-yellow-400">
            {stateSummary.towns.length}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
            Towns
          </p>
        </div>
      </div>

      {details?.highlights && details.highlights.length > 0 && (
        <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
            State Highlights
          </p>

          <div className="mt-4 space-y-2">
            {details.highlights.map((highlight) => (
              <p
                key={highlight}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                ⭐ {highlight}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
          Property Opportunities
        </p>

        <div className="mt-4 space-y-2 text-sm text-gray-300">
          <p>🌕 Rural Acreage</p>
          <p>🏙 City Blocks</p>
          <p>🏘 Town Blocks</p>
          <p>🏛 Complimentary HOA Membership</p>
        </div>
      </div>

      <a
        href={`/states/${encodeURIComponent(selectedState)}`}
        className="mt-6 block rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black"
      >
        Explore {selectedState}
      </a>
    </div>
  );
}