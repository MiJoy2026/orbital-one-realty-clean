import { lunarStates } from "./moon-data";
import {
  CITY_RULES,
  LUNASPHERE_WORLD_METADATA,
  RURAL_RULES,
  TOWN_RULES,
  WORLD_COUNTS,
  calculateBoundingBox,
  calculatePolygonArea,
  createCityId,
  createSlug,
  createStateId,
  createTownId,
  isPointInsidePolygon,
  type LunarCoordinate,
  type LunarPolygon,
  type MutableLunarCoordinate,
} from "./lunasphere-world-model";
import {
  getStateBoundaryFromTopology,
  getTopologyState,
  type LunaSphereTopology,
} from "./lunasphere-topology";

/**
 * State-relative coordinates use a normalized radial domain centered on a
 * guaranteed interior point of the parent state. The first value is vertical
 * (Y), and the second value is horizontal (X), matching LunaSphere coordinates.
 *
 * A magnitude of 1 reaches the state boundary in that direction. Values below
 * 1 remain inside the state and automatically reflow when the state changes.
 */
export type StateRelativeCoordinate = readonly [y: number, x: number];
export type MutableStateRelativeCoordinate = [y: number, x: number];

export type LunaSphereSettlementKind = "city" | "town";
export type LunaSphereTerritoryLayoutStatus =
  | "draft"
  | "approved"
  | "published"
  | "archived";

export type LunaSphereSettlementDefinition = {
  id: string;
  stateId: string;
  stateName: string;
  stateNumber: number;
  kind: LunaSphereSettlementKind;
  territoryNumber: number;
  name: string;
  slug: string;
  center: MutableStateRelativeCoordinate;
  boundary: MutableStateRelativeCoordinate[];
};

export type LunaSphereTerritoryLayout = {
  id: string;
  worldId: string;
  worldVersion: string;
  schemaVersion: number;
  revision: number;
  status: LunaSphereTerritoryLayoutStatus;
  settlements: LunaSphereSettlementDefinition[];
};

export type ResolvedLunaSphereSettlement = Omit<
  LunaSphereSettlementDefinition,
  "center" | "boundary"
> & {
  center: MutableLunarCoordinate;
  boundary: MutableLunarCoordinate[];
  area: number;
};

export type ResolvedStateTerritories = {
  stateId: string;
  stateName: string;
  stateNumber: number;
  stateBoundary: MutableLunarCoordinate[];
  stateArea: number;
  interiorOrigin: MutableLunarCoordinate;
  cities: ResolvedLunaSphereSettlement[];
  towns: ResolvedLunaSphereSettlement[];
  urbanArea: number;
  urbanCoverage: number;
  ruralArea: number;
  ruralCoverage: number;
};

export type TerritoryValidationSeverity =
  | "error"
  | "warning"
  | "information";

export type TerritoryValidationIssue = {
  severity: TerritoryValidationSeverity;
  code: string;
  message: string;
  stateId?: string;
  stateName?: string;
  territoryId?: string;
  territoryName?: string;
};

export type TerritoryValidationResult = {
  valid: boolean;
  errors: TerritoryValidationIssue[];
  warnings: TerritoryValidationIssue[];
  information: TerritoryValidationIssue[];
  issueCount: number;
  stateCount: number;
  cityCount: number;
  townCount: number;
};

const GEOMETRY_EPSILON = 0.000001;
const MAXIMUM_RELATIVE_RADIUS = 0.91;
const INITIAL_CITY_RADIUS = 0.15;
const INITIAL_TOWN_RADIUS = 0.055;
const CITY_VERTEX_COUNT = 10;
const TOWN_VERTEX_COUNT = 8;

const CITY_CENTERS: readonly StateRelativeCoordinate[] = [
  [-0.28, -0.32],
  [-0.22, 0.34],
  [0.36, 0.02],
];

function createTownCenters(): StateRelativeCoordinate[] {
  const centers: StateRelativeCoordinate[] = [];
  const rings = [
    { count: 8, radius: 0.61, offset: Math.PI / 8 },
    { count: 12, radius: 0.82, offset: 0 },
  ] as const;

  for (const ring of rings) {
    for (let index = 0; index < ring.count; index += 1) {
      const angle =
        ring.offset + (index / ring.count) * Math.PI * 2;

      centers.push([
        Math.sin(angle) * ring.radius,
        Math.cos(angle) * ring.radius,
      ]);
    }
  }

  return centers;
}

