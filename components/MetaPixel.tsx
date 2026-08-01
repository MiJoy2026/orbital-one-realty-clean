"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  ADVERTISING_CONSENT_EVENT,
  COOKIE_PREFERENCES_STORAGE_KEY,
  META_PIXEL_ID,
  readAdvertisingConsent,
} from "@/lib/analytics";

type MetaPixelFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: MetaPixelFunction;
};

type MetaPixelWindow = Window & {
  fbq?: MetaPixelFunction;
  _fbq?: MetaPixelFunction;
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

function getMetaWindow(): MetaPixelWindow {
  return window as MetaPixelWindow;
}

function ensureMetaPixelQueue(): MetaPixelFunction {
  const metaWindow = getMetaWindow();

  if (metaWindow.fbq) {
    return metaWindow.fbq;
  }

  const pixel = ((...args: unknown[]) => {
    if (pixel.callMethod) {
      pixel.callMethod(...args);
      return;
    }

    pixel.queue?.push(args);
  }) as MetaPixelFunction;

  pixel.push = pixel;
  pixel.loaded = true;
  pixel.version = "2.0";
  pixel.queue = [];

  metaWindow.fbq = pixel;
  metaWindow._fbq = pixel;

  return pixel;
}

function ensureMetaPixelScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing =
      document.querySelector<HTMLScriptElement>(
        'script[data-orbital-meta-pixel="true"]'
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
        () => reject(new Error("Meta Pixel failed to load.")),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.orbitalMetaPixel = "true";

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
      () => reject(new Error("Meta Pixel failed to load.")),
      { once: true }
    );

    document.head.appendChild(script);
  });
}

function expireMetaCookies(): void {
  for (const cookieName of ["_fbp", "_fbc"]) {
    document.cookie =
      `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax`;

    document.cookie =
      `${cookieName}=; Max-Age=0; Path=/; ` +
      "Domain=.orbitalonerealty.com; SameSite=Lax";
  }
}

export default function MetaPixel() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);
  const lastTrackedPath = useRef("");

  useEffect(() => {
    const synchronizeConsent = () => {
      setEnabled(readAdvertisingConsent());
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
      ADVERTISING_CONSENT_EVENT,
      synchronizeConsent
    );

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        ADVERTISING_CONSENT_EVENT,
        synchronizeConsent
      );

      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    const metaWindow = getMetaWindow();

    if (!enabled) {
      metaWindow.fbq?.("consent", "revoke");
      expireMetaCookies();
      setReady(false);
      lastTrackedPath.current = "";
      return;
    }

    const pixel = ensureMetaPixelQueue();

    pixel("consent", "grant");

    if (!initialized.current) {
      pixel("init", META_PIXEL_ID);
      initialized.current = true;
    }

    ensureMetaPixelScript()
      .then(() => setReady(true))
      .catch((error) => {
        console.error("[Orbital One] Meta Pixel load failed.", error);
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

    const metaWindow = getMetaWindow();

    metaWindow.fbq?.("track", "PageView");

    lastTrackedPath.current = pathname;
  }, [enabled, pathname, ready]);

  return null;
}