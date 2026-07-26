"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  ANALYTICS_CONSENT_EVENT,
  COOKIE_PREFERENCES_STORAGE_KEY,
  GOOGLE_ANALYTICS_MEASUREMENT_ID,
  readAnalyticsConsent,
} from "@/lib/analytics";

type GoogleAnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

const PRIVATE_PATH_PREFIXES = [
  "/account",
  "/account-access",
  "/admin",
  "/checkout",
  "/login",
  "/logout",
  "/register",
  "/success",
  "/verify",
];

function shouldTrackPath(pathname: string): boolean {
  return !PRIVATE_PATH_PREFIXES.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function setAnalyticsDisabled(disabled: boolean): void {
  const browserWindow = window as unknown as Record<string, unknown>;

  browserWindow[
    "ga-disable-" + GOOGLE_ANALYTICS_MEASUREMENT_ID
  ] = disabled;
}

function expireAnalyticsCookies(): void {
  const propertyCookie =
    "_ga_" +
    GOOGLE_ANALYTICS_MEASUREMENT_ID.replace("G-", "");

  for (const name of ["_ga", propertyCookie]) {
    document.cookie =
      name + "=; Max-Age=0; Path=/; SameSite=Lax";

    document.cookie =
      name +
      "=; Max-Age=0; Path=/; Domain=.orbitalonerealty.com; SameSite=Lax";
  }
}

function configureGoogleAnalytics(): void {
  const analyticsWindow = window as GoogleAnalyticsWindow;

  analyticsWindow.dataLayer =
    analyticsWindow.dataLayer || [];

  analyticsWindow.gtag =
    analyticsWindow.gtag ||
    ((...args: unknown[]) => {
      analyticsWindow.dataLayer?.push(args);
    });

  analyticsWindow.gtag("js", new Date());

  analyticsWindow.gtag(
    "config",
    GOOGLE_ANALYTICS_MEASUREMENT_ID,
    {
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    }
  );
}

function ensureGoogleTag(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing =
      document.querySelector<HTMLScriptElement>(
        'script[data-orbital-ga4="true"]'
      );

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), {
        once: true,
      });

      existing.addEventListener(
        "error",
        () => reject(new Error("Google Analytics failed to load.")),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(GOOGLE_ANALYTICS_MEASUREMENT_ID);

    script.dataset.orbitalGa4 = "true";

    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );

    script.addEventListener(
      "error",
      () => reject(new Error("Google Analytics failed to load.")),
      { once: true }
    );

    document.head.appendChild(script);
  });
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const configured = useRef(false);
  const lastTrackedPath = useRef("");

  useEffect(() => {
    const synchronizeConsent = () => {
      setEnabled(readAnalyticsConsent());
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === COOKIE_PREFERENCES_STORAGE_KEY
      ) {
        synchronizeConsent();
      }
    };

    synchronizeConsent();

    window.addEventListener(
      ANALYTICS_CONSENT_EVENT,
      synchronizeConsent
    );

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT,
        synchronizeConsent
      );

      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setAnalyticsDisabled(true);
      expireAnalyticsCookies();
      setReady(false);
      lastTrackedPath.current = "";
      return;
    }

    setAnalyticsDisabled(false);

    if (!configured.current) {
      configureGoogleAnalytics();
      configured.current = true;
    }

    ensureGoogleTag()
      .then(() => setReady(true))
      .catch((error) => {
        console.error("[Orbital One] Analytics load failed.", error);
        setReady(false);
      });
  }, [enabled]);

  useEffect(() => {
    if (
      !enabled ||
      !ready ||
      !pathname ||
      !shouldTrackPath(pathname) ||
      lastTrackedPath.current === pathname
    ) {
      return;
    }

    const analyticsWindow = window as GoogleAnalyticsWindow;

    analyticsWindow.gtag?.("event", "page_view", {
      page_title: document.title,
      page_location: window.location.origin + pathname,
      page_path: pathname,
    });

    lastTrackedPath.current = pathname;
  }, [enabled, pathname, ready]);

  return null;
}
