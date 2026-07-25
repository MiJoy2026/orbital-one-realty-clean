"use client";

import { useState } from "react";

import type { CartItem } from "@/context/CartContext";

export default function QuickPickCheckoutButton({
  item,
}: {
  item: CartItem;
}) {
  const [noveltyAcknowledged, setNoveltyAcknowledged] = useState(false);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function openCheckout() {
    if (!item.reservationId) {
      setErrorMessage(
        "This cart item does not have an active property reservation. Please remove it and use Quick Pick again."
      );
      return;
    }

    if (!noveltyAcknowledged) {
      setErrorMessage(
        "Please confirm that this is a novelty commemorative product."
      );
      return;
    }

    try {
      setIsOpeningCheckout(true);
      setErrorMessage("");

      const primaryName = item.ownerName || item.deedName || "";
      const additionalDeedNames = item.additionalOwner
        ? [item.additionalOwner]
        : [];
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: item.propertyId,
          propertyIds: [item.propertyId],
          reservationId: item.reservationId,
          reservationIds: [item.reservationId],
          deedName: primaryName,
          additionalDeedNames,
          acres: item.acres || 1,
          passportSelected: item.passportSelected,
          isGift: item.isGift,
          recipientEmail: item.recipientEmail || "",
          giftMessage: item.giftMessage || "",
          noveltyAcknowledged: true,
        }),
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        setErrorMessage(
          data.error || "Unable to open secure checkout. Please try again."
        );
        return;
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error("Unable to open Quick Pick checkout:", error);
      setErrorMessage(
        "Unable to connect to secure checkout. Please try again."
      );
    } finally {
      setIsOpeningCheckout(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-yellow-300/25 bg-yellow-300/[0.06] p-4">
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-200">
        <input
          type="checkbox"
          checked={noveltyAcknowledged}
          onChange={(event) =>
            setNoveltyAcknowledged(event.target.checked)
          }
          className="mt-1 h-4 w-4 accent-yellow-400"
        />
        <span>
          I understand this is a novelty commemorative product and does not
          convey legal ownership of lunar real estate.
        </span>
      </label>

      {errorMessage && (
        <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={openCheckout}
        disabled={isOpeningCheckout}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isOpeningCheckout
          ? "Opening Secure Checkout…"
          : "Checkout This Reserved Property"}
      </button>
    </div>
  );
}
