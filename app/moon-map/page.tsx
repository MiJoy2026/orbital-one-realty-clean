"use client";
import dynamic from "next/dynamic";

const LunarLeafletMap = dynamic(
  () => import("@/components/LunarLeafletMap"),
  {
    ssr: false,
  }
);

export default function MoonMapPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-5xl font-black uppercase text-yellow-400">
          Interactive Lunar Property Map
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg text-gray-300">
          Explore the lighted side of the Moon, divided into 57 Orbital One
          lunar states. Select a state to begin browsing available novelty
          lunar properties.
        </p>

        <LunarLeafletMap />

        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-white/20 bg-white/5 p-6 text-center">
          <p className="text-lg text-gray-300">
            Phase 1 map active: 57 clickable lunar state zones.
          </p>
        </div>
      </div>
    </main>
  );
}