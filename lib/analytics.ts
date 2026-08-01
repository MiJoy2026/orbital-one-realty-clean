import { LEGAL_POLICY_VERSION } from "@/lib/legal-config";

export const GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-CX654R9L09";
export const META_PIXEL_ID = "2040256933245673";

export const COOKIE_PREFERENCES_STORAGE_KEY =
  "orbital-one-cookie-preferences";

export const ANALYTICS_CONSENT_EVENT =
  "orbital-analytics-consent-changed";

export const ADVERTISING_CONSENT_EVENT =
  "orbital-advertising-consent-changed";

type StoredPreferenceRecord = {
  version?: string;
  analyticsEnabled?: boolean;
  advertisingEnabled?: boolean;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

function readStoredPreferences(): StoredPreferenceRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(
      COOKIE_PREFERENCES_STORAGE_KEY
    );

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as StoredPreferenceRecord;
  } catch {
    return null;
  }
}

export function readAnalyticsConsent(): boolean {
  const preferences = readStoredPreferences();

  return (
    preferences?.version === LEGAL_POLICY_VERSION &&
    preferences.analyticsEnabled === true
  );
}

export function readAdvertisingConsent(): boolean {
  const preferences = readStoredPreferences();

  return (
    preferences?.version === LEGAL_POLICY_VERSION &&
    preferences.advertisingEnabled === true
  );
}

export function announceAnalyticsConsent(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ANALYTICS_CONSENT_EVENT, {
      detail: { enabled },
    })
  );
}

export function announceAdvertisingConsent(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ADVERTISING_CONSENT_EVENT, {
      detail: { enabled },
    })
  );
}

export function sendAnalyticsEvent(
  eventName: string,
  parameters: Record<string, unknown> = {}
): void {
  if (
    typeof window === "undefined" ||
    !readAnalyticsConsent()
  ) {
    return;
  }

  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.gtag?.("event", eventName, parameters);
}