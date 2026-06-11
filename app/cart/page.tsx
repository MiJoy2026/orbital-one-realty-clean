import StripeCheckoutButton from "../../components/StripeCheckoutButton";
import { sampleProperties } from "../../lib/moon-data";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string; acres?: string }>;
}) {
  const params = await searchParams;
  const acres = Number(params.acres || "1");
  const property = sampleProperties.find(
    (item) => item.id === params.propertyId
  );

  const propertyPrice =
  property?.type === "Rural Acre"
    ? acres === 0.5
      ? 16.95
      : 24.95 + Math.max(acres - 1, 0) * 7.95
    : property
      ? property.price
      : 0;
  const deedNamePrice = 1.99;
  const passportPrice = 4.99;
  const total = propertyPrice + deedNamePrice + passportPrice;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-black uppercase">Shopping Cart</h1>

        <p className="mt-4 text-xl text-gray-300">
          Review your novelty lunar property purchase before checkout.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <section className="rounded-3xl border border-white/20 p-8 md:col-span-2">
            <h2 className="text-3xl font-black text-yellow-400">
              Cart Items
            </h2>

            {property ? (
              <div className="mt-6 rounded-2xl border border-white/20 p-6">
                <p className="text-2xl font-bold">{property.id}</p>

                <p className="mt-2 text-gray-300">
                  {property.type} • {property.state} •{" "}
                  {property.type === "Rural Acre" ? `${acres} Acre${acres === 1 ? "" : "s"}` : property.size}
                </p>

                <p className="mt-4 text-3xl font-black text-yellow-400">
                  ${property.price.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/20 p-6">
                <p className="text-2xl font-bold">Your cart is empty</p>

                <p className="mt-2 text-gray-300">
                  Choose a property from the Explore page.
                </p>

                <a
                  href="/explore"
                  className="mt-6 inline-block rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
                >
                  Browse Properties
                </a>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold">Add Names to Deed</h3>

              <p className="mt-2 text-gray-300">$1.99 per name</p>

              <input
                className="mt-4 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
                placeholder="Enter name for deed"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold">Novelty Lunar Passport</h3>

              <p className="mt-2 text-gray-300">$4.99 each</p>

              <button className="mt-4 rounded-xl bg-yellow-400 px-5 py-3 font-black text-black">
                Add Passport
              </button>
            </div>
          </section>

          <aside className="rounded-3xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-black">Order Summary</h2>

            <div className="mt-6 space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Property</span>
                <span>${propertyPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Deed Name</span>
                <span>${deedNamePrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Passport</span>
                <span>${passportPrice.toFixed(2)}</span>
              </div>

              <div className="border-t border-white/20 pt-4 text-xl font-black text-white">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {property ? (
            <StripeCheckoutButton propertyId={property.id} acres={acres} />
            ) : (
               <button
               disabled
               className="mt-8 w-full rounded-xl bg-gray-700 px-6 py-4 font-black text-gray-400"
            >
              Checkout
             </button>
            )}

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