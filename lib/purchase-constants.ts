export const PROPERTY_PRICES = {
  "Rural Acre": 24.95,
  "City Block": 54.95,
  "Town Block": 39.95,
} as const;

export type PurchasablePropertyType = keyof typeof PROPERTY_PRICES;

export const PASSPORT_PRICE = 4.99;
export const ADDITIONAL_DEED_NAME_PRICE = 1.99;
export const MAX_ADDITIONAL_DEED_NAMES = 5;
export const CHECKOUT_RESERVATION_MINUTES = 35;

export function isPurchasablePropertyType(
  value: string
): value is PurchasablePropertyType {
  return Object.prototype.hasOwnProperty.call(PROPERTY_PRICES, value);
}

export function getCanonicalPropertyPrice(
  propertyType: PurchasablePropertyType
): number {
  return PROPERTY_PRICES[propertyType];
}
