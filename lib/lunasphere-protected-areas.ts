import { lunarAttractions } from "./lunar-attractions";
import {
  calculateBoundingBox,
  calculatePolygonArea,
  createSlug,
  isPointInsidePolygon,
  type LunarCoordinate,
  type LunarPolygon,
  type MutableLunarCoordinate,
} from "./lunasphere-world-model";
import {
  constrainStateRelativeCoordinate,
  convertLunarCoordinateToStateRelative,
  createInitialTerritoryLayout,
  resolveStateRelativeCoordinate,
  resolveStateTerritories,
  type MutableStateRelativeCoordinate,
  type StateRelativeCoordinate,
} from "./lunasphere-territories";
import {
  getStateBoundaryFromTopology,
  getTopologyState,
  type LunaSphereTopology,
  type LunaSphereTopologyState,
  type LunaSphereTopologyStatus,
} from "./lunasphere-topology";

export const PROTECTED_AREA_CATEGORIES = [
  "Historic Site",
  "Landmark",
  "Scientific Preserve",
  "Reserved Area",
] as const;

export type LunaSphereProtectedAreaCategory =
  (typeof PROTECTED_AREA_CATEGORIES)[number];

export type LunaSphereProtectedAreaDefinition = {
  id: string;
  stateId: string;
  stateName: string;
  stateNumber: number;
  name: string;
  slug: string;
  category: LunaSphereProtectedAreaCategory;
  description: string;
  attractionId: string | null;
  center: MutableStateRelativeCoordinate;
  boundary: MutableStateRelativeCoordinate[];
  minZoom: number;
};

export type LunaSphereProtectedAreaLayout = {
  id: string;
  worldId: string;
  worldVersion: string;
  schemaVersion: number;
  revision: number;
  status: LunaSphereTopologyStatus;
  areas: LunaSphereProtectedAreaDefinition[];
};

export type ResolvedLunaSphereProtectedArea = Omit<
  LunaSphereProtectedAreaDefinition,
  "center" | "boundary"
> & {
  center: MutableLunarCoordinate;
  boundary: MutableLunarCoordinate[];
  area: number;
};

export type ProtectedAreaValidationIssue = {
  severity: "error" | "warning" | "information";
  code: string;
  message: string;
  areaId?: string;
  areaName?: string;
  stateName?: string;
};

export type ProtectedAreaValidationResult = {
  valid: boolean;
  errors: ProtectedAreaValidationIssue[];
  warnings: ProtectedAreaValidationIssue[];
  information: ProtectedAreaValidationIssue[];
  issueCount: number;
  areaCount: number;
};

const GEOMETRY_EPSILON = 0.000001;
const DEFAULT_RADIUS = 0.065;
const MINIMUM_BOUNDARY_POINTS = 4;

const INITIAL_AREA_CONFIG: Record<
  string,
  {
    category: LunaSphereProtectedAreaCategory;
    radius: number;
    description?: string;
  }
> = {
  apollo11: {
    category: "Historic Site",
    radius: 0.045,
  },
  tycho: {
    category: "Landmark",
    radius: 0.085,
  },
  copernicus: {
    category: "Landmark",
    radius: 0.08,
  },
  plato: {
    category: "Scientific Preserve",
    radius: 0.07,
  },
  maretranquillitatis: {
    category: "Scientific Preserve",
    radius: 0.1,
  },
  montesapenninus: {
    category: "Landmark",
    radius: 0.075,
  },
};

function round(value: number): number {
  return Number(value.toFixed(6));
}

function createIrregularBoundary(
  center: StateRelativeCoordinate,
  radius: number,
  seed: number,
  pointCount = 8
): MutableStateRelativeCoordinate[] {
  return Array.from({ length: pointCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / pointCount;
    const variation =
      1 +
      Math.sin((seed + 1) * (index + 2) * 1.618) * 0.12 +
      Math.cos((seed + 3) * (index + 1) * 0.73) * 0.06;

    return constrainStateRelativeCoordinate([
      center[0] + Math.sin(angle) * radius * variation,
      center[1] + Math.cos(angle) * radius * variation,
    ]);
  });
}

function createAreaId(stateNumber: number, attractionId: string): string {
  return `LUNA-PROTECTED-S${stateNumber.toString().padStart(2, "0")}-${attractionId
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")}`;
}

