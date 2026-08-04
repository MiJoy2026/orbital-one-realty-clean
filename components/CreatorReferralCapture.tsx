"use client";

import { useEffect, useRef } from "react";

import {
  ADVERTISING_CONSENT_EVENT,
  ANALYTICS_CONSENT_EVENT,
  readOptionalTrackingConsent,
} from "@/lib/analytics";
import { normalizeCreatorTrackingCode } from "@/lib/creator-referral";

export default function CreatorReferralCapture() {
  const pendingTrackingCode = useRef("");
  const captureInProgress = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const trackingCode = normalizeCreatorTrackingCode(
      searchParams.get("ref") || ""
    );

    if (!trackingCode) {
      return;
    }

    pendingTrackingCode.current = trackingCode;
    let cancelled = false;

    async function captureReferral() {
      if (
        cancelled ||
        captureInProgress.current ||
        !pendingTrackingCode.current ||
        !readOptionalTrackingConsent()
      ) {
        return;
      }

      captureInProgress.current = true;

      try {
        const response = await fetch("/api/creator-referral", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackingCode: pendingTrackingCode.current,
            landingPath: `${window.location.pathname}${window.location.search}`,
            consentGranted: true,
          }),
        });

        const data = (await response.json()) as {
          error?: string;
        };

        if (!response.ok) {
          console.error(
            "Creator referral could not be recorded:",
            data.error || response.statusText
          );
          return;
        }

        pendingTrackingCode.current = "";

        const cleanedUrl = new URL(window.location.href);
        cleanedUrl.searchParams.delete("ref");

        window.history.replaceState(
          window.history.state,
          "",
          `${cleanedUrl.pathname}${cleanedUrl.search}${cleanedUrl.hash}`
        );
      } catch (error) {
        console.error("Creator referral could not be recorded:", error);
      } finally {
        captureInProgress.current = false;
      }
    }

    function handleConsentChange() {
      void captureReferral();
    }

    window.addEventListener(
      ANALYTICS_CONSENT_EVENT,
      handleConsentChange
    );
    window.addEventListener(
      ADVERTISING_CONSENT_EVENT,
      handleConsentChange
    );

    void captureReferral();

    return () => {
      cancelled = true;

      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT,
        handleConsentChange
      );
      window.removeEventListener(
        ADVERTISING_CONSENT_EVENT,
        handleConsentChange
      );
    };
  }, []);

  return null;
}