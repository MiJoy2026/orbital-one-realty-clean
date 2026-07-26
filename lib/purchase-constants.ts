export const PRICING_VERSION = "2026-07-pricing-integrity-v1";

export const PROPERTY_PRICES_CENTS = {
  "Rural Acre": 2495,
  "Half Acre": 1695,
  "City Block": 5495,
  "Town Block": 3995,
} as const;

export const PROPERTY_PRICES = {
  "Rural Acre": PROPERTY_PRICES_CENTS["Rural Acre"] / 100,
  "Half Acre": PROPERTY_PRICES_CENTS["Half Acre"] / 100,
  "City Block": PROPERTY_PRICES_CENTS["City Block"] / 100,
  "Town Block": PROPERTY_PRICES_CENTS["Town Block"] / 100,
} as const;

export type PurchasablePropertyType = keyof typeof PROPERTY_PRICES;
export type RuralPropertyType = Extract<
  PurchasablePropertyType,
  "Rural Acre" | "Half Acre"
>;

export const FIRST_RURAL_ACRE_PRICE_CENTS =
  PROPERTY_PRICES_CENTS["Rural Acre"];
export const ADDITIONAL_RURAL_ACRE_PRICE_CENTS = 795;
export const HALF_ACRE_PRICE_CENTS = PROPERTY_PRICES_CENTS["Half Acre"];
export const ADDITIONAL_RURAL_ACRE_PRICE =
  ADDITIONAL_RURAL_ACRE_PRICE_CENTS / 100;

export const PASSPORT_PRICE_CENTS = 499;
export const PASSPORT_PRICE = PASSPORT_PRICE_CENTS / 100;
export const ADDITIONAL_DEED_NAME_PRICE_CENTS = 199;
export const ADDITIONAL_DEED_NAME_PRICE =
  ADDITIONAL_DEED_NAME_PRICE_CENTS / 100;
export const MAX_ADDITIONAL_DEED_NAMES = 5;
export const CHECKOUT_RESERVATION_MINUTES = 35;

export type PropertyPricingInput = {
  propertyId: string;
  propertyType: string;
};

export type CanonicalPropertyPricing = {
  propertyId: string;
  propertyType: PurchasablePropertyType;
  unitAmountCents: number;
  price: number;
  acreage: number | null;
  size: string;
  pricingRole:
    | "standard"
    | "half-acre"
    | "first-rural-acre"
    | "adjoining-rural-acre";
};

type ParsedRuralParcelPosition = {
  stateSlug: string;
  column: number;
  row: number;
};

const RURAL_SUBDIVISION_FACTOR = 5;
const MONEY_EPSILON = 0.000001;

function parseRuralParcelPosition(
  propertyId: string
): ParsedRuralParcelPosition | null {
  const match = propertyId
    .trim()
    .toUpperCase()
    .match(/^(.*)-R-C(\d{3})-R(\d{3})-SC(\d{2})-SR(\d{2})$/);

  if (!match) {
    return null;
  }

  const planningColumn = Number(match[2]);
  const planningRow = Number(match[3]);
  const subdivisionColumn = Number(match[4]);
  const subdivisionRow = Number(match[5]);

  if (
    !Number.isInteger(planningColumn) ||
    !Number.isInteger(planningRow) ||
    !Number.isInteger(subdivisionColumn) ||
    !Number.isInteger(subdivisionRow) ||
    planningColumn < 1 ||
    planningRow < 1 ||
    subdivisionColumn < 1 ||
    subdivisionColumn > RURAL_SUBDIVISION_FACTOR ||
    subdivisionRow < 1 ||
    subdivisionRow > RURAL_SUBDIVISION_FACTOR
  ) {
    return null;
  }

  return {
    stateSlug: match[1],
    column:
      (planningColumn - 1) * RURAL_SUBDIVISION_FACTOR +
      subdivisionColumn -
      1,
    row:
      (planningRow - 1) * RURAL_SUBDIVISION_FACTOR +
      subdivisionRow -
      1,
  };
}

function areAdjoiningRuralParcels(
  first: ParsedRuralParcelPosition,
  second: ParsedRuralParcelPosition
): boolean {
  return (
    first.stateSlug === second.stateSlug &&
    Math.abs(first.column - second.column) +
      Math.abs(first.row - second.row) ===
      1
  );
}

export function isPurchasablePropertyType(
  value: string
): value is PurchasablePropertyType {
  return Object.prototype.hasOwnProperty.call(PROPERTY_PRICES_CENTS, value);
}

export function isRuralPropertyType(
  value: string
): value is RuralPropertyType {
  return value === "Rural Acre" || value === "Half Acre";
}

export function getCanonicalPropertyPriceCents(
  propertyType: PurchasablePropertyType
): number {
  return PROPERTY_PRICES_CENTS[propertyType];
}

export function getCanonicalPropertyPrice(
  propertyType: PurchasablePropertyType
): number {
  return getCanonicalPropertyPriceCents(propertyType) / 100;
}

export function getCanonicalPropertyAcreage(
  propertyType: PurchasablePropertyType
): number | null {
  if (propertyType === "Rural Acre") {
    return 1;
  }

  if (propertyType === "Half Acre") {
    return 0.5;
  }

  return null;
}

export function getCanonicalPropertySize(
  propertyType: PurchasablePropertyType
): string {
  if (propertyType === "Rural Acre") {
    return "1 Acre";
  }

  if (propertyType === "Half Acre") {
    return "1/2 Acre";
  }

  return propertyType === "City Block" ? "1 City Block" : "1 Town Block";
}

