import {
  calculateBoundingBox,
  isPointInsidePolygon,
  type LunarCoordinate,
  type LunarPolygon,
} from "./lunasphere-world-model";

export interface ParcelCell {
  parcelKey: string;
  stateName: string;

  /** Actual parcel polygon in Leaflet [y, x] format. */
  positions: [number, number][];

  /** Bounding rectangle used for viewport filtering. */
  mapX: number;
  mapY: number;
  width: number;
  height: number;

  /** Geographic center used by reservations and property markers. */
  centerX: number;
  centerY: number;

  /** Stable logical position within the state grid. */
  column: number;
  row: number;

  resolutionLevel: number;
  selectable: boolean;
}

export type ParcelExclusionTerritory = {
  id: string;
  boundary: readonly [number, number][];
};

export type ParcelGridGeometry = {
  stateBoundary: readonly [number, number][];
  excludedTerritories?: readonly ParcelExclusionTerritory[];
};

type GenerateParcelGridOptions = {
  resolutionLevel?: number;
  selectable?: boolean;
};

type GridResolution = {
  columns: number;
  rows: number;
  resolutionLevel: number;
  selectable: boolean;
};

type RectangleBounds = {
  minimumX: number;
  minimumY: number;
  maximumX: number;
  maximumY: number;
};

const GEOMETRY_EPSILON = 0.000001;
const MAXIMUM_CACHE_ENTRIES = 18;
const parcelGridCache = new Map<string, ParcelCell[]>();

function createStateSlug(stateName: string): string {
  return stateName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createParcelKey({
  stateName,
  column,
  row,
  resolutionLevel,
  selectable,
}: {
  stateName: string;
  column: number;
  row: number;
  resolutionLevel: number;
  selectable: boolean;
}): string {
  const stateSlug = createStateSlug(stateName);
  const formattedColumn = column.toString().padStart(3, "0");
  const formattedRow = row.toString().padStart(3, "0");

  /*
   * Purchasable rural parcel:
   * TYCHO-R-C001-R001
   *
   * Non-purchasable preview region:
   * TYCHO-PREVIEW-L2-C001-R001
   */
  if (selectable) {
    return `${stateSlug}-R-C${formattedColumn}-R${formattedRow}`;
  }

  return `${stateSlug}-PREVIEW-L${resolutionLevel}-C${formattedColumn}-R${formattedRow}`;
}

function createRectanglePolygon(
  mapX: number,
  mapY: number,
  width: number,
  height: number
): [number, number][] {
  return [
    [mapY, mapX],
    [mapY, mapX + width],
    [mapY + height, mapX + width],
    [mapY + height, mapX],
  ];
}

/**
 * Retained for compatibility with generic grid consumers. The authoritative
 * rural engine below uses state geometry and settlement exclusions.
 */
export function generateParcelGrid(
  stateName: string,
  startX: number,
  startY: number,
  columns: number,
  rows: number,
  cellSize: number,
  options: GenerateParcelGridOptions = {}
): ParcelCell[] {
  const parcels: ParcelCell[] = [];
  const resolutionLevel = options.resolutionLevel ?? 1;
  const selectable = options.selectable ?? false;

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const mapX = startX + columnIndex * cellSize;
      const mapY = startY + rowIndex * cellSize;
      const column = columnIndex + 1;
      const row = rowIndex + 1;

      parcels.push({
        parcelKey: createParcelKey({
          stateName,
          column,
          row,
          resolutionLevel,
          selectable,
        }),
        stateName,
        positions: createRectanglePolygon(
          mapX,
          mapY,
          cellSize,
          cellSize
        ),
        mapX,
        mapY,
        width: cellSize,
        height: cellSize,
        centerX: mapX + cellSize / 2,
        centerY: mapY + cellSize / 2,
        column,
        row,
        resolutionLevel,
        selectable,
      });
    }
  }

  return parcels;
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

