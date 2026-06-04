export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 rounded-full border border-yellow-400 px-6 py-2 text-sm uppercase tracking-[0.35em] text-yellow-400">
          Orbital One Realty
        </div>

        <h1 className="max-w-5xl text-5xl font-black uppercase leading-tight md:text-7xl">
          Own a Piece of the Moon
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-300 md:text-xl">
          It&apos;s fun. It&apos;s unique. It&apos;s out of this world!
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#pricing"
            className="rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black"
          >
            View Pricing
          </a>

          <a
            href="#included"
            className="rounded-xl border border-yellow-400 px-8 py-4 font-bold text-yellow-400"
          >
            What&apos;s Included
          </a>
        </div>
      </section>

      <section id="pricing" className="px-6 py-20">
        <h2 className="text-center text-4xl font-black uppercase">
          Lunar Property Pricing
        </h2>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/20 p-6">
            <h3 className="text-2xl font-bold text-yellow-400">Rural Acres</h3>
            <p className="mt-4">1/2 Acre — $16.95</p>
            <p>1 Acre — $24.95</p>
            <p>Additional Acres — $7.95 each</p>
          </div>

          <div className="rounded-2xl border border-white/20 p-6">
            <h3 className="text-2xl font-bold text-yellow-400">Town Blocks</h3>
            <p className="mt-4 text-3xl font-black">$39.95</p>
            <p className="mt-2 text-gray-400">Each novelty town block</p>
          </div>

          <div className="rounded-2xl border border-white/20 p-6">
            <h3 className="text-2xl font-bold text-yellow-400">City Blocks</h3>
            <p className="mt-4 text-3xl font-black">$54.95</p>
            <p className="mt-2 text-gray-400">Each novelty city block</p>
          </div>
        </div>
      </section>

      <section id="included" className="bg-white px-6 py-20 text-black">
        <h2 className="text-center text-4xl font-black uppercase">
          Included With Your Purchase
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {[
            "Novelty Deed",
            "Picture of the Purchased Property",
            "Nearby Lunar Attractions",
            "Novelty Lunar Currency",
            "Free Orbital One HOA Membership",
            "Terms & Conditions",
            "Privacy Policy",
          ].map((item) => (
            <div key={item} className="rounded-xl border p-4 font-semibold">
              ✓ {item}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl font-black uppercase">Optional Add-Ons</h2>
        <p className="mt-6 text-xl">Add a name to your deed — $1.99 each</p>
        <p className="mt-2 text-xl">Novelty Lunar Passport — $4.99 each</p>
      </section>

      <footer className="border-t border-white/20 px-6 py-8 text-center text-sm text-gray-400">
        Orbital One Realty sells novelty and commemorative products only.
        Purchases do not convey legal ownership of lunar real estate.
      </footer>
    </main>
  );
}