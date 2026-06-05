export default function CartPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-black uppercase">
          Shopping Cart
        </h1>

        <p className="mt-4 text-xl text-gray-300">
          Review your novelty lunar property purchase before checkout.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <section className="rounded-3xl border border-white/20 p-8 md:col-span-2">
            <h2 className="text-3xl font-black text-yellow-400">
              Cart Items
            </h2>

            <div className="mt-6 rounded-2xl border border-white/20 p-6">
              <p className="text-2xl font-bold">Sample Property</p>
              <p className="mt-2 text-gray-300">
                Property selection will appear here.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold">
                Add Names to Deed
              </h3>

              <p className="mt-2 text-gray-300">
                $1.99 per name
              </p>

              <input
                className="mt-4 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
                placeholder="Enter name for deed"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold">
                Novelty Lunar Passport
              </h3>

              <p className="mt-2 text-gray-300">
                $4.99 each
              </p>

              <button className="mt-4 rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">
                Add Passport
              </button>
            </div>
          </section>

          <aside className="rounded-3xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-black">
              Order Summary
            </h2>

            <div className="mt-6 space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Property</span>
                <span>$0.00</span>
              </div>

              <div className="flex justify-between">
                <span>Deed Names</span>
                <span>$0.00</span>
              </div>

              <div className="flex justify-between">
                <span>Passports</span>
                <span>$0.00</span>
              </div>

              <div className="border-t border-white/20 pt-4 text-xl font-black text-white">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>$0.00</span>
                </div>
              </div>
            </div>

            <button className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black text-black">
              Checkout
            </button>

            <p className="mt-4 text-xs text-gray-400">
              Orbital One Realty sells novelty products only. No legal ownership
              of lunar real estate is conveyed.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}