function pointInsideOrOnPolygon(
  point: LunarCoordinate,
  polygon: LunarPolygon
): boolean {
  for (let index = 0; index < polygon.length; index += 1) {
    if (
      pointOnSegment(
        point,
        polygon[index],
        polygon[(index + 1) % polygon.length]
      )
    ) {
      return true;
    }
  }

  return isPointInsidePolygon(point, polygon);
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

function polygonsHaveIntersectingEdges(
  first: LunarPolygon,
  second: LunarPolygon
): boolean {
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

  return false;
}

function createRectangleSamplePoints(
  bounds: RectangleBounds
): [number, number][] {
  const centerX = (bounds.minimumX + bounds.maximumX) / 2;
  const centerY = (bounds.minimumY + bounds.maximumY) / 2;

  return [
    [bounds.minimumY, bounds.minimumX],
    [bounds.minimumY, centerX],
    [bounds.minimumY, bounds.maximumX],
    [centerY, bounds.minimumX],
    [centerY, centerX],
    [centerY, bounds.maximumX],
    [bounds.maximumY, bounds.minimumX],
    [bounds.maximumY, centerX],
    [bounds.maximumY, bounds.maximumX],
  ];
}

function pointInsideRectangle(
  point: LunarCoordinate,
  bounds: RectangleBounds
): boolean {
  return (
    point[1] >= bounds.minimumX - GEOMETRY_EPSILON &&
    point[1] <= bounds.maximumX + GEOMETRY_EPSILON &&
    point[0] >= bounds.minimumY - GEOMETRY_EPSILON &&
    point[0] <= bounds.maximumY + GEOMETRY_EPSILON
  );
}

function boundingBoxesOverlap(
  first: RectangleBounds,
  second: RectangleBounds
): boolean {
  return !(
    first.maximumX < second.minimumX - GEOMETRY_EPSILON ||
    second.maximumX < first.minimumX - GEOMETRY_EPSILON ||
    first.maximumY < second.minimumY - GEOMETRY_EPSILON ||
    second.maximumY < first.minimumY - GEOMETRY_EPSILON
  );
}

function rectangleIsFullyInsideState(
  rectangle: LunarPolygon,
  rectangleBounds: RectangleBounds,
  stateBoundary: LunarPolygon
): boolean {
  const samples = createRectangleSamplePoints(rectangleBounds);

  if (
    !samples.every((point) =>
      pointInsideOrOnPolygon(point, stateBoundary)
    )
  ) {
    return false;
  }

  /*
   * Sample containment catches ordinary boundary cells. Edge intersection
   * detection also rejects cells spanning a narrow concavity in an irregular
   * state, even when all sampled points happen to lie inside.
   */
  return !polygonsHaveIntersectingEdges(rectangle, stateBoundary);
}

function rectangleOverlapsExcludedTerritory(
  rectangle: LunarPolygon,
  rectangleBounds: RectangleBounds,
  territoryBoundary: LunarPolygon,
  territoryBounds: RectangleBounds
): boolean {
  if (!boundingBoxesOverlap(rectangleBounds, territoryBounds)) {
    return false;
  }

  if (
    createRectangleSamplePoints(rectangleBounds).some((point) =>
      pointInsideOrOnPolygon(point, territoryBoundary)
    )
  ) {
    return true;
  }

  if (
    territoryBoundary.some((point) =>
      pointInsideRectangle(point, rectangleBounds)
    )
  ) {
    return true;
  }

  return polygonsHaveIntersectingEdges(rectangle, territoryBoundary);
}

function getGridResolutionForZoom(
  zoom: number
): GridResolution | null {
  if (zoom < 5) {
    return null;
  }

  if (zoom < 6) {
    return {
      columns: 16,
      rows: 16,
      resolutionLevel: 2,
      selectable: false,
    };
  }

  if (zoom < 7) {
    return {
      columns: 32,
      rows: 32,
      resolutionLevel: 3,
      selectable: false,
    };
  }

  return {
    columns: 64,
    rows: 64,
    resolutionLevel: 4,
    selectable: true,
  };
}

function createGeometrySignature(
  stateBoundary: LunarPolygon,
  excludedTerritories: readonly ParcelExclusionTerritory[]
): string {
  const serializePolygon = (polygon: LunarPolygon) =>
    polygon
      .map(([y, x]) => `${y.toFixed(4)},${x.toFixed(4)}`)
      .join(";");

  return [
    serializePolygon(stateBoundary),
    ...excludedTerritories
      .map(
        (territory) =>
          `${territory.id}:${serializePolygon(territory.boundary)}`
      )
      .sort(),
  ].join("|");
}

function rememberCachedGrid(
  cacheKey: string,
  parcels: ParcelCell[]
): void {
  parcelGridCache.set(cacheKey, parcels);

  while (parcelGridCache.size > MAXIMUM_CACHE_ENTRIES) {
    const oldestKey = parcelGridCache.keys().next().value;

    if (typeof oldestKey !== "string") {
      break;
    }

    parcelGridCache.delete(oldestKey);
  }
}

function generateRuralParcelGrid(
  stateName: string,
  stateBoundary: LunarPolygon,
  excludedTerritories: readonly ParcelExclusionTerritory[],
  resolution: GridResolution
): ParcelCell[] {
  if (stateBoundary.length < 3) {
    return [];
  }

  const stateBounds = calculateBoundingBox(stateBoundary);
  const stateWidth = stateBounds.maximumX - stateBounds.minimumX;
  const stateHeight = stateBounds.maximumY - stateBounds.minimumY;
  const gridSize = Math.max(stateWidth, stateHeight);

  if (gridSize <= GEOMETRY_EPSILON) {
    return [];
  }

  /*
   * Every resolution uses the same square state-relative domain. This keeps
   * preview cells aligned with selectable cells and avoids distorted parcels
   * in states whose bounding boxes are wider than they are tall (or vice versa).
   */
  const gridStartX =
    (stateBounds.minimumX + stateBounds.maximumX - gridSize) / 2;
  const gridStartY =
    (stateBounds.minimumY + stateBounds.maximumY - gridSize) / 2;
  const cellSize = gridSize / resolution.columns;
  const exclusionGeometry = excludedTerritories
    .filter((territory) => territory.boundary.length >= 3)
    .map((territory) => ({
      territory,
      bounds: calculateBoundingBox(territory.boundary),
    }));
  const parcels: ParcelCell[] = [];

  for (let rowIndex = 0; rowIndex < resolution.rows; rowIndex += 1) {
    for (
      let columnIndex = 0;
      columnIndex < resolution.columns;
      columnIndex += 1
    ) {
      const mapX = gridStartX + columnIndex * cellSize;
      const mapY = gridStartY + rowIndex * cellSize;
      const rectangleBounds: RectangleBounds = {
        minimumX: mapX,
        minimumY: mapY,
        maximumX: mapX + cellSize,
        maximumY: mapY + cellSize,
      };
      const positions = createRectanglePolygon(
        mapX,
        mapY,
        cellSize,
        cellSize
      );

      if (
        !rectangleIsFullyInsideState(
          positions,
          rectangleBounds,
          stateBoundary
        )
      ) {
        continue;
      }

      const overlapsExcludedTerritory = exclusionGeometry.some(
        ({ territory, bounds }) =>
          rectangleOverlapsExcludedTerritory(
            positions,
            rectangleBounds,
            territory.boundary,
            bounds
          )
      );

      if (overlapsExcludedTerritory) {
        continue;
      }

      const column = columnIndex + 1;
      const row = rowIndex + 1;

      parcels.push({
        parcelKey: createParcelKey({
          stateName,
          column,
          row,
          resolutionLevel: resolution.resolutionLevel,
          selectable: resolution.selectable,
        }),
        stateName,
        positions,
        mapX,
        mapY,
        width: cellSize,
        height: cellSize,
        centerX: mapX + cellSize / 2,
        centerY: mapY + cellSize / 2,
        column,
        row,
        resolutionLevel: resolution.resolutionLevel,
        selectable: resolution.selectable,
      });
    }
  }

  return parcels;
}

export function getParcelGridForZoom(
  stateName: string,
  zoom: number,
  geometry: ParcelGridGeometry
): ParcelCell[] {
  const resolution = getGridResolutionForZoom(zoom);

  if (!resolution || geometry.stateBoundary.length < 3) {
    return [];
  }

  const excludedTerritories = geometry.excludedTerritories ?? [];
  const geometrySignature = createGeometrySignature(
    geometry.stateBoundary,
    excludedTerritories
  );
  const cacheKey = [
    stateName.trim().toLowerCase(),
    resolution.resolutionLevel,
    geometrySignature,
  ].join(":");
  const cachedGrid = parcelGridCache.get(cacheKey);

  if (cachedGrid) {
    /* Refresh insertion order so frequently used states remain cached. */
    parcelGridCache.delete(cacheKey);
    parcelGridCache.set(cacheKey, cachedGrid);
    return cachedGrid;
  }

  const generatedGrid = generateRuralParcelGrid(
    stateName,
    geometry.stateBoundary,
    excludedTerritories,
    resolution
  );

  rememberCachedGrid(cacheKey, generatedGrid);
  return generatedGrid;
}

export function getSelectableRuralParcelByKey(
  stateName: string,
  parcelKey: string,
  geometry: ParcelGridGeometry
): ParcelCell | null {
  return (
    getParcelGridForZoom(stateName, 7, geometry).find(
      (parcel) => parcel.parcelKey === parcelKey
    ) ?? null
  );
}

export function findParcelAtCoordinate(
  parcels: ParcelCell[],
  x: number,
  y: number
): ParcelCell | null {
  const point: LunarCoordinate = [y, x];

  return (
    parcels.find((parcel) =>
      pointInsideOrOnPolygon(point, parcel.positions)
    ) ?? null
  );
}

/** Useful after geography editing or hot reloading. */
export function clearParcelGridCache(): void {
  parcelGridCache.clear();
}