const TOWN_CENTERS = createTownCenters();

function round(value: number, precision = 6): number {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function createIrregularBoundary(
  center: StateRelativeCoordinate,
  radius: number,
  vertexCount: number,
  seed: number
): MutableStateRelativeCoordinate[] {
  const points: MutableStateRelativeCoordinate[] = [];

  for (let index = 0; index < vertexCount; index += 1) {
    const angle =
      (index / vertexCount) * Math.PI * 2 +
      ((seed % 19) - 9) * 0.0025;
    const variation =
      1 +
      Math.sin((seed + 3) * (index + 1) * 0.73) * 0.065 +
      Math.cos((seed + 11) * (index + 2) * 0.31) * 0.035;
    const pointRadius = radius * variation;
    const y = center[0] + Math.sin(angle) * pointRadius;
    const x = center[1] + Math.cos(angle) * pointRadius;
    const magnitude = Math.hypot(y, x);
    const scale =
      magnitude > MAXIMUM_RELATIVE_RADIUS
        ? MAXIMUM_RELATIVE_RADIUS / magnitude
        : 1;

    points.push([round(y * scale), round(x * scale)]);
  }

  return points;
}

function createSettlementDefinition(input: {
  stateNumber: number;
  stateName: string;
  kind: LunaSphereSettlementKind;
  territoryNumber: number;
  name: string;
  center: StateRelativeCoordinate;
}): LunaSphereSettlementDefinition {
  const isCity = input.kind === "city";
  const id = isCity
    ? createCityId(input.stateNumber, input.territoryNumber)
    : createTownId(input.stateNumber, input.territoryNumber);
  const radius = isCity
    ? INITIAL_CITY_RADIUS
    : INITIAL_TOWN_RADIUS;
  const vertexCount = isCity
    ? CITY_VERTEX_COUNT
    : TOWN_VERTEX_COUNT;
  const seed = input.stateNumber * 100 + input.territoryNumber;

  return {
    id,
    stateId: createStateId(input.stateNumber),
    stateName: input.stateName,
    stateNumber: input.stateNumber,
    kind: input.kind,
    territoryNumber: input.territoryNumber,
    name: input.name,
    slug: createSlug(input.name),
    center: [input.center[0], input.center[1]],
    boundary: createIrregularBoundary(
      input.center,
      radius,
      vertexCount,
      seed
    ),
  };
}

/**
 * Creates the stable editable settlement plan used by LunaSphere Studio.
 * Geometry remains state-relative so state boundary changes reflow every city
 * and town without changing settlement identity or name.
 */
export function createInitialTerritoryLayout(): LunaSphereTerritoryLayout {
  const settlements = lunarStates.flatMap((state, stateIndex) => {
    const stateNumber = stateIndex + 1;
    const cities = state.cities.map((name, cityIndex) =>
      createSettlementDefinition({
        stateNumber,
        stateName: state.name,
        kind: "city",
        territoryNumber: cityIndex + 1,
        name,
        center: CITY_CENTERS[cityIndex],
      })
    );
    const towns = state.towns.map((name, townIndex) =>
      createSettlementDefinition({
        stateNumber,
        stateName: state.name,
        kind: "town",
        territoryNumber: townIndex + 1,
        name,
        center: TOWN_CENTERS[townIndex],
      })
    );

    return [...cities, ...towns];
  });

  return {
    id: "lunasphere-territories-v1",
    worldId: LUNASPHERE_WORLD_METADATA.id,
    worldVersion: LUNASPHERE_WORLD_METADATA.worldVersion,
    schemaVersion: 1,
    revision: 1,
    status: "draft",
    settlements,
  };
}

export function cloneTerritoryLayout(
  layout: LunaSphereTerritoryLayout
): LunaSphereTerritoryLayout {
  return {
    ...layout,
    settlements: layout.settlements.map((settlement) => ({
      ...settlement,
      center: [settlement.center[0], settlement.center[1]],
      boundary: settlement.boundary.map(
        ([y, x]) => [y, x] as MutableStateRelativeCoordinate
      ),
    })),
  };
}

function distancePointToSegment(
  point: LunarCoordinate,
  start: LunarCoordinate,
  end: LunarCoordinate
): number {
  const [pointY, pointX] = point;
  const [startY, startX] = start;
  const [endY, endX] = end;
  const deltaY = endY - startY;
  const deltaX = endX - startX;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;

  if (lengthSquared <= GEOMETRY_EPSILON) {
    return Math.hypot(pointX - startX, pointY - startY);
  }

  const projection = Math.max(
    0,
    Math.min(
      1,
      ((pointX - startX) * deltaX +
        (pointY - startY) * deltaY) /
        lengthSquared
    )
  );
  const closestX = startX + projection * deltaX;
  const closestY = startY + projection * deltaY;

  return Math.hypot(pointX - closestX, pointY - closestY);
}

function minimumDistanceToPolygonEdges(
  point: LunarCoordinate,
  polygon: LunarPolygon
): number {
  let minimumDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < polygon.length; index += 1) {
    const distance = distancePointToSegment(
      point,
      polygon[index],
      polygon[(index + 1) % polygon.length]
    );

    minimumDistance = Math.min(minimumDistance, distance);
  }

  return minimumDistance;
}

