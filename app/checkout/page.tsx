import { sampleProperties } from "../../lib/moon-data";
import StripeCheckoutButton from "../../components/StripeCheckoutButton";
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const params = await searchParams;
  const property = sampleProperties.find(
    (item) => item.id === params.propertyId
  );

  const propertyPrice = property ? property.price : 0;
  const deedNamePrice = 1.99;
  const passportPrice = 4.99;
  const total = propertyPrice + deedNamePrice + passportPrice;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-black uppercase">Checkout</h1>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <section className="rounded-3xl border border-white/20 p-8 md:col-span-2">
            <h2 className="text-3xl font-black text-yellow-400">
              Customer Information
            </h2>

            <div className="mt-6 grid gap-4">
              <input className="rounded-xl bg-black border border-white/20 px-4 py-3" placeholder="Full Name" />
              <input className="rounded-xl bg-black border border-white/20 px-4 py-3" placeholder="Email Address" />
              <input className="rounded-xl bg-black border border-white/20 px-4 py-3" placeholder="Billing Address" />
              <input className="rounded-xl bg-black border border-white/20 px-4 py-3" placeholder="City" />
              <input className="rounded-xl bg-black border border-white/20 px-4 py-3" placeholder="State" />
              <input className="rounded-xl bg-black border border-white/20 px-4 py-3" placeholder="ZIP Code" />
            </div>

            <div className="mt-8 rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold">Novelty Product Confirmation</h3>
              <label className="mt-4 flex gap-3 text-gray-300">
                <input type="checkbox" />
                I understand this is a novelty commemorative product and does
                not convey legal ownership of lunar real estate.
              </label>
            </div>
          </section>

          <aside className="rounded-3xl border border-yellow-400 p-8">
            <h2 className="text-3xl font-black">Order Summary</h2>

            {property ? (
              <div className="mt-6 rounded-2xl border border-white/20 p-4">
                <p className="font-bold">{property.id}</p>
                <p className="text-gray-300">{property.type}</p>
              </div>
            ) : (
              <p className="mt-6 text-gray-300">No property selected.</p>
            )}

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
  <StripeCheckoutButton propertyId={property.id} />
) : (
  <button
    disabled
    className="mt-8 w-full rounded-xl bg-gray-700 px-6 py-4 font-black text-gray-400"
  >
    Continue to Payment
  </button>
)}
          </aside>
        </div>
      </div>
    </main>
  );
}