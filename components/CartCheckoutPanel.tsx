"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CART_RESERVATION_COOKIE } from "../lib/cart-reservations";
import { PASSPORT_PRICE } from "../lib/purchase-constants";
import ReservationCountdown from "./moon-map/ReservationCountdown";
import StripeCheckoutButton from "./StripeCheckoutButton";

type CartItem = {
  reservationId: string;
  expiresAt: string;
  propertyId: string;
  propertyType: string;
  propertySize: string;
  stateName: string;
  cityName: string | null;
  townName: string | null;
  price: number;
};

export default function CartCheckoutPanel({
  items,
}: {
  items: CartItem[];
}) {
  const router = useRouter();
  const [passportSelected, setPassportSelected] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");
  const propertySubtotal = items.reduce((sum, item) => sum + item.price, 0);
  const passportTotal = passportSelected
    ? PASSPORT_PRICE * items.length
    : 0;
  const earliestExpiration = useMemo(
    () =>
      items
        .map((item) => new Date(item.expiresAt).getTime())
        .sort((first, second) => first - second)[0],
    [items]
  );

  useEffect(() => {
    document.cookie = `${CART_RESERVATION_COOKIE}=${items
      .map((item) => item.reservationId)
      .join(",")}; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`;
    window.dispatchEvent(new Event("orbital-cart-updated"));
  }, [items]);

  async function cancelReservation(reservationId: string) {
    if (cancellingId) {
      return;
    }

    try {
      setCancellingId(reservationId);
      setCancelError("");

      const response = await fetch("/api/release-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationId }),
      });
      const responseText = await response.text();
      let result: { error?: string } = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText) as typeof result;
        } catch {
          result = {};
        }
      }

      if (!response.ok) {
        setCancelError(
          result.error || "Unable to remove this property right now."
        );
        return;
      }

      window.dispatchEvent(new Event("orbital-cart-updated"));
      router.refresh();
    } catch (error) {
      console.error("Unable to cancel reservation:", error);
      setCancelError("Unable to remove this property right now.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <>
      <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
          Earliest Reservation Expires In
        </p>
        <ReservationCountdown
          expiresAt={new Date(earliestExpiration).toISOString()}
          onExpired={() => router.refresh()}
        />
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.reservationId}
            className="rounded-xl border border-white/15 bg-black/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-black text-white">
                  {item.propertyId}
                </p>
                <p className="text-xs text-gray-400">{item.propertyType}</p>
              </div>
              <p className="font-black">${item.price.toFixed(2)}</p>
            </div>
            <button
              type="button"
              disabled={Boolean(cancellingId)}
              onClick={() => cancelReservation(item.reservationId)}
              className="mt-3 text-sm font-bold text-red-400 hover:underline disabled:opacity-50"
            >
              {cancellingId === item.reservationId
                ? "Removing…"
                : "Remove from cart"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 text-gray-300">
        <div className="flex justify-between">
          <span>Properties ({items.length})</span>
          <span>${propertySubtotal.toFixed(2)}</span>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-white/20 bg-white/5 p-4">
          <span>
            <span className="block font-bold text-white">
              Novelty Lunar Passport for Each Property
            </span>
            <span className="text-sm text-gray-400">
              Optional · {items.length} × ${PASSPORT_PRICE.toFixed(2)}
            </span>
          </span>

          <span className="flex items-center gap-3">
            <span>${passportTotal.toFixed(2)}</span>
            <input
              type="checkbox"
              checked={passportSelected}
              onChange={() => setPassportSelected((current) => !current)}
            />
          </span>
        </label>

        <div className="border-t border-white/20 pt-4 text-xl font-black text-white">
          <div className="flex justify-between">
            <span>Current Total</span>
            <span>
              ${(propertySubtotal + passportTotal).toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-xs font-normal text-gray-500">
            Additional deed-name charges are applied to each property deed.
          </p>
        </div>
      </div>

      <StripeCheckoutButton
        propertyIds={items.map((item) => item.propertyId)}
        reservationIds={items.map((item) => item.reservationId)}
        propertyCount={items.length}
        passportSelected={passportSelected}
      />

      {cancelError && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm font-bold text-red-300">
          {cancelError}
        </p>
      )}
    </>
  );
}
