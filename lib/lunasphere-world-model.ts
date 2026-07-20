/**
 * LunaSphere™ World Model
 * Orbital One Realty
 *
 * This module is the authoritative source for LunaSphere geography,
 * territory rules, coordinate definitions, visibility levels, identifiers,
 * validation, and world metadata.
 *
 * Important:
 * - This file does not replace the existing Leaflet atlas.
 * - Existing map layers can migrate to this model incrementally.
 * - State, city, town, parcel, search, reservation, and commerce systems
 *   should eventually reference these shared definitions.
 */

export const LUNASPHERE_WORLD_METADATA = {
  id: "lunasphere",
  name: "LunaSphere",
  trademarkName: "LunaSphere™",
  organization: "Orbital One Realty",
  worldVersion: "1.0.0",
  schemaVersion: 1,
  status: "prelaunch",
  establishedYear: 2026,
  coordinateSystem: "lunasphere-cartesian-1000",
  projection: "leaflet-simple",
  units: "lunasphere-coordinate-units",
} as const;

/**
 * Backward-compatible version export.
 */
export const LUNASPHERE_WORLD_VERSION =
  LUNASPHERE_WORLD_METADATA.worldVersion;

/* -------------------------------------------------------------------------- */
/* Coordinate system                                                          */
/* -------------------------------------------------------------------------- */

export type LunarCoordinate = readonly [y: number, x: number];

export type MutableLunarCoordinate = [y: number, x: number];

export type LunarPolygon = readonly LunarCoordinate[];

export type MutableLunarPolygon = MutableLunarCoordinate[];

export type LunarBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type LunarBoundingBox = {
  minimumX: number;
  minimumY: number;
  maximumX: number;
  maximumY: number;
};

export type LunarCircle = {
  center: LunarCoordinate;
  radius: number;
};

export const LUNAR_CANVAS = {
  width: 1000,
  height: 1000,

  minimumX: 0,
  minimumY: 0,
  maximumX: 1000,
  maximumY: 1000,

  centerX: 500,
  centerY: 500,

  /**
   * Radius of the visible lunar disc.
   */
  moonRadius: 500,

  /**
   * Radius inside which saleable state territory may be generated.
   * The smaller margin protects the outer visual edge of the Moon.
   */
  saleableRadius: 485,

  /**
   * Leaflet Simple CRS bounds.
   */
  bounds: [
    [0, 0],
    [1000, 1000],
  ] as const satisfies readonly [LunarCoordinate, LunarCoordinate],
} as const;

export const SALEABLE_MOON: LunarCircle = {
  center: [LUNAR_CANVAS.centerY, LUNAR_CANVAS.centerX],
  radius: LUNAR_CANVAS.saleableRadius,
};

/* -------------------------------------------------------------------------- */
/* Required world counts                                                      */
/* -------------------------------------------------------------------------- */

export const WORLD_COUNTS = {
  states: 57,
  citiesPerState: 3,
  townsPerState: 20,

  totalCities: 57 * 3,
  totalTowns: 57 * 20,
} as const;

/* -------------------------------------------------------------------------- */
/* Territory and entity classifications                                       */
/* -------------------------------------------------------------------------- */

export const TERRITORY_KINDS = [
  "moon",
  "state",
  "city",
  "town",
  "rural",
  "city-block",
  "town-block",
  "rural-parcel",
  "historic-site",
  "attraction",
  "protected-area",
  "landing-site",
] as const;

export type TerritoryKind = (typeof TERRITORY_KINDS)[number];

