export default function PassportsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <section>
          <h1 className="text-5xl font-black uppercase">
            Novelty Lunar Passports
          </h1>

          <p className="mt-6 text-xl text-gray-300">
            Complete your Orbital One experience with a fun commemorative Lunar
            Passport.
          </p>

          <p className="mt-8 text-6xl font-black text-yellow-400">$4.99</p>

          <p className="mt-4 text-gray-300">
            Each passport is a novelty keepsake and is not government-issued
            identification or a travel document.
          </p>
        </section>

        <section className="rounded-3xl border border-yellow-400 p-8">
          <div className="rounded-2xl bg-yellow-400 p-8 text-black">
            <p className="text-sm font-bold uppercase tracking-[0.35em]">
              Orbital One Realty
            </p>

            <h2 className="mt-10 text-4xl font-black uppercase">
              Lunar Passport
            </h2>

            <p className="mt-8 font-semibold">
              Holder Name: ____________________
            </p>

            <p className="mt-4 font-semibold">
              Passport No: OOR-2026-0001
            </p>

            <p className="mt-10 text-sm">
              Novelty commemorative item only. Not valid for travel,
              identification, citizenship, or legal purposes.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}