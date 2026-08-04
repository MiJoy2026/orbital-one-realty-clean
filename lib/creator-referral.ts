export const CREATOR_REFERRAL_COOKIE = "oor_creator_referral";

export const DEFAULT_CREATOR_REFERRAL_WINDOW_DAYS = 30;

export function normalizeCreatorTrackingCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 80);
}

export function creatorReferralMaxAgeSeconds(days: number): number {
  const safeDays = Number.isFinite(days)
    ? Math.min(Math.max(Math.trunc(days), 1), 365)
    : DEFAULT_CREATOR_REFERRAL_WINDOW_DAYS;

  return safeDays * 24 * 60 * 60;
}