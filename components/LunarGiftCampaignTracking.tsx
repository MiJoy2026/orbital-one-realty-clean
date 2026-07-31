"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
  sendAnalyticsEvent,
} from "@/lib/analytics";

const PROMOTION_ID = "lunar-gift-landing-page";
const PROMOTION_NAME = "Gift a Place on the Moon";
const CREATIVE_NAME = "lunar-gift-landing-page-v1";

function getCampaignParameters(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const searchParams = new URLSearchParams(window.location.search);
  const campaignParameters: Record<string, string> = {};

  [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ].forEach((parameter) => {
    const value = searchParams.get(parameter)?.trim();

    if (value) {
      campaignParameters[parameter] = value;
    }
  });

  return campaignParameters;
}

export default function LunarGiftCampaignTracking() {
  const hasSentView = useRef(false);

  useEffect(() => {
    const sendLandingPageView = () => {
      if (hasSentView.current || !readAnalyticsConsent()) {
        return;
      }

      sendAnalyticsEvent("view_promotion", {
        promotion_id: PROMOTION_ID,
        promotion_name: PROMOTION_NAME,
        creative_name: CREATIVE_NAME,
        creative_slot: "advertising-landing-page",
        landing_page: "/gift-a-place-on-the-moon",
        ...getCampaignParameters(),
      });

      hasSentView.current = true;
    };

    sendLandingPageView();

    window.addEventListener(
      ANALYTICS_CONSENT_EVENT,
      sendLandingPageView
    );

    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT,
        sendLandingPageView
      );
    };
  }, []);

  return null;
}

export function TrackedGiftLink({
  href,
  trackingId,
  className,
  children,
}: {
  href: string;
  trackingId: string;
  className: string;
  children: ReactNode;
}) {
  const trackSelection = () => {
    sendAnalyticsEvent("select_promotion", {
      promotion_id: PROMOTION_ID,
      promotion_name: PROMOTION_NAME,
      creative_name: CREATIVE_NAME,
      creative_slot: trackingId,
      destination: href,
      ...getCampaignParameters(),
    });
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={trackSelection}
    >
      {children}
    </Link>
  );
}