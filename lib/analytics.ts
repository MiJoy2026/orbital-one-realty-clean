import { LEGAL_POLICY_VERSION } from "@/lib/legal-config";

export const GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-CX654R9L09";
export const COOKIE_PREFERENCES_STORAGE_KEY =
  "orbital-one-cookie-preferences";
export const ANALYTICS_CONSENT_EVENT =
  "orbital-analytics-consent-changed";

type StoredPreferenceRecord = {
  version?: string;
  analyticsEnabled?: boolean;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

export function readAnalyticsConsent(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(
      COOKIE_PREFERENCES_STORAGE_KEY
    );

    if (!stored) {
      return false;
    }

    const parsed = JSON.parse(stored) as StoredPreferenceRecord;

    return (
      parsed.version === LEGAL_POLICY_VERSION &&
      parsed.analyticsEnabled === true
    );
  } catch {
    return false;
  }
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
