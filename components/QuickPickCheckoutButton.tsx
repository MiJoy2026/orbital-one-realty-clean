"use client";

import Link from "next/link";
import { useState } from "react";

import { calculateCartItemTotal, type CartItem } from "@/context/CartContext";
import { LEGAL_POLICY_VERSION } from "@/lib/legal-config";
import { sendAnalyticsEvent } from "@/lib/analytics";

export default function QuickPickCheckoutButton({
  item,
}: {
  item: CartItem;
}) {
  const [noveltyAcknowledged, setNoveltyAcknowledged] = useState(false);
  const [legalAcknowledged, setLegalAcknowledged] = useState(false);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const checkoutTotal = calculateCartItemTotal(item);

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

    if (!legalAcknowledged) {
      setErrorMessage(
        "Please review and accept the legal policies and digital-delivery acknowledgment."
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
          passportSelected: item.passportSelected,
          isGift: item.isGift,
          recipientEmail: item.recipientEmail || "",
          giftMessage: item.giftMessage || "",
          noveltyAcknowledged,
          legalAcknowledged,
          legalPolicyVersion: LEGAL_POLICY_VERSION,
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

      sendAnalyticsEvent("begin_checkout", {
        currency: "USD",
        value: Number(checkoutTotal.toFixed(2)),
        items: [
          {
            item_id: item.propertyType
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
            item_name: item.category || item.propertyType,
            item_category: item.propertyType,
            price: Number(checkoutTotal.toFixed(2)),
            quantity: 1,
          },
        ],
      });

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
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-yellow-300/15 pb-4">
        <span className="text-sm font-bold text-slate-300">
          Secure checkout total
        </span>
        <span className="text-xl font-black text-yellow-300">
          ${checkoutTotal.toFixed(2)}
        </span>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-xl border border-yellow-300/25 bg-black/20 p-4 text-sm leading-6 text-slate-200">
          <input
            type="checkbox"
            checked={noveltyAcknowledged}
            onChange={(event) =>
              setNoveltyAcknowledged(event.target.checked)
            }
            className="mt-1 h-4 w-4 shrink-0 accent-yellow-400"
          />
          <span>
            I understand this is a novelty commemorative product and does not
            convey legal ownership of lunar real estate.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-white/15 bg-black/20 p-4 text-sm leading-6 text-slate-200">
          <input
            type="checkbox"
            checked={legalAcknowledged}
            onChange={(event) => setLegalAcknowledged(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-yellow-400"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-black text-yellow-300 underline"
            >
              Terms and Conditions
            </Link>
            ,{" "}
            <Link
              href="/refunds"
              target="_blank"
              className="font-black text-yellow-300 underline"
            >
              Refund and Cancellation Policy
            </Link>
            , and{" "}
            <Link
              href="/shipping-delivery"
              target="_blank"
              className="font-black text-yellow-300 underline"
            >
              Digital Delivery Policy
            </Link>
            . I acknowledge the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-black text-yellow-300 underline"
            >
              Privacy Policy
            </Link>
            ,{" "}
            <Link
              href="/cookies"
              target="_blank"
              className="font-black text-yellow-300 underline"
            >
              Cookie Policy
            </Link>
            ,{" "}
            <Link
              href="/accessibility"
              target="_blank"
              className="font-black text-yellow-300 underline"
            >
              Accessibility Statement
            </Link>
            , and{" "}
            <Link
              href="/legal-notice"
              target="_blank"
              className="font-black text-yellow-300 underline"
            >
              Legal Notice
            </Link>
            . I request immediate processing and electronic delivery of my
            personalized digital order. Where applicable, I consent to
            performance beginning immediately and acknowledge that I may lose a
            right of withdrawal once performance or delivery begins. Mandatory
            consumer rights remain unaffected.
          </span>
        </label>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Policy version {LEGAL_POLICY_VERSION}. Your acceptance time and policy
        version are recorded with the order.
      </p>

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
