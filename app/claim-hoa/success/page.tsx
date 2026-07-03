export default function ClaimHoaSuccessPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/30 bg-white/5 p-8 text-center">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          Orbital One HOA
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase text-yellow-400">
          Membership Activated
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-300">
          Congratulations. Your complimentary Orbital One HOA membership has
          been activated. You can now access your documents, view your lunar
          property, and receive future member updates.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a
            href="/account"
            className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
          >
            Go to Member Dashboard
          </a>

          <a
            href="/moon-map"
            className="rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400"
          >
            Explore Moon Atlas
          </a>
        </div>
      </div>
    </main>
  );
}