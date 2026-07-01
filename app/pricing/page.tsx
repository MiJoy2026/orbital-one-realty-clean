export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Pricing
        </h1>

        <p className="mt-6 text-center text-xl text-gray-300">
          Choose your own novelty property on the Moon.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-bold text-yellow-400">
              Rural Acreage
            </h2>

            <ul className="mt-6 space-y-3">
              <li>½ Acre — $16.95</li>
              <li>1 Acre — $24.95</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-bold text-yellow-400">
              Town Blocks
            </h2>

            <p className="mt-6 text-5xl font-black">$39.95</p>

            <p className="mt-3 text-gray-300">
              Located within one of 20 towns in each lunar state.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-bold text-yellow-400">
              City Blocks
            </h2>

            <p className="mt-6 text-5xl font-black">$54.95</p>

            <p className="mt-3 text-gray-300">
              Located within one of 3 cities in each lunar state.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold">
            Optional Add-Ons
          </h2>

          <ul className="mt-6 space-y-3">
            <li>Novelty Lunar Passport — $4.99 each</li>
          </ul>
        </div>
      </div>
    </main>
  );
}