/**
 * Finds a stable interior mapping origin. The saved state label is preferred;
 * otherwise a deterministic grid search chooses the interior point with the
 * greatest clearance from the state boundary.
 */
function findStateInteriorOrigin(
  topology: LunaSphereTopology,
  stateName: string,
  boundary: LunarPolygon
): MutableLunarCoordinate {
  const topologyState = getTopologyState(topology, stateName);

  if (
    topologyState &&
    isPointInsidePolygon(topologyState.labelPosition, boundary)
  ) {
    return [
      topologyState.labelPosition[0],
      topologyState.labelPosition[1],
    ];
  }

  const bounds = calculateBoundingBox(boundary);
  let bestPoint: MutableLunarCoordinate | null = null;
  let bestClearance = Number.NEGATIVE_INFINITY;
  const sampleCount = 19;

  for (let yIndex = 1; yIndex < sampleCount; yIndex += 1) {
    for (let xIndex = 1; xIndex < sampleCount; xIndex += 1) {
      const point: MutableLunarCoordinate = [
        bounds.minimumY +
          ((bounds.maximumY - bounds.minimumY) * yIndex) /
            sampleCount,
        bounds.minimumX +
          ((bounds.maximumX - bounds.minimumX) * xIndex) /
            sampleCount,
      ];

      if (!isPointInsidePolygon(point, boundary)) {
        continue;
      }

      const clearance = minimumDistanceToPolygonEdges(
        point,
        boundary
      );

      if (clearance > bestClearance) {
        bestClearance = clearance;
        bestPoint = point;
      }
    }
  }

  return bestPoint ?? [500, 500];
}

function cross(
  firstX: number,
  firstY: number,
  secondX: number,
  secondY: number
): number {
  return firstX * secondY - firstY * secondX;
}

function rayBoundaryDistance(
  origin: LunarCoordinate,
  direction: LunarCoordinate,
  polygon: LunarPolygon
): number {
  const [originY, originX] = origin;
  const [directionY, directionX] = direction;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < polygon.length; index += 1) {
    const [startY, startX] = polygon[index];
    const [endY, endX] = polygon[(index + 1) % polygon.length];
    const edgeX = endX - startX;
    const edgeY = endY - startY;
    const offsetX = startX - originX;
    const offsetY = startY - originY;
    const denominator = cross(
      directionX,
      directionY,
      edgeX,
      edgeY
    );

    if (Math.abs(denominator) <= GEOMETRY_EPSILON) {
      continue;
    }

    const distanceAlongRay =
      cross(offsetX, offsetY, edgeX, edgeY) / denominator;
    const edgeFraction =
      cross(
        offsetX,
        offsetY,
        directionX,
        directionY
      ) / denominator;

    if (
      distanceAlongRay > GEOMETRY_EPSILON &&
      edgeFraction >= -GEOMETRY_EPSILON &&
      edgeFraction <= 1 + GEOMETRY_EPSILON
    ) {
      nearestDistance = Math.min(
        nearestDistance,
        distanceAlongRay
      );
    }
  }

  return Number.isFinite(nearestDistance)
    ? nearestDistance
    : 0;
}

