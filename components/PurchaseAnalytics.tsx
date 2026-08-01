"use client";

import { useEffect } from "react";

import {
  ADVERTISING_CONSENT_EVENT,
  ANALYTICS_CONSENT_EVENT,
  readAdvertisingConsent,
  readAnalyticsConsent,
  sendMetaPixelEvent,
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

function hasStoredEvent(storageKey: string): boolean {
  try {
    return Boolean(window.localStorage.getItem(storageKey));
  } catch {
    return false;
  }
}

function storeEvent(storageKey: string): void {
  try {
    window.localStorage.setItem(
      storageKey,
      new Date().toISOString()
    );
  } catch {
    // Browser storage may be restricted.
  }
}

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

    const googleStorageKey =
      "orbital-one-ga4-purchase-" + transactionId;

    const metaStorageKey =
      "orbital-one-meta-purchase-" + transactionId;

    const sendGooglePurchase = () => {
      if (
        !readAnalyticsConsent() ||
        hasStoredEvent(googleStorageKey)
      ) {
        return;
      }

      const analyticsWindow = window as AnalyticsWindow;

      if (typeof analyticsWindow.gtag !== "function") {
        return;
      }

      analyticsWindow.gtag("event", "purchase", {
        transaction_id: transactionId,
        affiliation: "Orbital One Realty",
        currency: "USD",
        value: Number(value.toFixed(2)),
        items,
      });

      storeEvent(googleStorageKey);
    };

    const sendMetaPurchase = () => {
      if (
        !readAdvertisingConsent() ||
        hasStoredEvent(metaStorageKey)
      ) {
        return;
      }

      const wasSent = sendMetaPixelEvent("Purchase", {
        content_ids: items.map((item) => item.item_id),
        contents: items.map((item) => ({
          id: item.item_id,
          quantity: item.quantity,
          item_price: Number(item.price.toFixed(2)),
        })),
        content_name: "Orbital One Realty Purchase",
        content_category: "Novelty lunar property",
        content_type: "product",
        currency: "USD",
        value: Number(value.toFixed(2)),
        num_items: items.reduce(
          (total, item) => total + item.quantity,
          0
        ),
        transaction_id: transactionId,
      });

      if (wasSent) {
        storeEvent(metaStorageKey);
      }
    };

    const attemptSend = () => {
      sendGooglePurchase();
      sendMetaPurchase();
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

    window.addEventListener(
      ADVERTISING_CONSENT_EVENT,
      attemptSend
    );

    return () => {
      window.clearInterval(intervalId);

      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT,
        attemptSend
      );

      window.removeEventListener(
        ADVERTISING_CONSENT_EVENT,
        attemptSend
      );
    };
  }, [items, transactionId, value]);

  return null;
}