export function calculateCanonicalPropertyPricing(
  items: readonly PropertyPricingInput[]
): CanonicalPropertyPricing[] {
  const result: CanonicalPropertyPricing[] = items.map((item) => {
    if (!isPurchasablePropertyType(item.propertyType)) {
      throw new Error(`Unsupported property type: ${item.propertyType}`);
    }

    const acreage = getCanonicalPropertyAcreage(item.propertyType);
    const size = getCanonicalPropertySize(item.propertyType);

    if (item.propertyType === "Half Acre") {
      return {
        propertyId: item.propertyId,
        propertyType: item.propertyType,
        unitAmountCents: HALF_ACRE_PRICE_CENTS,
        price: HALF_ACRE_PRICE_CENTS / 100,
        acreage,
        size,
        pricingRole: "half-acre",
      };
    }

    if (item.propertyType !== "Rural Acre") {
      const unitAmountCents = getCanonicalPropertyPriceCents(item.propertyType);

      return {
        propertyId: item.propertyId,
        propertyType: item.propertyType,
        unitAmountCents,
        price: unitAmountCents / 100,
        acreage,
        size,
        pricingRole: "standard",
      };
    }

    return {
      propertyId: item.propertyId,
      propertyType: item.propertyType,
      unitAmountCents: FIRST_RURAL_ACRE_PRICE_CENTS,
      price: FIRST_RURAL_ACRE_PRICE_CENTS / 100,
      acreage,
      size,
      pricingRole: "first-rural-acre",
    };
  });

  const ruralIndexes = result
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.propertyType === "Rural Acre");
  const parsedPositions = new Map<number, ParsedRuralParcelPosition>();

  for (const { item, index } of ruralIndexes) {
    const parsed = parseRuralParcelPosition(item.propertyId);

    if (parsed) {
      parsedPositions.set(index, parsed);
    }
  }

  const unvisited = new Set(parsedPositions.keys());

  while (unvisited.size > 0) {
    const firstIndex = unvisited.values().next().value as number;
    const component: number[] = [];
    const queue = [firstIndex];
    unvisited.delete(firstIndex);

    while (queue.length > 0) {
      const currentIndex = queue.shift()!;
      const currentPosition = parsedPositions.get(currentIndex)!;
      component.push(currentIndex);

      for (const candidateIndex of Array.from(unvisited)) {
        const candidatePosition = parsedPositions.get(candidateIndex)!;

        if (areAdjoiningRuralParcels(currentPosition, candidatePosition)) {
          unvisited.delete(candidateIndex);
          queue.push(candidateIndex);
        }
      }
    }

    component.sort((firstIndexValue, secondIndexValue) =>
      result[firstIndexValue].propertyId.localeCompare(
        result[secondIndexValue].propertyId
      )
    );

    component.slice(1).forEach((index) => {
      result[index] = {
        ...result[index],
        unitAmountCents: ADDITIONAL_RURAL_ACRE_PRICE_CENTS,
        price: ADDITIONAL_RURAL_ACRE_PRICE_CENTS / 100,
        pricingRole: "adjoining-rural-acre",
      };
    });
  }

  return result;
}

export function calculatePropertySubtotalCents(
  items: readonly PropertyPricingInput[]
): number {
  return calculateCanonicalPropertyPricing(items).reduce(
    (total, item) => total + item.unitAmountCents,
    0
  );
}


export type FractionalAcreageAllocationInput = {
  startingAcre: number;
  endingAcre: number;
  acresAssigned: number;
};

export function chooseAcreageAllocationNumber(input: {
  latestEndingAcre: number | null | undefined;
  fractionalAllocations: readonly FractionalAcreageAllocationInput[];
  acreagePurchased: number;
}): number {
  const nextUnusedAcre = Math.max(0, input.latestEndingAcre || 0) + 1;

  if (Math.abs(input.acreagePurchased - 0.5) >= MONEY_EPSILON) {
    return nextUnusedAcre;
  }

  const assignedByAcre = new Map<number, number>();

  for (const allocation of input.fractionalAllocations) {
    if (
      allocation.startingAcre < 1 ||
      allocation.startingAcre !== allocation.endingAcre ||
      allocation.acresAssigned <= 0 ||
      allocation.acresAssigned >= 1
    ) {
      continue;
    }

    assignedByAcre.set(
      allocation.startingAcre,
      (assignedByAcre.get(allocation.startingAcre) || 0) +
        allocation.acresAssigned
    );
  }

  const openAcre = Array.from(assignedByAcre.entries())
    .sort(([firstAcre], [secondAcre]) => firstAcre - secondAcre)
    .find(
      ([, assigned]) =>
        assigned + input.acreagePurchased <= 1 + MONEY_EPSILON
    );

  return openAcre?.[0] || nextUnusedAcre;
}

export function formatUsdFromCents(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function formatAcreage(acres: number | null | undefined): string {
  if (acres === null || acres === undefined || !Number.isFinite(acres)) {
    return "";
  }

  if (Math.abs(acres - 0.5) < MONEY_EPSILON) {
    return "1/2 acre";
  }

  if (Math.abs(acres - 1) < MONEY_EPSILON) {
    return "1 acre";
  }

  return `${Number(acres.toFixed(2)).toLocaleString("en-US")} acres`;
}

export function formatAcreageAllocation(input: {
  startingAcre: number;
  endingAcre: number;
  acresAssigned: number;
}): string {
  if (Math.abs(input.acresAssigned - 0.5) < MONEY_EPSILON) {
    return `1/2 acre allocation within Acre ${input.startingAcre.toLocaleString(
      "en-US"
    )}`;
  }

  if (input.startingAcre === input.endingAcre) {
    return `Acre ${input.startingAcre.toLocaleString("en-US")}`;
  }

  return `Acres ${input.startingAcre.toLocaleString(
    "en-US"
  )} through ${input.endingAcre.toLocaleString("en-US")}`;
}
