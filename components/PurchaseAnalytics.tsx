"use client";

import { useEffect } from "react";

import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
} from "@/lib/analytics";

type PurchaseAnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  quantity: number;
};

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export default function PurchaseAnalytics({
  transactionId,
  value,
  items,
}: {
  transactionId: string;
  value: number;
  items: PurchaseAnalyticsItem[];
}) {
  useEffect(() => {
    let attempts = 0;

    const storageKey =
      "orbital-one-ga4-purchase-" + transactionId;

    const attemptSend = () => {
      if (!readAnalyticsConsent()) {
        return;
      }

      try {
        if (window.localStorage.getItem(storageKey)) {
          return;
        }
      } catch {
        // Analytics may still work when storage is restricted.
      }

      const analyticsWindow = window as AnalyticsWindow;

      if (typeof analyticsWindow.gtag !== "function") {
        return;
      }

      analyticsWindow.gtag("event", "purchase", {
        transaction_id: transactionId,
        affiliation: "Orbital One Realty",
        currency: "USD",
        value,
        items,
      });

      try {
        window.localStorage.setItem(
          storageKey,
          new Date().toISOString()
        );
      } catch {
        // Google Analytics also deduplicates purchase transaction IDs.
      }
    };

    attemptSend();

    const intervalId = window.setInterval(() => {
      attempts += 1;
      attemptSend();

      if (attempts >= 20) {
        window.clearInterval(intervalId);
      }
    }, 500);

    window.addEventListener(
      ANALYTICS_CONSENT_EVENT,
      attemptSend
    );

    return () => {
      window.clearInterval(intervalId);

      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT,
        attemptSend
      );
    };
  }, [items, transactionId, value]);

  return null;
}
