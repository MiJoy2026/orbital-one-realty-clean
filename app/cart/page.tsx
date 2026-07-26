"use client";

import Link from "next/link";

import QuickPickCheckoutButton from "@/components/QuickPickCheckoutButton";
import { useCart } from "@/context/CartContext";
import { sendAnalyticsEvent } from "@/lib/analytics";

function formatLocation(input: {
  lunarState?: string;
  lunarCity?: string;
  lunarTown?: string;
}) {
  return [input.lunarCity, input.lunarTown, input.lunarState]
    .filter(Boolean)
    .join(" • ");
}

export default function CartPage() {
  const { items, subtotal, removeItem, getItemTotal } = useCart();

  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
          Orbital One Mission Cart
        </p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          Your Reserved Properties
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
          Quick Pick properties are real available Grid V2 parcels held for a
          limited time. Each property keeps its own permanent ID and location.
        </p>

        {items.length === 0 ? (
          <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.035] p-10 text-center">
            <h2 className="text-3xl font-black text-yellow-300">
              Your cart is ready for a mission.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
              Use Quick Pick for the fastest assignment, or explore LunaSphere
              to choose an exact location yourself.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
              >
                Use Quick Pick
              </Link>
              <Link
                href="/moon-map"
                className="rounded-xl border border-white/20 px-6 py-3 font-black"
              >
                Explore LunaSphere
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <section className="space-y-6">
              {items.map((item) => {
                const location = formatLocation(item);

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/25"
                  >
                    <div className="grid gap-0 md:grid-cols-[13rem_1fr]">
                      <div
                        className="min-h-48 bg-cover bg-center"
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(2,4,10,.72), rgba(2,4,10,.08)), url('${
                            item.image || "/property-images/rural-acre.jpg"
                          }')`,
                        }}
                      />
                      <div className="p-6 sm:p-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                              {item.propertyType}
                            </p>
                            <h2 className="mt-2 break-all text-2xl font-black">
                              {item.propertyId}
                            </h2>
                            <p className="mt-2 text-sm text-slate-400">
                              {location || "LunaSphere property"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Item total
                            </p>
                            <p className="mt-1 text-2xl font-black text-yellow-300">
                              ${getItemTotal(item).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                          <p className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                              Deed owner
                            </span>
                            <span className="mt-1 block font-semibold">
                              {item.ownerName || item.deedName}
                            </span>
                          </p>
                          <p className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                              Reservation
                            </span>
                            <span className="mt-1 block font-semibold text-emerald-300">
                              Active and secured
                            </span>
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href={`/moon-map?property=${encodeURIComponent(
                              item.propertyId
                            )}`}
                            className="rounded-xl border border-yellow-300/35 px-4 py-2 text-sm font-black text-yellow-200"
                          >
                            View on Moon Map
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              const itemValue = getItemTotal(item);

                              sendAnalyticsEvent("remove_from_cart", {
                                currency: "USD",
                                value: Number(itemValue.toFixed(2)),
                                items: [
                                  {
                                    item_id: item.propertyType
                                      .toLowerCase()
                                      .replace(/[^a-z0-9]+/g, "-")
                                      .replace(/^-|-$/g, ""),
                                    item_name:
                                      item.category || item.propertyType,
                                    item_category: item.propertyType,
                                    price: Number(itemValue.toFixed(2)),
                                    quantity: 1,
                                  },
                                ],
                              });

                              removeItem(item.id);
                            }}
                            className="rounded-xl border border-red-400/25 px-4 py-2 text-sm font-black text-red-200"
                          >
                            Release & Remove
                          </button>
                        </div>

                        <QuickPickCheckoutButton item={item} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="h-fit rounded-[2rem] border border-yellow-300/25 bg-yellow-300/[0.055] p-7 lg:sticky lg:top-36">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
                Mission Summary
              </p>
              <div className="mt-5 flex items-center justify-between border-b border-white/10 pb-5">
                <span className="text-slate-400">Reserved properties</span>
                <span className="text-2xl font-black">{items.length}</span>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-bold">Current subtotal</span>
                <span className="text-3xl font-black text-yellow-300">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="mt-5 text-xs leading-6 text-slate-500">
                Checkout is completed per reserved property so each deed,
                recipient, certificate, and LunaScape record remains precise.
              </p>
              <Link
                href="/pricing"
                className="mt-6 block rounded-xl border border-white/15 px-5 py-3 text-center font-black"
              >
                Add Another Quick Pick
              </Link>
              <Link
                href="/moon-map"
                className="mt-3 block rounded-xl border border-white/15 px-5 py-3 text-center font-black"
              >
                Choose on LunaSphere
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
