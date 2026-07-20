"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const {
    items,
    subtotal,
    removeItem,
  } = useCart();

  return (
    <main className="mx-auto max-w-5xl p-8">

      <h1 className="mb-8 text-4xl font-bold">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="space-y-6">

          <p>Your shopping cart is empty.</p>

          <Link
            href="/pricing"
            className="rounded bg-blue-600 px-5 py-3 text-white"
          >
            Browse Properties
          </Link>

        </div>
      ) : (
        <>
          <div className="space-y-6">

            {items.map((item) => (

              <div
                key={item.id}
                className="rounded-xl border border-white/20 p-6"
              >
                <h2 className="text-xl font-semibold">
                  {item.propertyType}
                </h2>

                <p>{item.lunarState}</p>

                <p>{item.deedName}</p>

                <p>
                  ${item.unitPrice.toFixed(2)}
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-4 rounded bg-red-600 px-4 py-2 text-white"
                >
                  Remove
                </button>

              </div>

            ))}

          </div>

          <div className="mt-10 rounded-xl border border-white/20 p-6">

            <h2 className="text-2xl font-bold">

              Total: ${subtotal.toFixed(2)}

            </h2>

            <button
              className="mt-6 rounded bg-green-600 px-6 py-3 text-white"
            >
              Proceed to Checkout
            </button>

          </div>
        </>
      )}

    </main>
  );
}