export function resolveStateRelativeCoordinate(
  relativeCoordinate: StateRelativeCoordinate,
  stateBoundary: LunarPolygon,
  interiorOrigin: LunarCoordinate
): MutableLunarCoordinate {
  const [relativeY, relativeX] = relativeCoordinate;
  const magnitude = Math.hypot(relativeX, relativeY);

  if (magnitude <= GEOMETRY_EPSILON) {
    return [interiorOrigin[0], interiorOrigin[1]];
  }

  const clampedMagnitude = Math.min(
    magnitude,
    MAXIMUM_RELATIVE_RADIUS
  );
  const direction: MutableLunarCoordinate = [
    relativeY / magnitude,
    relativeX / magnitude,
  ];
  const boundaryDistance = rayBoundaryDistance(
    interiorOrigin,
    direction,
    stateBoundary
  );

  return [
    interiorOrigin[0] +
      direction[0] * boundaryDistance * clampedMagnitude,
    interiorOrigin[1] +
      direction[1] * boundaryDistance * clampedMagnitude,
  ];
}

export function getSettlementDefinitionsForState(
  layout: LunaSphereTerritoryLayout,
  stateName: string
): LunaSphereSettlementDefinition[] {
  const normalizedStateName = stateName.trim().toLowerCase();

  return layout.settlements.filter(
    (settlement) =>
      settlement.stateName.toLowerCase() === normalizedStateName
  );
}

export function resolveStateTerritories(
  topology: LunaSphereTopology,
  layout: LunaSphereTerritoryLayout,
  stateName: string
): ResolvedStateTerritories | null {
  const topologyState = getTopologyState(topology, stateName);

  if (!topologyState) {
    return null;
  }

  const stateBoundary = getStateBoundaryFromTopology(
    topology,
    topologyState.id
  ).map(([y, x]) => [y, x] as MutableLunarCoordinate);

  if (stateBoundary.length < 3) {
    return null;
  }

  const interiorOrigin = findStateInteriorOrigin(
    topology,
    stateName,
    stateBoundary
  );
  const definitions = getSettlementDefinitionsForState(
    layout,
    stateName
  );
  const resolved = definitions.map(
    (definition): ResolvedLunaSphereSettlement => {
      const boundary = definition.boundary.map((coordinate) =>
        resolveStateRelativeCoordinate(
          coordinate,
          stateBoundary,
          interiorOrigin
        )
      );
      const center = resolveStateRelativeCoordinate(
        definition.center,
        stateBoundary,
        interiorOrigin
      );

      return {
        ...definition,
        center,
        boundary,
        area: calculatePolygonArea(boundary),
      };
    }
  );
  const cities = resolved.filter(
    (territory) => territory.kind === "city"
  );
  const towns = resolved.filter(
    (territory) => territory.kind === "town"
  );
  const stateArea = calculatePolygonArea(stateBoundary);
  const urbanArea = resolved.reduce(
    (total, territory) => total + territory.area,
    0
  );
  const urbanCoverage =
    stateArea > 0 ? urbanArea / stateArea : 0;
  const ruralArea = Math.max(0, stateArea - urbanArea);
  const ruralCoverage =
    stateArea > 0 ? ruralArea / stateArea : 0;

  return {
    stateId: topologyState.id,
    stateName: topologyState.name,
    stateNumber: topologyState.stateNumber,
    stateBoundary,
    stateArea,
    interiorOrigin,
    cities,
    towns,
    urbanArea,
    urbanCoverage,
    ruralArea,
    ruralCoverage,
  };
}

function orientation(
  first: LunarCoordinate,
  second: LunarCoordinate,
  third: LunarCoordinate
): number {
  return (
    (second[1] - first[1]) * (third[0] - first[0]) -
    (second[0] - first[0]) * (third[1] - first[1])
  );
}

function pointOnSegment(
  point: LunarCoordinate,
  start: LunarCoordinate,
  end: LunarCoordinate
): boolean {
  return (
    Math.min(start[1], end[1]) - GEOMETRY_EPSILON <= point[1] &&
    point[1] <= Math.max(start[1], end[1]) + GEOMETRY_EPSILON &&
    Math.min(start[0], end[0]) - GEOMETRY_EPSILON <= point[0] &&
    point[0] <= Math.max(start[0], end[0]) + GEOMETRY_EPSILON &&
    Math.abs(orientation(start, end, point)) <= GEOMETRY_EPSILON
  );
}

