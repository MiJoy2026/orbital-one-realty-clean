const states = [
  "Armstrong",
  "Aldrin",
  "Collins",
  "Tranquility",
  "Copernicus",
  "Tycho",
];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Explore the Moon
        </h1>

        <p className="mt-6 text-center text-xl text-gray-300">
          Browse available novelty lunar properties throughout Orbital One
          Realty's 57 lunar states.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-black text-yellow-400">
              Rural Acreage
            </h2>

            <p className="mt-4 text-4xl font-black">$24.95</p>

            <p className="mt-4 text-gray-300">
              Choose novelty acreage in undeveloped lunar territory.
            </p>

            <button className="mt-8 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black">
              Browse Rural Properties
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-black text-yellow-400">
              Town Blocks
            </h2>

            <p className="mt-4 text-4xl font-black">$39.95</p>

            <p className="mt-4 text-gray-300">
              Located in one of 1,140 lunar towns.
            </p>

            <button className="mt-8 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black">
              Browse Towns
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-black text-yellow-400">
              City Blocks
            </h2>

            <p className="mt-4 text-4xl font-black">$54.95</p>

            <p className="mt-4 text-gray-300">
              Premium locations in one of 171 lunar cities.
            </p>

            <button className="mt-8 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black">
              Browse Cities
            </button>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-4xl font-black uppercase">
            Featured Lunar States
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {states.map((state) => (
              <div
                key={state}
                className="rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-2xl font-bold text-yellow-400">
                  {state}
                </h3>

                <p className="mt-3 text-gray-300">
                  3 Cities • 20 Towns • Rural Acreage Available
                </p>

                <div className="mt-4">
                  <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold">
                    Properties Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-white/20 p-8">
          <h2 className="text-3xl font-black">
            Coming Soon
          </h2>

          <ul className="mt-6 space-y-3 text-gray-300">
            <li>✓ Interactive Moon Map</li>
            <li>✓ Available Property Search</li>
            <li>✓ Sold Property Tracking</li>
            <li>✓ State, City, and Town Selection</li>
            <li>✓ Instant Property Reservation</li>
          </ul>
        </section>
      </div>
    </main>
  );
}