export const PROPERTY_TYPES = [
  "rural-half-acre",
  "rural-acre",
  "town-block",
  "city-block",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const TERRITORY_STATUS_VALUES = [
  "available",
  "reserved",
  "sold",
  "protected",
  "unavailable",
  "future",
] as const;

export type TerritoryStatus =
  (typeof TERRITORY_STATUS_VALUES)[number];

/* -------------------------------------------------------------------------- */
/* Geography rules                                                            */
/* -------------------------------------------------------------------------- */

export const STATE_RULES = {
  requiredCount: WORLD_COUNTS.states,

  mustCoverSaleableMoon: true,
  sharedBordersRequired: true,
  overlapsAllowed: false,
  gapsAllowed: false,
  disconnectedPolygonsAllowed: false,

  minimumArea: 5_000,
  minimumVertexCount: 3,
  maximumRecommendedVertexCount: 80,

  edgePadding: 0,
  labelPadding: 12,

  /**
   * States may touch the saleable lunar boundary.
   */
  mustRemainInsideSaleableMoon: true,
} as const;

export const CITY_RULES = {
  requiredPerState: WORLD_COUNTS.citiesPerState,

  minimumArea: 350,
  minimumVertexCount: 3,

  stateBoundaryPadding: 10,
  minimumSpacingFromOtherCities: 8,
  minimumSpacingFromTowns: 5,

  mayOverlapStateBoundary: false,
  mayOverlapOtherCities: false,
  mayOverlapTowns: false,

  coverageTargetPerState: 0.18,
} as const;

export const TOWN_RULES = {
  requiredPerState: WORLD_COUNTS.townsPerState,

  minimumArea: 70,
  minimumVertexCount: 3,

  stateBoundaryPadding: 6,
  minimumSpacingFromCities: 5,
  minimumSpacingFromOtherTowns: 3,

  mayOverlapStateBoundary: false,
  mayOverlapCities: false,
  mayOverlapOtherTowns: false,

  coverageTargetPerState: 0.14,
} as const;

export const RURAL_RULES = {
  /**
   * Rural territory is derived rather than drawn independently:
   *
   * state territory - city territory - town territory - protected territory
   */
  derivedFromRemainingStateArea: true,

  minimumCoveragePerState: 0.55,
  mayOverlapCities: false,
  mayOverlapTowns: false,
  mayOverlapProtectedAreas: false,
} as const;

export const TERRITORY_RULES = {
  minimumStateArea: STATE_RULES.minimumArea,
  minimumCityArea: CITY_RULES.minimumArea,
  minimumTownArea: TOWN_RULES.minimumArea,

  cityCoverageTarget: CITY_RULES.coverageTargetPerState,
  townCoverageTarget: TOWN_RULES.coverageTargetPerState,
  minimumRuralCoverage: RURAL_RULES.minimumCoveragePerState,

  stateEdgePadding: STATE_RULES.edgePadding,
  cityStatePadding: CITY_RULES.stateBoundaryPadding,
  townStatePadding: TOWN_RULES.stateBoundaryPadding,

  territorySpacing: 5,
} as const;

/* -------------------------------------------------------------------------- */
/* Parcel rules                                                               */
/* -------------------------------------------------------------------------- */

export const PARCEL_RULES = {
  rural: {
    allowedPropertyTypes: [
      "rural-half-acre",
      "rural-acre",
    ] as const satisfies readonly PropertyType[],

    minimumStateBoundaryPadding: 2,
    minimumCityBoundaryPadding: 2,
    minimumTownBoundaryPadding: 2,

    mayCrossStateBoundary: false,
    mayCrossCityBoundary: false,
    mayCrossTownBoundary: false,
  },

  town: {
    allowedPropertyTypes: [
      "town-block",
    ] as const satisfies readonly PropertyType[],

    mayCrossTownBoundary: false,
    mayCrossStateBoundary: false,
  },

  city: {
    allowedPropertyTypes: [
      "city-block",
    ] as const satisfies readonly PropertyType[],

    mayCrossCityBoundary: false,
    mayCrossStateBoundary: false,
  },

  global: {
    overlapsAllowed: false,
    duplicateIdentifiersAllowed: false,
    soldParcelsPurchasable: false,
    reservedParcelsPurchasable: false,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Map visibility and presentation                                            */
/* -------------------------------------------------------------------------- */

export const ZOOM_VISIBILITY = {
  fullMoon: 0,

  stateBorders: 0,
  stateLabels: 1,

  cityBorders: 2,
  cityLabels: 3,

  townBorders: 4,
  townLabels: 5,

  parcels: 6,
  parcelLabels: 7,

  propertyDetails: 7,
} as const;

export const BORDER_STYLE = {
  state: {
    minimumZoom: ZOOM_VISIBILITY.stateBorders,

    defaultColor: "#ffffff",
    hoverColor: "#facc15",
    selectedColor: "#facc15",

    defaultOpacity: 0.13,
    hoverOpacity: 0.7,
    selectedOpacity: 0.9,

    defaultWeight: 0.65,
    hoverWeight: 1.75,
    selectedWeight: 2.25,

    defaultFillOpacity: 0,
    hoverFillOpacity: 0.06,
    selectedFillOpacity: 0.08,
  },

  city: {
    minimumZoom: ZOOM_VISIBILITY.cityBorders,

    defaultOpacity: 0.18,
    hoverOpacity: 0.55,
    selectedOpacity: 0.8,

    defaultWeight: 1,
    hoverWeight: 1.5,
    selectedWeight: 2,
  },

  town: {
    minimumZoom: ZOOM_VISIBILITY.townBorders,

    defaultOpacity: 0.16,
    hoverOpacity: 0.5,
    selectedOpacity: 0.75,

    defaultWeight: 1,
    hoverWeight: 1.4,
    selectedWeight: 1.8,
  },

  parcel: {
    minimumZoom: ZOOM_VISIBILITY.parcels,

    defaultOpacity: 0.22,
    hoverOpacity: 0.65,
    selectedOpacity: 0.9,

    defaultWeight: 1,
    hoverWeight: 1.4,
    selectedWeight: 1.8,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Core world entities                                                        */
/* -------------------------------------------------------------------------- */

export type LunaSphereEntityBase = {
  id: string;
  name: string;
  slug: string;

  createdAt?: string;
  updatedAt?: string;

  metadata?: Readonly<Record<string, unknown>>;
};

export type LunaSphereState = LunaSphereEntityBase & {
  kind: "state";

  stateNumber: number;
  center: LunarCoordinate;
  boundary: LunarPolygon;

  capitalCityId?: string;

  cityIds: readonly string[];
  townIds: readonly string[];

  description?: string;
};

export type LunaSphereCity = LunaSphereEntityBase & {
  kind: "city";

  stateId: string;
  cityNumber: number;

  center: LunarCoordinate;
  boundary: LunarPolygon;

  description?: string;
};

export type LunaSphereTown = LunaSphereEntityBase & {
  kind: "town";

  stateId: string;
  townNumber: number;

  center: LunarCoordinate;
  boundary: LunarPolygon;

  description?: string;
};

export type LunaSphereRuralTerritory = LunaSphereEntityBase & {
  kind: "rural";

  stateId: string;
  boundary: LunarPolygon;
};

export type LunaSphereParcel = LunaSphereEntityBase & {
  kind: "city-block" | "town-block" | "rural-parcel";

  stateId: string;
  cityId?: string;
  townId?: string;

  propertyType: PropertyType;
  status: TerritoryStatus;

  center: LunarCoordinate;
  boundary: LunarPolygon;

  parcelNumber: string;
  acreage?: number;

  ownerId?: string;
  reservationId?: string;
};

export type LunaSphereAttraction = LunaSphereEntityBase & {
  kind:
    | "attraction"
    | "historic-site"
    | "landing-site"
    | "protected-area";

  center: LunarCoordinate;
  boundary?: LunarPolygon;

  stateId?: string;

  description?: string;
  protected?: boolean;
};

export type LunaSphereWorld = {
  metadata: typeof LUNASPHERE_WORLD_METADATA;

  states: readonly LunaSphereState[];
  cities: readonly LunaSphereCity[];
  towns: readonly LunaSphereTown[];

  ruralTerritories?: readonly LunaSphereRuralTerritory[];
  parcels?: readonly LunaSphereParcel[];
  attractions?: readonly LunaSphereAttraction[];
};

/* -------------------------------------------------------------------------- */
/* Legacy compatibility                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The original atlas may still use `positions` instead of `boundary`.
 * This type allows old map data to be normalized without rewriting it.
 */
export type LegacyLunarRegion = {
  id?: string;
  name: string;
  slug?: string;

  center?: LunarCoordinate;

  positions: readonly LunarCoordinate[];

  stateNumber?: number;
  description?: string;

  [key: string]: unknown;
};

export type NormalizedLunarRegion = {
  id: string;
  name: string;
  slug: string;

  stateNumber: number;

  center: LunarCoordinate;
  boundary: LunarPolygon;
  positions: LunarPolygon;

  description?: string;
};

/* -------------------------------------------------------------------------- */
/* Identifier helpers                                                         */
/* -------------------------------------------------------------------------- */

export function createStateId(stateNumber: number): string {
  return `state-${padNumber(stateNumber, 2)}`;
}

export function createCityId(
  stateNumber: number,
  cityNumber: number
): string {
  return `${createStateId(stateNumber)}-city-${padNumber(cityNumber, 2)}`;
}

export function createTownId(
  stateNumber: number,
  townNumber: number
): string {
  return `${createStateId(stateNumber)}-town-${padNumber(townNumber, 2)}`;
}

export function createParcelId(input: {
  stateNumber: number;
  territoryType: "rural" | "city" | "town";
  territoryNumber?: number;
  parcelNumber: number | string;
}): string {
  const territoryNumber =
    input.territoryNumber === undefined
      ? ""
      : `-${padNumber(input.territoryNumber, 2)}`;

  return [
    createStateId(input.stateNumber),
    input.territoryType,
    territoryNumber,
    "parcel",
    String(input.parcelNumber),
  ]
    .filter(Boolean)
    .join("-")
    .replace(/--+/g, "-");
}

/* -------------------------------------------------------------------------- */
/* Coordinate helpers                                                         */
/* -------------------------------------------------------------------------- */

export function isFiniteCoordinate(
  value: unknown
): value is LunarCoordinate {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }

  const [y, x] = value;

  return (
    typeof y === "number" &&
    typeof x === "number" &&
    Number.isFinite(y) &&
    Number.isFinite(x)
  );
}

export function isInsideCanvas(
  coordinate: LunarCoordinate,
  padding = 0
): boolean {
  const [y, x] = coordinate;

  return (
    x >= LUNAR_CANVAS.minimumX + padding &&
    x <= LUNAR_CANVAS.maximumX - padding &&
    y >= LUNAR_CANVAS.minimumY + padding &&
    y <= LUNAR_CANVAS.maximumY - padding
  );
}

export function distanceBetweenCoordinates(
  first: LunarCoordinate,
  second: LunarCoordinate
): number {
  const deltaY = second[0] - first[0];
  const deltaX = second[1] - first[1];

  return Math.hypot(deltaX, deltaY);
}

export function isInsideSaleableMoon(
  coordinate: LunarCoordinate,
  padding = 0
): boolean {
  const [y, x] = coordinate;

  const deltaX = x - LUNAR_CANVAS.centerX;
  const deltaY = y - LUNAR_CANVAS.centerY;

  const maximumRadius =
    LUNAR_CANVAS.saleableRadius - Math.max(0, padding);

  return (
    deltaX * deltaX + deltaY * deltaY <=
    maximumRadius * maximumRadius
  );
}

export function clampCoordinateToCanvas(
  coordinate: LunarCoordinate,
  padding = 0
): MutableLunarCoordinate {
  const [y, x] = coordinate;

  return [
    clamp(
      y,
      LUNAR_CANVAS.minimumY + padding,
      LUNAR_CANVAS.maximumY - padding
    ),
    clamp(
      x,
      LUNAR_CANVAS.minimumX + padding,
      LUNAR_CANVAS.maximumX - padding
    ),
  ];
}

export function clampCoordinateToSaleableMoon(
  coordinate: LunarCoordinate,
  padding = 0
): MutableLunarCoordinate {
  const [y, x] = coordinate;

  const centerY = LUNAR_CANVAS.centerY;
  const centerX = LUNAR_CANVAS.centerX;

  const deltaY = y - centerY;
  const deltaX = x - centerX;

  const distance = Math.hypot(deltaX, deltaY);
  const maximumRadius = Math.max(
    0,
    LUNAR_CANVAS.saleableRadius - Math.max(0, padding)
  );

  if (distance <= maximumRadius || distance === 0) {
    return [y, x];
  }

  const scale = maximumRadius / distance;

  return [
    centerY + deltaY * scale,
    centerX + deltaX * scale,
  ];
}

export function calculatePolygonCenter(
  polygon: LunarPolygon
): MutableLunarCoordinate {
  if (polygon.length === 0) {
    return [LUNAR_CANVAS.centerY, LUNAR_CANVAS.centerX];
  }

  let totalY = 0;
  let totalX = 0;

  for (const [y, x] of polygon) {
    totalY += y;
    totalX += x;
  }

  return [
    totalY / polygon.length,
    totalX / polygon.length,
  ];
}

/**
 * Shoelace formula.
 */
export function calculatePolygonArea(
  polygon: LunarPolygon
): number {
  if (polygon.length < 3) {
    return 0;
  }

  let signedArea = 0;

  for (let index = 0; index < polygon.length; index += 1) {
    const [currentY, currentX] = polygon[index];
    const [nextY, nextX] =
      polygon[(index + 1) % polygon.length];

    signedArea += currentX * nextY - nextX * currentY;
  }

  return Math.abs(signedArea) / 2;
}

export function calculateBoundingBox(
  polygon: LunarPolygon
): LunarBoundingBox {
  if (polygon.length === 0) {
    return {
      minimumX: 0,
      minimumY: 0,
      maximumX: 0,
      maximumY: 0,
    };
  }

  let minimumX = Number.POSITIVE_INFINITY;
  let minimumY = Number.POSITIVE_INFINITY;
  let maximumX = Number.NEGATIVE_INFINITY;
  let maximumY = Number.NEGATIVE_INFINITY;

  for (const [y, x] of polygon) {
    minimumX = Math.min(minimumX, x);
    minimumY = Math.min(minimumY, y);
    maximumX = Math.max(maximumX, x);
    maximumY = Math.max(maximumY, y);
  }

  return {
    minimumX,
    minimumY,
    maximumX,
    maximumY,
  };
}

export function isPointInsidePolygon(
  point: LunarCoordinate,
  polygon: LunarPolygon
): boolean {
  const [pointY, pointX] = point;

  let inside = false;

  for (
    let currentIndex = 0,
      previousIndex = polygon.length - 1;
    currentIndex < polygon.length;
    previousIndex = currentIndex++
  ) {
    const [currentY, currentX] = polygon[currentIndex];
    const [previousY, previousX] = polygon[previousIndex];

    const crossesHorizontalRay =
      currentY > pointY !== previousY > pointY;

    if (!crossesHorizontalRay) {
      continue;
    }

    const intersectionX =
      ((previousX - currentX) *
        (pointY - currentY)) /
        (previousY - currentY) +
      currentX;

    if (pointX < intersectionX) {
      inside = !inside;
    }
  }

  return inside;
}

/* -------------------------------------------------------------------------- */
/* Normalization helpers                                                      */
/* -------------------------------------------------------------------------- */

export function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeLegacyRegion(
  region: LegacyLunarRegion,
  index: number
): NormalizedLunarRegion {
  const stateNumber = region.stateNumber ?? index + 1;
  const boundary = region.positions.map(
    ([y, x]) => [y, x] as LunarCoordinate
  );

  const center =
    region.center ??
    calculatePolygonCenter(boundary);

  return {
    id: region.id ?? createStateId(stateNumber),
    name: region.name,
    slug: region.slug ?? createSlug(region.name),

    stateNumber,

    center,
    boundary,
    positions: boundary,

    description: region.description,
  };
}

export function normalizeLegacyRegions(
  regions: readonly LegacyLunarRegion[]
): NormalizedLunarRegion[] {
  return regions.map(normalizeLegacyRegion);
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export type WorldValidationSeverity =
  | "error"
  | "warning"
  | "information";

export type WorldValidationIssue = {
  severity: WorldValidationSeverity;
  code: string;
  message: string;

  entityId?: string;
  entityName?: string;
};

export type WorldValidationResult = {
  valid: boolean;

  errors: readonly WorldValidationIssue[];
  warnings: readonly WorldValidationIssue[];
  information: readonly WorldValidationIssue[];

  issueCount: number;
};

export function validateState(
  state: LunaSphereState
): WorldValidationIssue[] {
  const issues: WorldValidationIssue[] = [];

  if (!state.id.trim()) {
    issues.push({
      severity: "error",
      code: "STATE_ID_REQUIRED",
      message: "State ID is required.",
      entityName: state.name,
    });
  }

  if (!state.name.trim()) {
    issues.push({
      severity: "error",
      code: "STATE_NAME_REQUIRED",
      message: "State name is required.",
      entityId: state.id,
    });
  }

  if (
    state.stateNumber < 1 ||
    state.stateNumber > WORLD_COUNTS.states
  ) {
    issues.push({
      severity: "error",
      code: "STATE_NUMBER_OUT_OF_RANGE",
      message: `State number must be between 1 and ${WORLD_COUNTS.states}.`,
      entityId: state.id,
      entityName: state.name,
    });
  }

  if (
    state.boundary.length <
    STATE_RULES.minimumVertexCount
  ) {
    issues.push({
      severity: "error",
      code: "STATE_BOUNDARY_TOO_SMALL",
      message: `State boundary must contain at least ${STATE_RULES.minimumVertexCount} vertices.`,
      entityId: state.id,
      entityName: state.name,
    });
  }

  const area = calculatePolygonArea(state.boundary);

  if (area < STATE_RULES.minimumArea) {
    issues.push({
      severity: "warning",
      code: "STATE_AREA_BELOW_MINIMUM",
      message: `State area ${area.toFixed(
        2
      )} is below the recommended minimum of ${STATE_RULES.minimumArea}.`,
      entityId: state.id,
      entityName: state.name,
    });
  }

  for (const coordinate of state.boundary) {
    if (!isFiniteCoordinate(coordinate)) {
      issues.push({
        severity: "error",
        code: "STATE_INVALID_COORDINATE",
        message:
          "State boundary contains an invalid coordinate.",
        entityId: state.id,
        entityName: state.name,
      });

      break;
    }

    if (!isInsideCanvas(coordinate)) {
      issues.push({
        severity: "error",
        code: "STATE_COORDINATE_OUTSIDE_CANVAS",
        message:
          "State boundary contains a coordinate outside the LunaSphere canvas.",
        entityId: state.id,
        entityName: state.name,
      });

      break;
    }
  }

  if (!isPointInsidePolygon(state.center, state.boundary)) {
    issues.push({
      severity: "warning",
      code: "STATE_CENTER_OUTSIDE_BOUNDARY",
      message:
        "The state center is outside its state boundary.",
      entityId: state.id,
      entityName: state.name,
    });
  }

  if (
    state.cityIds.length !==
    WORLD_COUNTS.citiesPerState
  ) {
    issues.push({
      severity: "warning",
      code: "STATE_CITY_COUNT_MISMATCH",
      message: `State must contain exactly ${WORLD_COUNTS.citiesPerState} cities.`,
      entityId: state.id,
      entityName: state.name,
    });
  }

  if (
    state.townIds.length !==
    WORLD_COUNTS.townsPerState
  ) {
    issues.push({
      severity: "warning",
      code: "STATE_TOWN_COUNT_MISMATCH",
      message: `State must contain exactly ${WORLD_COUNTS.townsPerState} towns.`,
      entityId: state.id,
      entityName: state.name,
    });
  }

  return issues;
}

export function validateWorld(
  world: LunaSphereWorld
): WorldValidationResult {
  const issues: WorldValidationIssue[] = [];

  if (world.states.length !== WORLD_COUNTS.states) {
    issues.push({
      severity: "error",
      code: "WORLD_STATE_COUNT_MISMATCH",
      message: `LunaSphere requires exactly ${WORLD_COUNTS.states} states; received ${world.states.length}.`,
    });
  }

  if (world.cities.length !== WORLD_COUNTS.totalCities) {
    issues.push({
      severity: "warning",
      code: "WORLD_CITY_COUNT_MISMATCH",
      message: `LunaSphere requires ${WORLD_COUNTS.totalCities} cities; received ${world.cities.length}.`,
    });
  }

  if (world.towns.length !== WORLD_COUNTS.totalTowns) {
    issues.push({
      severity: "warning",
      code: "WORLD_TOWN_COUNT_MISMATCH",
      message: `LunaSphere requires ${WORLD_COUNTS.totalTowns} towns; received ${world.towns.length}.`,
    });
  }

  const stateIds = new Set<string>();
  const stateNumbers = new Set<number>();
  const stateSlugs = new Set<string>();

  for (const state of world.states) {
    issues.push(...validateState(state));

    if (stateIds.has(state.id)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_STATE_ID",
        message: `Duplicate state ID: ${state.id}.`,
        entityId: state.id,
        entityName: state.name,
      });
    }

    if (stateNumbers.has(state.stateNumber)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_STATE_NUMBER",
        message: `Duplicate state number: ${state.stateNumber}.`,
        entityId: state.id,
        entityName: state.name,
      });
    }

    if (stateSlugs.has(state.slug)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_STATE_SLUG",
        message: `Duplicate state slug: ${state.slug}.`,
        entityId: state.id,
        entityName: state.name,
      });
    }

    stateIds.add(state.id);
    stateNumbers.add(state.stateNumber);
    stateSlugs.add(state.slug);
  }

  for (const city of world.cities) {
    if (!stateIds.has(city.stateId)) {
      issues.push({
        severity: "error",
        code: "CITY_PARENT_STATE_NOT_FOUND",
        message: `City references missing state ${city.stateId}.`,
        entityId: city.id,
        entityName: city.name,
      });
    }
  }

  for (const town of world.towns) {
    if (!stateIds.has(town.stateId)) {
      issues.push({
        severity: "error",
        code: "TOWN_PARENT_STATE_NOT_FOUND",
        message: `Town references missing state ${town.stateId}.`,
        entityId: town.id,
        entityName: town.name,
      });
    }
  }

  const errors = issues.filter(
    (issue) => issue.severity === "error"
  );

  const warnings = issues.filter(
    (issue) => issue.severity === "warning"
  );

  const information = issues.filter(
    (issue) => issue.severity === "information"
  );

  return {
    valid: errors.length === 0,

    errors,
    warnings,
    information,

    issueCount: issues.length,
  };
}

/* -------------------------------------------------------------------------- */
/* Internal utilities                                                         */
/* -------------------------------------------------------------------------- */

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function padNumber(
  value: number,
  length: number
): string {
  return String(value).padStart(length, "0");
}