function segmentsIntersect(
  firstStart: LunarCoordinate,
  firstEnd: LunarCoordinate,
  secondStart: LunarCoordinate,
  secondEnd: LunarCoordinate
): boolean {
  const firstOrientation = orientation(
    firstStart,
    firstEnd,
    secondStart
  );
  const secondOrientation = orientation(
    firstStart,
    firstEnd,
    secondEnd
  );
  const thirdOrientation = orientation(
    secondStart,
    secondEnd,
    firstStart
  );
  const fourthOrientation = orientation(
    secondStart,
    secondEnd,
    firstEnd
  );

  if (
    firstOrientation * secondOrientation < 0 &&
    thirdOrientation * fourthOrientation < 0
  ) {
    return true;
  }

  return (
    pointOnSegment(secondStart, firstStart, firstEnd) ||
    pointOnSegment(secondEnd, firstStart, firstEnd) ||
    pointOnSegment(firstStart, secondStart, secondEnd) ||
    pointOnSegment(firstEnd, secondStart, secondEnd)
  );
}

function polygonsOverlap(
  first: LunarPolygon,
  second: LunarPolygon
): boolean {
  const firstBounds = calculateBoundingBox(first);
  const secondBounds = calculateBoundingBox(second);

  if (
    firstBounds.maximumX < secondBounds.minimumX - GEOMETRY_EPSILON ||
    secondBounds.maximumX < firstBounds.minimumX - GEOMETRY_EPSILON ||
    firstBounds.maximumY < secondBounds.minimumY - GEOMETRY_EPSILON ||
    secondBounds.maximumY < firstBounds.minimumY - GEOMETRY_EPSILON
  ) {
    return false;
  }

  for (let firstIndex = 0; firstIndex < first.length; firstIndex += 1) {
    const firstStart = first[firstIndex];
    const firstEnd = first[(firstIndex + 1) % first.length];

    for (
      let secondIndex = 0;
      secondIndex < second.length;
      secondIndex += 1
    ) {
      if (
        segmentsIntersect(
          firstStart,
          firstEnd,
          second[secondIndex],
          second[(secondIndex + 1) % second.length]
        )
      ) {
        return true;
      }
    }
  }

  return (
    isPointInsidePolygon(first[0], second) ||
    isPointInsidePolygon(second[0], first)
  );
}

function createValidationResult(
  issues: TerritoryValidationIssue[],
  layout: LunaSphereTerritoryLayout
): TerritoryValidationResult {
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
    stateCount: new Set(
      layout.settlements.map((settlement) => settlement.stateId)
    ).size,
    cityCount: layout.settlements.filter(
      (settlement) => settlement.kind === "city"
    ).length,
    townCount: layout.settlements.filter(
      (settlement) => settlement.kind === "town"
    ).length,
  };
}

