import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          LunaSphere Navigation
        </p>
        <h1 className="mt-5 text-5xl font-black uppercase sm:text-6xl">
          Location Not Found
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          This page is not part of the current Orbital One Realty website or
          LunaSphere directory. Continue exploring from one of the verified
          destinations below.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/explore"
            className="rounded-xl bg-yellow-400 px-7 py-4 font-black text-black"
          >
            Explore the Moon
          </Link>
          <Link
            href="/states"
            className="rounded-xl border border-white/20 px-7 py-4 font-black text-white"
          >
            Browse Lunar States
          </Link>
        </div>
      </div>
    </main>
  );
}
