"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ANALYTICS_CONSENT_EVENT,
  COOKIE_PREFERENCES_STORAGE_KEY,
  announceAnalyticsConsent,
} from "@/lib/analytics";
import { LEGAL_POLICY_VERSION } from "@/lib/legal-config";

type PreferenceRecord = {
  version: string;
  necessary: true;
  analyticsEnabled: boolean;
  advertisingEnabled: false;
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
  analyticsEnabled: boolean
): void {
  const record: PreferenceRecord = {
    version: LEGAL_POLICY_VERSION,
    necessary: true,
    analyticsEnabled,
    advertisingEnabled: false,
    optionalTrackingEnabled: analyticsEnabled,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    COOKIE_PREFERENCES_STORAGE_KEY,
    JSON.stringify(record)
  );

  announceAnalyticsConsent(analyticsEnabled);
}

export default function CookiePreferences() {
  const [isReady, setIsReady] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] =
    useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    const existing = readStoredPreference();

    setAnalyticsEnabled(
      existing?.version === LEGAL_POLICY_VERSION &&
        existing.analyticsEnabled === true
    );

    setShowNotice(
      !existing ||
        existing.version !== LEGAL_POLICY_VERSION
    );

    setIsReady(true);
  }, []);

  useEffect(() => {
    const synchronizeFromStorage = () => {
      const existing = readStoredPreference();

      setAnalyticsEnabled(
        existing?.version === LEGAL_POLICY_VERSION &&
          existing.analyticsEnabled === true
      );
    };

    window.addEventListener(
      ANALYTICS_CONSENT_EVENT,
      synchronizeFromStorage
    );

    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT,
        synchronizeFromStorage
      );
    };
  }, []);

  function saveSelection(enabled: boolean) {
    try {
      persistPreference(enabled);
      setAnalyticsEnabled(enabled);
      setStorageError("");
      setShowNotice(false);
      setShowSettings(false);
    } catch {
      setAnalyticsEnabled(false);
      announceAnalyticsConsent(false);
      setStorageError(
        "Your browser could not save this preference. Analytics remains disabled."
      );
    }
  }

  function openSettings() {
    const existing = readStoredPreference();

    setAnalyticsEnabled(
      existing?.version === LEGAL_POLICY_VERSION &&
        existing.analyticsEnabled === true
    );

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
        <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-4xl rounded-2xl border border-yellow-300/30 bg-slate-950/95 p-5 text-white shadow-2xl backdrop-blur sm:p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-black text-yellow-300">
                Your privacy choices
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Necessary technologies support secure accounts,
                carts, reservations, checkout, and privacy
                preferences. Google Analytics stays completely
                off unless you choose Accept Analytics.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <button
                type="button"
                onClick={openSettings}
                className="rounded-xl border border-white/20 px-4 py-3 text-sm font-black text-white"
              >
                Review Settings
              </button>

              <button
                type="button"
                onClick={() => saveSelection(false)}
                className="rounded-xl border border-yellow-400 px-4 py-3 text-sm font-black text-yellow-300"
              >
                Necessary Only
              </button>

              <button
                type="button"
                onClick={() => saveSelection(true)}
                className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black"
              >
                Accept Analytics
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
                  Required for account sessions, carts, property
                  reservations, checkout, security, and remembering
                  your privacy choices.
                </p>
              </section>

              <section className="rounded-2xl border border-yellow-300/25 bg-yellow-300/[0.04] p-5">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h3 className="font-black text-yellow-200">
                      Analytics and Performance
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Allows privacy-conscious Google Analytics
                      measurement of public page visits and shopping
                      activity. Names, emails, deed information,
                      gift messages, account pages, and private
                      document pages are not sent.
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
                        setAnalyticsEnabled(event.target.checked)
                      }
                      className="h-5 w-5 accent-yellow-400"
                      aria-label="Allow analytics and performance cookies"
                    />
                  </label>
                </div>
              </section>

              {["Functional", "Advertising and Targeting"].map(
                (category) => (
                  <section
                    key={category}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-black text-slate-200">
                        {category}
                      </h3>

                      <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-black text-slate-400">
                        Not in use
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      Orbital One Realty does not currently activate
                      this category on the customer-facing website.
                    </p>
                  </section>
                )
              )}
            </div>

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
                  onClick={() => saveSelection(false)}
                  className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-300"
                >
                  Necessary Only
                </button>

                <button
                  type="button"
                  onClick={() =>
                    saveSelection(analyticsEnabled)
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