export function validateTerritoryLayout(
  topology: LunaSphereTopology,
  layout: LunaSphereTerritoryLayout
): TerritoryValidationResult {
  const issues: TerritoryValidationIssue[] = [];
  const ids = new Set<string>();

  for (const settlement of layout.settlements) {
    if (ids.has(settlement.id)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_SETTLEMENT_ID",
        message: `Duplicate settlement ID: ${settlement.id}.`,
        territoryId: settlement.id,
        territoryName: settlement.name,
      });
    }

    ids.add(settlement.id);
  }

  for (const topologyState of topology.states) {
    const resolved = resolveStateTerritories(
      topology,
      layout,
      topologyState.name
    );

    if (!resolved) {
      issues.push({
        severity: "error",
        code: "STATE_TERRITORIES_UNRESOLVED",
        message: `Territories could not be resolved for ${topologyState.name}.`,
        stateId: topologyState.id,
        stateName: topologyState.name,
      });
      continue;
    }

    if (resolved.cities.length !== WORLD_COUNTS.citiesPerState) {
      issues.push({
        severity: "error",
        code: "STATE_CITY_COUNT_MISMATCH",
        message: `${topologyState.name} requires ${WORLD_COUNTS.citiesPerState} cities; received ${resolved.cities.length}.`,
        stateId: topologyState.id,
        stateName: topologyState.name,
      });
    }

    if (resolved.towns.length !== WORLD_COUNTS.townsPerState) {
      issues.push({
        severity: "error",
        code: "STATE_TOWN_COUNT_MISMATCH",
        message: `${topologyState.name} requires ${WORLD_COUNTS.townsPerState} towns; received ${resolved.towns.length}.`,
        stateId: topologyState.id,
        stateName: topologyState.name,
      });
    }

    const settlements = [...resolved.cities, ...resolved.towns];
    let citiesBelowRecommendedArea = 0;
    let townsBelowRecommendedArea = 0;

    for (const settlement of settlements) {
      const outsideCoordinate = settlement.boundary.find(
        (coordinate) =>
          !isPointInsidePolygon(
            coordinate,
            resolved.stateBoundary
          )
      );

      if (outsideCoordinate) {
        issues.push({
          severity: "error",
          code: "SETTLEMENT_OUTSIDE_STATE",
          message: `${settlement.name} extends outside ${resolved.stateName}.`,
          stateId: resolved.stateId,
          stateName: resolved.stateName,
          territoryId: settlement.id,
          territoryName: settlement.name,
        });
      }

      if (
        settlement.kind === "city" &&
        settlement.area < CITY_RULES.minimumArea
      ) {
        citiesBelowRecommendedArea += 1;
      }

      if (
        settlement.kind === "town" &&
        settlement.area < TOWN_RULES.minimumArea
      ) {
        townsBelowRecommendedArea += 1;
      }
    }

    if (
      citiesBelowRecommendedArea > 0 ||
      townsBelowRecommendedArea > 0
    ) {
      issues.push({
        severity: "information",
        code: "SETTLEMENT_AREA_REVIEW_AFTER_STATE_DESIGN",
        message: `${resolved.stateName} has ${citiesBelowRecommendedArea} city and ${townsBelowRecommendedArea} town boundaries below the current recommended area. Review settlement scale after the final state shape is approved.`,
        stateId: resolved.stateId,
        stateName: resolved.stateName,
      });
    }

    for (let firstIndex = 0; firstIndex < settlements.length; firstIndex += 1) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < settlements.length;
        secondIndex += 1
      ) {
        const first = settlements[firstIndex];
        const second = settlements[secondIndex];

        if (polygonsOverlap(first.boundary, second.boundary)) {
          issues.push({
            severity: "error",
            code: "SETTLEMENT_OVERLAP",
            message: `${first.name} overlaps ${second.name} in ${resolved.stateName}.`,
            stateId: resolved.stateId,
            stateName: resolved.stateName,
            territoryId: first.id,
            territoryName: first.name,
          });
        }
      }
    }

    if (resolved.ruralCoverage < RURAL_RULES.minimumCoveragePerState) {
      issues.push({
        severity: "warning",
        code: "RURAL_COVERAGE_BELOW_TARGET",
        message: `${resolved.stateName} retains ${(resolved.ruralCoverage * 100).toFixed(
          1
        )}% rural territory; the target minimum is ${(RURAL_RULES.minimumCoveragePerState * 100).toFixed(
          0
        )}%.`,
        stateId: resolved.stateId,
        stateName: resolved.stateName,
      });
    }
  }

  if (topology.states.length !== WORLD_COUNTS.states) {
    issues.push({
      severity: "error",
      code: "TERRITORY_STATE_COUNT_MISMATCH",
      message: `Territory validation requires ${WORLD_COUNTS.states} states; received ${topology.states.length}.`,
    });
  }

  return createValidationResult(issues, layout);
}

export function createTerritorySummary(
  resolved: ResolvedStateTerritories | null
): {
  cityCount: number;
  townCount: number;
  urbanCoveragePercent: number;
  ruralCoveragePercent: number;
} {
  if (!resolved) {
    return {
      cityCount: 0,
      townCount: 0,
      urbanCoveragePercent: 0,
      ruralCoveragePercent: 0,
    };
  }

  return {
    cityCount: resolved.cities.length,
    townCount: resolved.towns.length,
    urbanCoveragePercent: resolved.urbanCoverage * 100,
    ruralCoveragePercent: resolved.ruralCoverage * 100,
  };
}
