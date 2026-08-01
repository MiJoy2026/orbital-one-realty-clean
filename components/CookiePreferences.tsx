"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ADVERTISING_CONSENT_EVENT,
  ANALYTICS_CONSENT_EVENT,
  COOKIE_PREFERENCES_STORAGE_KEY,
  announceAdvertisingConsent,
  announceAnalyticsConsent,
} from "@/lib/analytics";
import { LEGAL_POLICY_VERSION } from "@/lib/legal-config";

type PreferenceRecord = {
  version: string;
  necessary: true;
  analyticsEnabled: boolean;
  advertisingEnabled: boolean;
  optionalTrackingEnabled: boolean;
  updatedAt: string;
};

function readStoredPreference(): PreferenceRecord | null {
  try {
    const stored = window.localStorage.getItem(
      COOKIE_PREFERENCES_STORAGE_KEY
    );

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as PreferenceRecord;
  } catch {
    return null;
  }
}

function persistPreference(
  analyticsEnabled: boolean,
  advertisingEnabled: boolean
): void {
  const record: PreferenceRecord = {
    version: LEGAL_POLICY_VERSION,
    necessary: true,
    analyticsEnabled,
    advertisingEnabled,
    optionalTrackingEnabled:
      analyticsEnabled || advertisingEnabled,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    COOKIE_PREFERENCES_STORAGE_KEY,
    JSON.stringify(record)
  );

  announceAnalyticsConsent(analyticsEnabled);
  announceAdvertisingConsent(advertisingEnabled);
}