function findProtectedAreaState(
  topology: LunaSphereTopology,
  coordinate: LunarCoordinate,
  preferredStateName: string
): LunaSphereTopologyState | null {
  const preferredState = getTopologyState(topology, preferredStateName);

  if (preferredState) {
    const preferredBoundary = getStateBoundaryFromTopology(
      topology,
      preferredState.id
    );

    if (isPointInsidePolygon(coordinate, preferredBoundary)) {
      return preferredState;
    }
  }

  const containingStates = topology.states.filter((state) =>
    isPointInsidePolygon(
      coordinate,
      getStateBoundaryFromTopology(topology, state.id)
    )
  );

  if (containingStates.length > 0) {
    return containingStates.reduce((closest, state) => {
      const closestDistance = Math.hypot(
        closest.labelPosition[0] - coordinate[0],
        closest.labelPosition[1] - coordinate[1]
      );
      const stateDistance = Math.hypot(
        state.labelPosition[0] - coordinate[0],
        state.labelPosition[1] - coordinate[1]
      );

      return stateDistance < closestDistance ? state : closest;
    });
  }

  if (preferredState) {
    return preferredState;
  }

  return (
    topology.states.reduce<LunaSphereTopologyState | null>(
      (closest, state) => {
        if (!closest) {
          return state;
        }

        const closestDistance = Math.hypot(
          closest.labelPosition[0] - coordinate[0],
          closest.labelPosition[1] - coordinate[1]
        );
        const stateDistance = Math.hypot(
          state.labelPosition[0] - coordinate[0],
          state.labelPosition[1] - coordinate[1]
        );

        return stateDistance < closestDistance ? state : closest;
      },
      null
    ) ?? null
  );
}

function createInitialArea(
  topology: LunaSphereTopology,
  attractionIndex: number
): LunaSphereProtectedAreaDefinition | null {
  const attraction = lunarAttractions[attractionIndex];
  const config = INITIAL_AREA_CONFIG[attraction.id];
  const attractionCoordinate: LunarCoordinate = [
    attraction.y,
    attraction.x,
  ];
  const topologyState = config
    ? findProtectedAreaState(
        topology,
        attractionCoordinate,
        attraction.state
      )
    : null;

  if (!topologyState || !config) {
    return null;
  }

  const resolvedState = resolveStateTerritories(
    topology,
    createInitialTerritoryLayout(),
    topologyState.name
  );

  if (!resolvedState) {
    return null;
  }

  const relativeCenter = convertLunarCoordinateToStateRelative(
    attractionCoordinate,
    resolvedState.stateBoundary,
    resolvedState.interiorOrigin
  );
  const center = constrainStateRelativeCoordinate(relativeCenter);

  return {
    id: createAreaId(topologyState.stateNumber, attraction.id),
    stateId: topologyState.id,
    stateName: topologyState.name,
    stateNumber: topologyState.stateNumber,
    name: `${attraction.name} Protected Zone`,
    slug: createSlug(`${attraction.name} Protected Zone`),
    category: config.category,
    description: config.description ?? attraction.description,
    attractionId: attraction.id,
    center,
    boundary: createIrregularBoundary(
      center,
      config.radius,
      attractionIndex + 7
    ),
    minZoom: Math.max(attraction.minZoom ?? 3, 3),
  };
}

export function createInitialProtectedAreaLayout(
  topology: LunaSphereTopology
): LunaSphereProtectedAreaLayout {
  return {
    id: "lunasphere-protected-areas-v1",
    worldId: topology.worldId,
    worldVersion: topology.worldVersion,
    schemaVersion: 1,
    revision: 1,
    status: topology.status,
    areas: lunarAttractions
      .map((_, index) => createInitialArea(topology, index))
      .filter(
        (area): area is LunaSphereProtectedAreaDefinition => Boolean(area)
      ),
  };
}

export function cloneProtectedAreaLayout(
  layout: LunaSphereProtectedAreaLayout
): LunaSphereProtectedAreaLayout {
  return {
    ...layout,
    areas: layout.areas.map((area) => ({
      ...area,
      center: [area.center[0], area.center[1]],
      boundary: area.boundary.map(
        ([y, x]) => [y, x] as MutableStateRelativeCoordinate
      ),
    })),
  };
}

export function getProtectedAreasForState(
  layout: LunaSphereProtectedAreaLayout,
  stateName: string
): LunaSphereProtectedAreaDefinition[] {
  const normalized = stateName.trim().toLowerCase();
  return layout.areas.filter(
    (area) => area.stateName.toLowerCase() === normalized
  );
}

