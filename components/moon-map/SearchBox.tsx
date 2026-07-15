"use client";

import { useMemo, useState } from "react";
import {
  searchAtlas,
  type AtlasSearchResult,
} from "@/lib/search-index";

export default function SearchBox({
  onSelectResult,
}: {
  onSelectResult: (result: AtlasSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    return searchAtlas(query);
  }, [query]);

  function selectResult(result: AtlasSearchResult) {
    setQuery(result.name);
    setIsOpen(false);
    onSelectResult(result);
  }

  return (
    <div className="relative z-[1200] w-full max-w-xl">
      <div className="rounded-2xl border border-yellow-400/40 bg-black/90 p-2 shadow-2xl backdrop-blur">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search attractions, states, cities, towns, or parcels..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/15 bg-black/95 shadow-2xl backdrop-blur">
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto p-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => selectResult(result)}
                  className="block w-full rounded-xl px-4 py-3 text-left transition hover:bg-yellow-400/10"
                >
                  <p className="font-black text-white">{result.name}</p>

                  <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                    {result.subtitle}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-gray-400">
              No atlas matches found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}