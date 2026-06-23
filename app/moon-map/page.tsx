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
    <main
      className="min-h-screen px-6 py-20 text-white"
      style={{
        backgroundImage: "url('/backgrounds/account-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-7xl rounded-3xl bg-black/75 p-8 backdrop-blur-sm">
        <p className="text-center text-sm font-black uppercase tracking-[0.4em] text-yellow-400">
          Orbital One Lunar Atlas
        </p>

        <h1 className="mt-4 text-center text-5xl font-black uppercase text-yellow-400 md:text-7xl">
          Explore the Moon
        </h1>

        <p className="mx-auto mt-6 max-w-4xl text-center text-lg text-gray-300">
          Browse the Orbital One lunar atlas, divided into 57 novelty lunar
          states. Select a state to view cities, towns, rural acreage, and
          available property opportunities.
        </p>
        <form
           action="/atlas-search"
           className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-yellow-400/30 bg-black/60 p-4 md:flex-row"
        >
        <input
           name="q"
           className="flex-1 rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
           placeholder="Search state, city, town, or property ID..."
           required
        />

        <button
           type="submit"
           className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
        >
            Search Atlas
        </button>
        </form>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-yellow-400 bg-white/5 p-6 text-center">
            <p className="text-4xl font-black text-yellow-400">57</p>
            <p className="mt-2 text-sm uppercase text-gray-400">
              Lunar States
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-center">
            <p className="text-4xl font-black">171</p>
            <p className="mt-2 text-sm uppercase text-gray-400">
              Cities
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-center">
            <p className="text-4xl font-black">1,140</p>
            <p className="mt-2 text-sm uppercase text-gray-400">
              Towns
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-center">
            <p className="text-4xl font-black">2.85M</p>
            <p className="mt-2 text-sm uppercase text-gray-400">
              Rural Acres
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-yellow-400/30 bg-black/60 p-4">
          <LunarLeafletMap />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h2 className="text-xl font-black text-yellow-400">
              Step 1: Select a State
            </h2>
            <p className="mt-3 text-gray-300">
              Click a highlighted lunar state region on the atlas to begin
              exploring its property areas.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h2 className="text-xl font-black text-yellow-400">
              Step 2: Browse Cities & Towns
            </h2>
            <p className="mt-3 text-gray-300">
              Each state includes 3 city regions, 20 town regions, and rural
              acreage inventory.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h2 className="text-xl font-black text-yellow-400">
              Step 3: Choose Your Property
            </h2>
            <p className="mt-3 text-gray-300">
              Select rural acreage, a town block, or a city block and receive
              your personalized Orbital One property package.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6 text-center">
          <p className="font-bold text-yellow-400">
            Phase 1 Atlas Active
          </p>
          <p className="mt-2 text-gray-300">
            57 clickable lunar state zones are live. Future upgrades will add
            deeper zoom, parcel overlays, acreage highlighting, and direct
            property selection.
          </p>
        </div>
      </div>
    </main>
  );
}