export default function CookiePreferences() {
  const [isReady, setIsReady] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [analyticsEnabled, setAnalyticsEnabled] =
    useState(false);

  const [advertisingEnabled, setAdvertisingEnabled] =
    useState(false);

  const [storageError, setStorageError] = useState("");

  function synchronizePreference(): void {
    const existing = readStoredPreference();

    const hasCurrentVersion =
      existing?.version === LEGAL_POLICY_VERSION;

    setAnalyticsEnabled(
      hasCurrentVersion &&
        existing?.analyticsEnabled === true
    );

    setAdvertisingEnabled(
      hasCurrentVersion &&
        existing?.advertisingEnabled === true
    );
  }

  useEffect(() => {
    const existing = readStoredPreference();

    const hasCurrentVersion =
      existing?.version === LEGAL_POLICY_VERSION;

    setAnalyticsEnabled(
      hasCurrentVersion &&
        existing?.analyticsEnabled === true
    );

    setAdvertisingEnabled(
      hasCurrentVersion &&
        existing?.advertisingEnabled === true
    );

    setShowNotice(!hasCurrentVersion);
    setIsReady(true);
  }, []);

  useEffect(() => {
    const handleConsentChange = () => {
      synchronizePreference();
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === COOKIE_PREFERENCES_STORAGE_KEY
      ) {
        synchronizePreference();
      }
    };

    window.addEventListener(
      ANALYTICS_CONSENT_EVENT,
      handleConsentChange
    );

    window.addEventListener(
      ADVERTISING_CONSENT_EVENT,
      handleConsentChange
    );

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT,
        handleConsentChange
      );

      window.removeEventListener(
        ADVERTISING_CONSENT_EVENT,
        handleConsentChange
      );

      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function saveSelection(
    allowAnalytics: boolean,
    allowAdvertising: boolean
  ): void {
    try {
      persistPreference(
        allowAnalytics,
        allowAdvertising
      );

      setAnalyticsEnabled(allowAnalytics);
      setAdvertisingEnabled(allowAdvertising);
      setStorageError("");
      setShowNotice(false);
      setShowSettings(false);
    } catch {
      setAnalyticsEnabled(false);
      setAdvertisingEnabled(false);
      setStorageError(
        "Your browser could not save this preference. Optional cookies remain disabled."
      );
      setShowNotice(true);
      setShowSettings(false);

      announceAnalyticsConsent(false);
      announceAdvertisingConsent(false);
    }
  }

  function openSettings(): void {
    synchronizePreference();
    setStorageError("");
    setShowSettings(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openSettings}
        className="text-left text-sm text-slate-400 transition hover:text-yellow-300"
      >
        Cookie Settings
      </button>

      {isReady && showNotice && (
        <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-5xl rounded-2xl border border-yellow-300/30 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-black text-yellow-300">
                Cookies and privacy
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-300">
                We use necessary technologies to operate the
                website. With your permission, we also use
                Google Analytics and Meta Pixel to understand
                website activity and advertising performance.
                You can continue using the website while this
                notice is displayed.
              </p>

              {storageError && (
                <p className="mt-2 text-sm font-bold text-red-200">
                  {storageError}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() =>
                  saveSelection(false, false)
                }
                className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-black text-white transition hover:border-yellow-300"
              >
                Reject Optional
              </button>

              <button
                type="button"
                onClick={openSettings}
                className="rounded-xl border border-yellow-400 px-4 py-2.5 text-sm font-black text-yellow-300 transition hover:bg-yellow-400/10"
              >
                Settings
              </button>

              <button
                type="button"
                onClick={() =>
                  saveSelection(true, true)
                }
                className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-black text-black transition hover:bg-yellow-300"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                  Privacy Choices
                </p>

                <h2
                  id="cookie-settings-title"
                  className="mt-2 text-2xl font-black"
                >
                  Cookie Settings
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-lg border border-white/15 px-3 py-2 font-black"
                aria-label="Close cookie settings"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <section className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.06] p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-black text-emerald-200">
                    Strictly Necessary
                  </h3>

                  <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-black text-emerald-200">
                    Always Active
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Required for account sessions, carts,
                  reservations, checkout, security, and
                  remembering your privacy choices.
                </p>
              </section>

              <section className="rounded-2xl border border-yellow-300/25 bg-yellow-300/[0.04] p-5">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h3 className="font-black text-yellow-200">
                      Analytics and Performance
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Allows Google Analytics to measure visits
                      to public pages and shopping activity.
                      Advertising personalization and Google
                      Signals remain disabled.
                    </p>
                  </div>

                  <label className="flex shrink-0 items-center gap-3">
                    <span className="text-xs font-black uppercase text-slate-300">
                      {analyticsEnabled ? "On" : "Off"}
                    </span>

                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(event) =>
                        setAnalyticsEnabled(
                          event.target.checked
                        )
                      }
                      className="h-5 w-5 accent-yellow-400"
                      aria-label="Allow analytics and performance cookies"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl border border-blue-300/25 bg-blue-300/[0.04] p-5">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h3 className="font-black text-blue-200">
                      Advertising and Targeting
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Allows Meta Pixel to measure visits to
                      public pages and shopping actions,
                      evaluate Orbital One advertising, and
                      create advertising audiences.
                    </p>
                  </div>

                  <label className="flex shrink-0 items-center gap-3">
                    <span className="text-xs font-black uppercase text-slate-300">
                      {advertisingEnabled ? "On" : "Off"}
                    </span>

                    <input
                      type="checkbox"
                      checked={advertisingEnabled}
                      onChange={(event) =>
                        setAdvertisingEnabled(
                          event.target.checked
                        )
                      }
                      className="h-5 w-5 accent-blue-400"
                      aria-label="Allow advertising and targeting cookies"
                    />
                  </label>
                </div>
              </section>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              Orbital One does not intentionally include names,
              email addresses, deed names, gift messages,
              login credentials, account pages, or private
              documents in optional tracking events.
            </p>

            {storageError && (
              <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
                {storageError}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <Link
                href="/cookies"
                className="text-sm font-black text-yellow-300 hover:underline"
              >
                Read the Cookie Policy
              </Link>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    saveSelection(false, false)
                  }
                  className="rounded-xl border border-white/25 px-5 py-3 font-black text-white"
                >
                  Reject Optional
                </button>

                <button
                  type="button"
                  onClick={() =>
                    saveSelection(
                      analyticsEnabled,
                      advertisingEnabled
                    )
                  }
                  className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}