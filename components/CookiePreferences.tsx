"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LEGAL_POLICY_VERSION } from "@/lib/legal-config";

const STORAGE_KEY = "orbital-one-cookie-preferences";

type PreferenceRecord = {
  version: string;
  necessary: true;
  optionalTrackingEnabled: false;
  updatedAt: string;
};

function saveNecessaryOnlyPreference(): void {
  const record: PreferenceRecord = {
    version: LEGAL_POLICY_VERSION,
    necessary: true,
    optionalTrackingEnabled: false,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export default function CookiePreferences() {
  const [isReady, setIsReady] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(STORAGE_KEY);
      const parsed = existing ? (JSON.parse(existing) as Partial<PreferenceRecord>) : null;
      setShowNotice(parsed?.version !== LEGAL_POLICY_VERSION);
    } catch {
      setShowNotice(true);
    } finally {
      setIsReady(true);
    }
  }, []);

  function confirmNecessaryOnly() {
    try {
      saveNecessaryOnlyPreference();
    } catch {
      // The site remains usable when storage is unavailable.
    }

    setShowNotice(false);
    setShowSettings(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowSettings(true)}
        className="text-left text-sm text-slate-400 transition hover:text-yellow-300"
      >
        Cookie Settings
      </button>

      {isReady && showNotice && (
        <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-4xl rounded-2xl border border-yellow-300/30 bg-slate-950/95 p-5 text-white shadow-2xl backdrop-blur sm:p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-black text-yellow-300">Necessary website technologies</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Orbital One Realty uses necessary technologies for secure accounts,
                carts, property reservations, checkout, security, and privacy
                preferences. Optional analytics and advertising trackers are not
                currently active.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="rounded-xl border border-white/20 px-4 py-3 text-sm font-black text-white"
              >
                Review Settings
              </button>
              <button
                type="button"
                onClick={confirmNecessaryOnly}
                className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black"
              >
                Continue
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
                <h2 id="cookie-settings-title" className="mt-2 text-2xl font-black">
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
                  <h3 className="font-black text-emerald-200">Strictly Necessary</h3>
                  <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-black text-emerald-200">
                    Always Active
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Required for account sessions, carts, property reservations,
                  checkout, security, and remembering this notice.
                </p>
              </section>

              {["Functional", "Analytics and Performance", "Advertising and Targeting"].map(
                (category) => (
                  <section
                    key={category}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-black text-slate-200">{category}</h3>
                      <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-black text-slate-400">
                        Not in use
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      Orbital One Realty does not currently activate this category
                      on the customer-facing website.
                    </p>
                  </section>
                )
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <Link href="/cookies" className="text-sm font-black text-yellow-300 hover:underline">
                Read the Cookie Policy
              </Link>
              <button
                type="button"
                onClick={confirmNecessaryOnly}
                className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
              >
                Save Necessary-Only Preference
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