export function getProtectedAreaDefinition(
  layout: LunaSphereProtectedAreaLayout,
  areaId: string
): LunaSphereProtectedAreaDefinition | null {
  return layout.areas.find((area) => area.id === areaId) ?? null;
}

export function resolveProtectedAreasForState(
  topology: LunaSphereTopology,
  layout: LunaSphereProtectedAreaLayout,
  stateName: string
): ResolvedLunaSphereProtectedArea[] {
  const resolvedState = resolveStateTerritories(
    topology,
    createInitialTerritoryLayout(),
    stateName
  );

  if (!resolvedState) {
    return [];
  }

  return getProtectedAreasForState(layout, stateName).map((area) => {
    const boundary = area.boundary.map((coordinate) =>
      resolveStateRelativeCoordinate(
        coordinate,
        resolvedState.stateBoundary,
        resolvedState.interiorOrigin
      )
    );
    const center = resolveStateRelativeCoordinate(
      area.center,
      resolvedState.stateBoundary,
      resolvedState.interiorOrigin
    );

    return {
      ...area,
      center,
      boundary,
      area: calculatePolygonArea(boundary),
    };
  });
}

export function resolveAllProtectedAreas(
  topology: LunaSphereTopology,
  layout: LunaSphereProtectedAreaLayout
): ResolvedLunaSphereProtectedArea[] {
  return topology.states.flatMap((state) =>
    resolveProtectedAreasForState(topology, layout, state.name)
  );
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
  const a = orientation(firstStart, firstEnd, secondStart);
  const b = orientation(firstStart, firstEnd, secondEnd);
  const c = orientation(secondStart, secondEnd, firstStart);
  const d = orientation(secondStart, secondEnd, firstEnd);

  if (a * b < 0 && c * d < 0) {
    return true;
  }

  return (
    pointOnSegment(secondStart, firstStart, firstEnd) ||
    pointOnSegment(secondEnd, firstStart, firstEnd) ||
    pointOnSegment(firstStart, secondStart, secondEnd) ||
    pointOnSegment(firstEnd, secondStart, secondEnd)
  );
}

