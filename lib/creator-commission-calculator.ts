export const CREATOR_COMMISSION_RATE_BPS = {
  tierOne: 2000,
  tierTwo: 2500,
  tierThree: 3000,
} as const;

export function getCreatorCommissionRateBps(
  qualifyingSaleCount: number,
  customCommissionRateBps?: number | null
): number {
  if (
    typeof customCommissionRateBps === "number" &&
    Number.isInteger(customCommissionRateBps) &&
    customCommissionRateBps >= 0 &&
    customCommissionRateBps <= 10000
  ) {
    return customCommissionRateBps;
  }

  if (qualifyingSaleCount >= 100) {
    return CREATOR_COMMISSION_RATE_BPS.tierThree;
  }

  if (qualifyingSaleCount >= 25) {
    return CREATOR_COMMISSION_RATE_BPS.tierTwo;
  }

  return CREATOR_COMMISSION_RATE_BPS.tierOne;
}

export function calculateCreatorCommissionCents(
  netRevenueCents: number,
  commissionRateBps: number
): number {
  const safeRevenueCents = Math.max(
    0,
    Math.trunc(netRevenueCents)
  );

  const safeRateBps = Math.min(
    Math.max(Math.trunc(commissionRateBps), 0),
    10000
  );

  return Math.round(
    (safeRevenueCents * safeRateBps) / 10000
  );
}

export function countDistinctCreatorSales(
  stripeSessionIds: string[]
): number {
  return new Set(
    stripeSessionIds
      .map((sessionId) => sessionId.trim())
      .filter(Boolean)
  ).size;
}