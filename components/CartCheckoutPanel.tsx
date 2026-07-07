"use client";

import { useState } from "react";
import StripeCheckoutButton from "./StripeCheckoutButton";

export default function CartCheckoutPanel({
  propertyId,
  acres,
  propertyPrice,
  reservationId,
}: {
  propertyId: string;
  acres?: number;
  propertyPrice: number;
  reservationId?: string;
}) {
  const [passportSelected, setPassportSelected] = useState(false);

  const passportPrice = passportSelected ? 4.99 : 0;
  const total = propertyPrice + passportPrice;

  return (
    <>
      <div className="mt-6 space-y-3 text-gray-300">
        <div className="flex justify-between">
          <span>Property</span>
          <span>${propertyPrice.toFixed(2)}</span>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-white/20 bg-white/5 p-4">
          <span>
            <span className="block font-bold text-white">
              Novelty Lunar Passport
            </span>
            <span className="text-sm text-gray-400">Optional add-on</span>
          </span>

          <span className="flex items-center gap-3">
            <span>$4.99</span>
            <input
              type="checkbox"
              checked={passportSelected}
              onChange={() => setPassportSelected(!passportSelected)}
            />
          </span>
        </label>

        <div className="border-t border-white/20 pt-4 text-xl font-black text-white">
          <div className="flex justify-between">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <StripeCheckoutButton
        propertyId={propertyId}
        acres={acres}
        passportSelected={passportSelected}
        reservationId={reservationId}
      />
    </>
  );
}