"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { LEGAL_POLICY_VERSION } from "@/lib/legal-config";
import {
  sendAnalyticsEvent,
  sendMetaPixelEvent,
} from "@/lib/analytics";
import {
  ADDITIONAL_DEED_NAME_PRICE_CENTS,
  formatUsdFromCents,
  MAX_ADDITIONAL_DEED_NAMES,
  PASSPORT_PRICE_CENTS,
} from "../lib/purchase-constants";

export default function StripeCheckoutButton({
  propertyIds,
  passportSelected,
  reservationIds,
  propertyCount,
  propertySubtotalCents,
}: {
  propertyIds: string[];
  passportSelected?: boolean;
  reservationIds: string[];
  propertyCount: number;
  propertySubtotalCents: number;
}) {
  const [isGift, setIsGift] = useState(false);
  const [deedName, setDeedName] = useState("");
  const [additionalNamesText, setAdditionalNamesText] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [noveltyAcknowledged, setNoveltyAcknowledged] = useState(false);
  const [legalAcknowledged, setLegalAcknowledged] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const additionalDeedNames = useMemo(
    () =>
      Array.from(
        new Set(
          additionalNamesText
            .split(/\r?\n/)
            .map((name) => name.trim())
            .filter(Boolean)
        )
      ).slice(0, MAX_ADDITIONAL_DEED_NAMES),
    [additionalNamesText]
  );
  const additionalNameTotalCents =
    additionalDeedNames.length *
    ADDITIONAL_DEED_NAME_PRICE_CENTS *
    propertyCount;
  const passportTotalCents = passportSelected
    ? PASSPORT_PRICE_CENTS * propertyCount
    : 0;
  const checkoutTotalCents =
    propertySubtotalCents + passportTotalCents + additionalNameTotalCents;

  async function handleCheckout() {
    if (isStartingCheckout) {
      return;
    }

    if (!deedName.trim()) {
      setErrorMessage(
        isGift
          ? "Please enter the gift recipient name for the deeds."
          : "Please enter the primary name for the deeds."
      );
      return;
    }

    if (isGift && !recipientEmail.trim()) {
      setErrorMessage("Please enter the gift recipient email address.");
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
      setIsStartingCheckout(true);
      setErrorMessage("");

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyIds,
          reservationIds,
          deedName: deedName.trim(),
          additionalDeedNames,
          isGift,
          recipientEmail,
          giftMessage,
          passportSelected,
          noveltyAcknowledged,
          legalAcknowledged,
          legalPolicyVersion: LEGAL_POLICY_VERSION,
        }),
      });

      const responseText = await response.text();
      let data: { url?: string; error?: string } = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText) as typeof data;
        } catch {
          data = {};
        }
      }

      if (!response.ok || !data.url) {
        setErrorMessage(
          data.error || "Unable to start secure checkout. Please try again."
        );
        return;
      }

      const analyticsItems = [
        {
          item_id: "novelty-lunar-property",
          item_name: "Novelty Lunar Property",
          item_category: "Novelty lunar property",
          price:
            propertyCount > 0
              ? Number(
                  (
                    propertySubtotalCents /
                    100 /
                    propertyCount
                  ).toFixed(2)
                )
              : 0,
          quantity: propertyCount,
        },
      ];

      if (passportSelected) {
        analyticsItems.push({
          item_id: "novelty-lunar-passport",
          item_name: "Novelty Lunar Passport",
          item_category: "Optional purchase add-on",
          price: PASSPORT_PRICE_CENTS / 100,
          quantity: propertyCount,
        });
      }

      if (additionalDeedNames.length > 0) {
        analyticsItems.push({
          item_id: "additional-deed-name",
          item_name: "Additional Deed Name",
          item_category: "Personalization add-on",
          price: ADDITIONAL_DEED_NAME_PRICE_CENTS / 100,
          quantity:
            additionalDeedNames.length * propertyCount,
        });
      }

      sendAnalyticsEvent("begin_checkout", {
        currency: "USD",
        value: Number((checkoutTotalCents / 100).toFixed(2)),
        items: analyticsItems,
      });
      sendMetaPixelEvent("InitiateCheckout", {
        content_ids: propertyIds,
        content_name: "Novelty Lunar Property",
        content_category: "Novelty lunar property",
        content_type: "product",
        currency: "USD",
        value: Number((checkoutTotalCents / 100).toFixed(2)),
        num_items: propertyCount,
      });

      window.location.assign(data.url);
    } catch (error) {
      console.error("Unable to start checkout:", error);
      setErrorMessage(
        "Unable to connect to secure checkout. Please try again."
      );
    } finally {
      setIsStartingCheckout(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/20 bg-white/5 p-5">
      <label className="flex items-center gap-3 font-bold text-gray-300">
        <input
          type="checkbox"
          checked={isGift}
          onChange={() => setIsGift((current) => !current)}
        />
        This purchase is a gift
      </label>

      <label className="mt-5 block text-left text-sm font-bold text-gray-300">
        {isGift
          ? "Gift Recipient Name for All Deeds"
          : "Primary Name for All Deeds"}
      </label>

      <input
        value={deedName}
        onChange={(event) => setDeedName(event.target.value)}
        maxLength={120}
        className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
        placeholder={isGift ? "Example: Emily Murphy" : "Example: Michael Murphy"}
      />

      <label className="mt-5 block text-left text-sm font-bold text-gray-300">
        Additional Names on Every Deed Optional
      </label>
      <textarea
        value={additionalNamesText}
        onChange={(event) => setAdditionalNamesText(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
        placeholder="Enter one additional name per line"
      />
      <p className="mt-2 text-xs text-gray-400">
        {formatUsdFromCents(ADDITIONAL_DEED_NAME_PRICE_CENTS)} per name, per
        property · maximum {MAX_ADDITIONAL_DEED_NAMES} names
      </p>

      {additionalDeedNames.length > 0 && (
        <p className="mt-2 text-sm font-bold text-yellow-400">
          Additional-name total for {propertyCount} properties:{" "}
          {formatUsdFromCents(additionalNameTotalCents)}
        </p>
      )}

      {isGift && (
        <>
          <label className="mt-5 block text-left text-sm font-bold text-gray-300">
            Gift Recipient Email
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            maxLength={254}
            className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
            placeholder="recipient@example.com"
          />

          <label className="mt-5 block text-left text-sm font-bold text-gray-300">
            Gift Message Optional
          </label>
          <textarea
            value={giftMessage}
            onChange={(event) => setGiftMessage(event.target.value)}
            maxLength={350}
            className="mt-2 min-h-28 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
            placeholder="Write a short gift message..."
          />
        </>
      )}

      <div className="mt-6 space-y-2 rounded-xl border border-white/15 bg-black/30 p-4 text-sm">
        <div className="flex justify-between gap-4 text-gray-300">
          <span>Properties</span>
          <span>{formatUsdFromCents(propertySubtotalCents)}</span>
        </div>
        {passportSelected && (
          <div className="flex justify-between gap-4 text-gray-300">
            <span>Lunar passports</span>
            <span>{formatUsdFromCents(passportTotalCents)}</span>
          </div>
        )}
        {additionalNameTotalCents > 0 && (
          <div className="flex justify-between gap-4 text-gray-300">
            <span>Additional deed names</span>
            <span>{formatUsdFromCents(additionalNameTotalCents)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-white/15 pt-3 text-lg font-black text-white">
          <span>Secure checkout total</span>
          <span className="text-yellow-400">
            {formatUsdFromCents(checkoutTotalCents)}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <label className="flex items-start gap-3 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm leading-6 text-gray-200">
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

        <label className="flex items-start gap-3 rounded-xl border border-white/15 bg-black/30 p-4 text-sm leading-6 text-gray-200">
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

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Policy version {LEGAL_POLICY_VERSION}. The acceptance time and policy
        version are recorded with the order.
      </p>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm font-bold text-red-300">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={isStartingCheckout}
        className="mt-6 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black text-black disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
      >
        {isStartingCheckout
          ? "Opening Secure Checkout…"
          : `Pay for ${propertyCount} ${propertyCount === 1 ? "Property" : "Properties"}`}
      </button>
    </div>
  );
}