function polygonSelfIntersects(polygon: LunarPolygon): boolean {
  for (let firstIndex = 0; firstIndex < polygon.length; firstIndex += 1) {
    const firstEndIndex = (firstIndex + 1) % polygon.length;

    for (
      let secondIndex = firstIndex + 1;
      secondIndex < polygon.length;
      secondIndex += 1
    ) {
      const secondEndIndex = (secondIndex + 1) % polygon.length;

      if (
        firstIndex === secondIndex ||
        firstEndIndex === secondIndex ||
        secondEndIndex === firstIndex
      ) {
        continue;
      }

      if (
        segmentsIntersect(
          polygon[firstIndex],
          polygon[firstEndIndex],
          polygon[secondIndex],
          polygon[secondEndIndex]
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

function polygonsOverlap(first: LunarPolygon, second: LunarPolygon): boolean {
  const firstBounds = calculateBoundingBox(first);
  const secondBounds = calculateBoundingBox(second);

  if (
    firstBounds.maximumX < secondBounds.minimumX ||
    secondBounds.maximumX < firstBounds.minimumX ||
    firstBounds.maximumY < secondBounds.minimumY ||
    secondBounds.maximumY < firstBounds.minimumY
  ) {
    return false;
  }

  if (first.some((point) => isPointInsidePolygon(point, second))) {
    return true;
  }

  if (second.some((point) => isPointInsidePolygon(point, first))) {
    return true;
  }

  for (let firstIndex = 0; firstIndex < first.length; firstIndex += 1) {
    for (let secondIndex = 0; secondIndex < second.length; secondIndex += 1) {
      if (
        segmentsIntersect(
          first[firstIndex],
          first[(firstIndex + 1) % first.length],
          second[secondIndex],
          second[(secondIndex + 1) % second.length]
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

export function validateProtectedAreaLayout(
  topology: LunaSphereTopology,
  layout: LunaSphereProtectedAreaLayout
): ProtectedAreaValidationResult {
  const issues: ProtectedAreaValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const area of layout.areas) {
    if (seenIds.has(area.id)) {
      issues.push({
        severity: "error",
        code: "PROTECTED_AREA_DUPLICATE_ID",
        message: `Protected area ID ${area.id} is duplicated.`,
        areaId: area.id,
        areaName: area.name,
        stateName: area.stateName,
      });
      continue;
    }

    seenIds.add(area.id);

    const topologyState = getTopologyState(topology, area.stateName);

    if (!topologyState || topologyState.id !== area.stateId) {
      issues.push({
        severity: "error",
        code: "PROTECTED_AREA_STATE_MISSING",
        message: `${area.name} references an unavailable parent state.`,
        areaId: area.id,
        areaName: area.name,
        stateName: area.stateName,
      });
      continue;
    }

    if (!PROTECTED_AREA_CATEGORIES.includes(area.category)) {
      issues.push({
        severity: "error",
        code: "PROTECTED_AREA_CATEGORY_INVALID",
        message: `${area.name} has an unsupported protected-area category.`,
        areaId: area.id,
        areaName: area.name,
        stateName: area.stateName,
      });
    }

    if (area.boundary.length < MINIMUM_BOUNDARY_POINTS) {
      issues.push({
        severity: "error",
        code: "PROTECTED_AREA_BOUNDARY_TOO_SMALL",
        message: `${area.name} requires at least ${MINIMUM_BOUNDARY_POINTS} boundary points.`,
        areaId: area.id,
        areaName: area.name,
        stateName: area.stateName,
      });
    }

    if (area.boundary.some(([y, x]) => !Number.isFinite(y) || !Number.isFinite(x))) {
      issues.push({
        severity: "error",
        code: "PROTECTED_AREA_COORDINATE_INVALID",
        message: `${area.name} contains an invalid coordinate.`,
        areaId: area.id,
        areaName: area.name,
        stateName: area.stateName,
      });
    }

    const resolved = resolveProtectedAreasForState(
      topology,
      layout,
      area.stateName
    ).find((candidate) => candidate.id === area.id);
    const resolvedState = resolveStateTerritories(
      topology,
      createInitialTerritoryLayout(),
      area.stateName
    );

    if (!resolved || !resolvedState) {
      continue;
    }

    if (
      !isPointInsidePolygon(resolved.center, resolvedState.stateBoundary) ||
      resolved.boundary.some(
        (point) => !isPointInsidePolygon(point, resolvedState.stateBoundary)
      )
    ) {
      issues.push({
        severity: "error",
        code: "PROTECTED_AREA_OUTSIDE_STATE",
        message: `${area.name} must remain completely inside ${area.stateName}.`,
        areaId: area.id,
        areaName: area.name,
        stateName: area.stateName,
      });
    }

    if (polygonSelfIntersects(resolved.boundary)) {
      issues.push({
        severity: "error",
        code: "PROTECTED_AREA_SELF_INTERSECTION",
        message: `${area.name} has a self-intersecting boundary.`,
        areaId: area.id,
        areaName: area.name,
        stateName: area.stateName,
      });
    }

    if (resolved.area < 2) {
      issues.push({
        severity: "warning",
        code: "PROTECTED_AREA_VERY_SMALL",
        message: `${area.name} is unusually small and should be reviewed.`,
        areaId: area.id,
        areaName: area.name,
        stateName: area.stateName,
      });
    }
  }

  for (const state of topology.states) {
    const areas = resolveProtectedAreasForState(
      topology,
      layout,
      state.name
    );

    for (let firstIndex = 0; firstIndex < areas.length; firstIndex += 1) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < areas.length;
        secondIndex += 1
      ) {
        if (polygonsOverlap(areas[firstIndex].boundary, areas[secondIndex].boundary)) {
          issues.push({
            severity: "error",
            code: "PROTECTED_AREAS_OVERLAP",
            message: `${areas[firstIndex].name} overlaps ${areas[secondIndex].name}.`,
            areaId: areas[firstIndex].id,
            areaName: areas[firstIndex].name,
            stateName: state.name,
          });
        }
      }
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const information = issues.filter(
    (issue) => issue.severity === "information"
  );

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    information,
    issueCount: issues.length,
    areaCount: layout.areas.length,
  };
}

type EditOptions = { incrementRevision?: boolean };

function coordinatesEqual(
  first: StateRelativeCoordinate,
  second: StateRelativeCoordinate
): boolean {
  return (
    Math.abs(first[0] - second[0]) <= GEOMETRY_EPSILON &&
    Math.abs(first[1] - second[1]) <= GEOMETRY_EPSILON
  );
}

function updateArea(
  layout: LunaSphereProtectedAreaLayout,
  areaId: string,
  update: (
    area: LunaSphereProtectedAreaDefinition
  ) => LunaSphereProtectedAreaDefinition,
  options: EditOptions = {}
): LunaSphereProtectedAreaLayout {
  let changed = false;
  const areas = layout.areas.map((area) => {
    if (area.id !== areaId) {
      return area;
    }

    const next = update(area);
    changed = next !== area;
    return next;
  });

  if (!changed) {
    return layout;
  }

  return {
    ...layout,
    revision:
      options.incrementRevision === false
        ? layout.revision
        : layout.revision + 1,
    areas,
  };
}

function translateArea(
  area: LunaSphereProtectedAreaDefinition,
  requestedCenter: StateRelativeCoordinate
): {
  center: MutableStateRelativeCoordinate;
  boundary: MutableStateRelativeCoordinate[];
} {
  const target = constrainStateRelativeCoordinate(requestedCenter);
  const delta: MutableStateRelativeCoordinate = [
    target[0] - area.center[0],
    target[1] - area.center[1],
  ];

  function fits(fraction: number): boolean {
    return area.boundary.every((point) => {
      const y = point[0] + delta[0] * fraction;
      const x = point[1] + delta[1] * fraction;
      return Math.hypot(y, x) <= 0.91;
    });
  }

  let fraction = 1;

  if (!fits(1)) {
    let low = 0;
    let high = 1;

    for (let index = 0; index < 30; index += 1) {
      const middle = (low + high) / 2;
      if (fits(middle)) low = middle;
      else high = middle;
    }

    fraction = low;
  }

  return {
    center: [
      round(area.center[0] + delta[0] * fraction),
      round(area.center[1] + delta[1] * fraction),
    ],
    boundary: area.boundary.map((point) => [
      round(point[0] + delta[0] * fraction),
      round(point[1] + delta[1] * fraction),
    ]),
  };
}

export function moveProtectedAreaCenter(
  layout: LunaSphereProtectedAreaLayout,
  areaId: string,
  coordinate: StateRelativeCoordinate,
  options: EditOptions = {}
): LunaSphereProtectedAreaLayout {
  return updateArea(
    layout,
    areaId,
    (area) => {
      const translated = translateArea(area, coordinate);
      return coordinatesEqual(translated.center, area.center)
        ? area
        : { ...area, ...translated };
    },
    options
  );
}

export function moveProtectedAreaBoundaryPoint(
  layout: LunaSphereProtectedAreaLayout,
  areaId: string,
  pointIndex: number,
  coordinate: StateRelativeCoordinate,
  options: EditOptions = {}
): LunaSphereProtectedAreaLayout {
  return updateArea(
    layout,
    areaId,
    (area) => {
      if (pointIndex < 0 || pointIndex >= area.boundary.length) {
        return area;
      }

      const normalized = constrainStateRelativeCoordinate(coordinate);
      if (coordinatesEqual(area.boundary[pointIndex], normalized)) {
        return area;
      }

      return {
        ...area,
        boundary: area.boundary.map((point, index) =>
          index === pointIndex
            ? normalized
            : [point[0], point[1]]
        ),
      };
    },
    options
  );
}

export function insertProtectedAreaBoundaryPoint(
  layout: LunaSphereProtectedAreaLayout,
  areaId: string,
  segmentIndex: number
): LunaSphereProtectedAreaLayout {
  return updateArea(layout, areaId, (area) => {
    if (segmentIndex < 0 || segmentIndex >= area.boundary.length) {
      return area;
    }

    const start = area.boundary[segmentIndex];
    const end = area.boundary[(segmentIndex + 1) % area.boundary.length];
    const midpoint = constrainStateRelativeCoordinate([
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
    ]);

    return {
      ...area,
      boundary: [
        ...area.boundary.slice(0, segmentIndex + 1),
        midpoint,
        ...area.boundary.slice(segmentIndex + 1),
      ],
    };
  });
}

export function removeProtectedAreaBoundaryPoint(
  layout: LunaSphereProtectedAreaLayout,
  areaId: string,
  pointIndex: number
): LunaSphereProtectedAreaLayout {
  return updateArea(layout, areaId, (area) => {
    if (
      area.boundary.length <= MINIMUM_BOUNDARY_POINTS ||
      pointIndex < 0 ||
      pointIndex >= area.boundary.length
    ) {
      return area;
    }

    return {
      ...area,
      boundary: area.boundary.filter((_, index) => index !== pointIndex),
    };
  });
}

export function updateProtectedAreaMetadata(
  layout: LunaSphereProtectedAreaLayout,
  areaId: string,
  input: Partial<
    Pick<
      LunaSphereProtectedAreaDefinition,
      "name" | "category" | "description" | "minZoom"
    >
  >
): LunaSphereProtectedAreaLayout {
  return updateArea(layout, areaId, (area) => {
    const name = input.name?.trim() || area.name;
    const category = input.category ?? area.category;
    const description = input.description ?? area.description;
    const minZoom = Math.max(0, Math.min(7, input.minZoom ?? area.minZoom));

    if (
      name === area.name &&
      category === area.category &&
      description === area.description &&
      minZoom === area.minZoom
    ) {
      return area;
    }

    return {
      ...area,
      name,
      slug: createSlug(name),
      category,
      description,
      minZoom,
    };
  });
}

export function addProtectedArea(
  topology: LunaSphereTopology,
  layout: LunaSphereProtectedAreaLayout,
  stateName: string,
  category: LunaSphereProtectedAreaCategory = "Reserved Area"
): LunaSphereProtectedAreaLayout {
  const state = getTopologyState(topology, stateName);

  if (!state) {
    return layout;
  }

  const existing = getProtectedAreasForState(layout, stateName);
  let sequence = existing.length + 1;
  let id = `LUNA-PROTECTED-S${state.stateNumber
    .toString()
    .padStart(2, "0")}-${sequence.toString().padStart(3, "0")}`;

  while (layout.areas.some((area) => area.id === id)) {
    sequence += 1;
    id = `LUNA-PROTECTED-S${state.stateNumber
      .toString()
      .padStart(2, "0")}-${sequence.toString().padStart(3, "0")}`;
  }

  const center: MutableStateRelativeCoordinate = [0, 0];
  const name = `${state.name} Protected Area ${sequence}`;

  return {
    ...layout,
    revision: layout.revision + 1,
    areas: [
      ...layout.areas,
      {
        id,
        stateId: state.id,
        stateName: state.name,
        stateNumber: state.stateNumber,
        name,
        slug: createSlug(name),
        category,
        description:
          "Administrative protected territory reserved from property inventory.",
        attractionId: null,
        center,
        boundary: createIrregularBoundary(center, DEFAULT_RADIUS, sequence + 31),
        minZoom: 3,
      },
    ],
  };
}

export function deleteProtectedArea(
  layout: LunaSphereProtectedAreaLayout,
  areaId: string
): LunaSphereProtectedAreaLayout {
  if (!layout.areas.some((area) => area.id === areaId)) {
    return layout;
  }

  return {
    ...layout,
    revision: layout.revision + 1,
    areas: layout.areas.filter((area) => area.id !== areaId),
  };
}

export function restoreProtectedArea(
  topology: LunaSphereTopology,
  layout: LunaSphereProtectedAreaLayout,
  areaId: string
): LunaSphereProtectedAreaLayout {
  const baseline = createInitialProtectedAreaLayout(topology);
  const baselineArea = baseline.areas.find((area) => area.id === areaId);

  if (!baselineArea) {
    return layout;
  }

  return updateArea(layout, areaId, () => ({
    ...baselineArea,
    center: [baselineArea.center[0], baselineArea.center[1]],
    boundary: baselineArea.boundary.map(([y, x]) => [y, x]),
  }));
}

export function restoreStateProtectedAreas(
  topology: LunaSphereTopology,
  layout: LunaSphereProtectedAreaLayout,
  stateName: string
): LunaSphereProtectedAreaLayout {
  const baseline = createInitialProtectedAreaLayout(topology);
  const normalized = stateName.toLowerCase();
  const preserved = layout.areas.filter(
    (area) => area.stateName.toLowerCase() !== normalized
  );
  const restored = baseline.areas.filter(
    (area) => area.stateName.toLowerCase() === normalized
  );

  return {
    ...layout,
    revision: layout.revision + 1,
    areas: [
      ...preserved,
      ...restored.map((area) => ({
        ...area,
        center: [area.center[0], area.center[1]] as MutableStateRelativeCoordinate,
        boundary: area.boundary.map(
          ([y, x]) => [y, x] as MutableStateRelativeCoordinate
        ),
      })),
    ],
  };
}
