import {
  getHierarchicalGridCoordinates,
  getInventoryGridIndexRange,
  LUNASPHERE_INVENTORY_GRID,
  LUNASPHERE_INVENTORY_GRID_VERSION,
  LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
  LUNASPHERE_SALEABLE_INVENTORY_ZOOM,
  type InventoryViewportBounds,
} from "./inventory-grid";
import {
  calculateBoundingBox,
  isPointInsidePolygon,
  type LunarCoordinate,
  type LunarPolygon,
} from "./lunasphere-world-model";

export interface ParcelCell {
  parcelKey: string;
  stateName: string;
  propertyType?: "Rural Acre" | "City Block" | "Town Block";
  price?: number;
  sizeLabel?: string;
  cityId?: string;
  cityName?: string;
  townId?: string;
  townName?: string;

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

  /** Stable logical position within the active grid. */
  column: number;
  row: number;

  /** Inventory Grid V2 hierarchy for selectable properties. */
  gridVersion?: number;
  planningColumn?: number;
  planningRow?: number;
  subdivisionColumn?: number;
  subdivisionRow?: number;

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

export type ParsedRuralParcelKey = {
  stateSlug: string;
  planningColumn: number;
  planningRow: number;
  subdivisionColumn: number;
  subdivisionRow: number;
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
  planningColumn,
  planningRow,
  subdivisionColumn,
  subdivisionRow,
}: {
  stateName: string;
  column: number;
  row: number;
  resolutionLevel: number;
  selectable: boolean;
  planningColumn?: number;
  planningRow?: number;
  subdivisionColumn?: number;
  subdivisionRow?: number;
}): string {
  const stateSlug = createStateSlug(stateName);
  const formattedColumn = column.toString().padStart(3, "0");
  const formattedRow = row.toString().padStart(3, "0");

  if (
    selectable &&
    planningColumn &&
    planningRow &&
    subdivisionColumn &&
    subdivisionRow
  ) {
    return `${stateSlug}-R-C${planningColumn
      .toString()
      .padStart(3, "0")}-R${planningRow
      .toString()
      .padStart(3, "0")}-SC${subdivisionColumn
      .toString()
      .padStart(2, "0")}-SR${subdivisionRow
      .toString()
      .padStart(2, "0")}`;
  }

  return `${stateSlug}-PREVIEW-L${resolutionLevel}-C${formattedColumn}-R${formattedRow}`;
}

export function parseRuralParcelKey(
  parcelKey: string
): ParsedRuralParcelKey | null {
  const match = parcelKey
    .trim()
    .toUpperCase()
    .match(
      /^(.*)-R-C(\d{3})-R(\d{3})-SC(\d{2})-SR(\d{2})$/
    );

  if (!match) {
    return null;
  }

  const parsed: ParsedRuralParcelKey = {
    stateSlug: match[1],
    planningColumn: Number(match[2]),
    planningRow: Number(match[3]),
    subdivisionColumn: Number(match[4]),
    subdivisionRow: Number(match[5]),
  };

  if (
    parsed.planningColumn < 1 ||
    parsed.planningColumn > LUNASPHERE_INVENTORY_GRID.ruralPlanningColumns ||
    parsed.planningRow < 1 ||
    parsed.planningRow > LUNASPHERE_INVENTORY_GRID.ruralPlanningRows ||
    parsed.subdivisionColumn < 1 ||
    parsed.subdivisionColumn > LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR ||
    parsed.subdivisionRow < 1 ||
    parsed.subdivisionRow > LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR
  ) {
    return null;
  }

  return parsed;
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
        propertyType: "Rural Acre",
        price: 24.95,
        sizeLabel: "1 Acre",
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

  if (zoom < LUNASPHERE_SALEABLE_INVENTORY_ZOOM) {
    return {
      columns: LUNASPHERE_INVENTORY_GRID.ruralPlanningColumns,
      rows: LUNASPHERE_INVENTORY_GRID.ruralPlanningRows,
      resolutionLevel: 4,
      selectable: false,
    };
  }

  return {
    columns:
      LUNASPHERE_INVENTORY_GRID.ruralPlanningColumns *
      LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
    rows:
      LUNASPHERE_INVENTORY_GRID.ruralPlanningRows *
      LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
    resolutionLevel: 5,
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
  resolution: GridResolution,
  viewportBounds?: InventoryViewportBounds | null
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
  const indexRange = getInventoryGridIndexRange({
    gridStartX,
    gridStartY,
    cellWidth: cellSize,
    cellHeight: cellSize,
    columns: resolution.columns,
    rows: resolution.rows,
    viewportBounds,
  });

  for (
    let rowIndex = indexRange.startRowIndex;
    rowIndex <= indexRange.endRowIndex;
    rowIndex += 1
  ) {
    for (
      let columnIndex = indexRange.startColumnIndex;
      columnIndex <= indexRange.endColumnIndex;
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
      const columnHierarchy = resolution.selectable
        ? getHierarchicalGridCoordinates(columnIndex)
        : null;
      const rowHierarchy = resolution.selectable
        ? getHierarchicalGridCoordinates(rowIndex)
        : null;

      parcels.push({
        parcelKey: createParcelKey({
          stateName,
          column,
          row,
          resolutionLevel: resolution.resolutionLevel,
          selectable: resolution.selectable,
          planningColumn: columnHierarchy?.planningIndex,
          planningRow: rowHierarchy?.planningIndex,
          subdivisionColumn: columnHierarchy?.subdivisionIndex,
          subdivisionRow: rowHierarchy?.subdivisionIndex,
        }),
        stateName,
        propertyType: "Rural Acre",
        price: 24.95,
        sizeLabel: "1 Acre",
        positions,
        mapX,
        mapY,
        width: cellSize,
        height: cellSize,
        centerX: mapX + cellSize / 2,
        centerY: mapY + cellSize / 2,
        column,
        row,
        gridVersion: resolution.selectable
          ? LUNASPHERE_INVENTORY_GRID_VERSION
          : undefined,
        planningColumn: columnHierarchy?.planningIndex,
        planningRow: rowHierarchy?.planningIndex,
        subdivisionColumn: columnHierarchy?.subdivisionIndex,
        subdivisionRow: rowHierarchy?.subdivisionIndex,
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
  geometry: ParcelGridGeometry,
  viewportBounds?: InventoryViewportBounds | null
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
  const shouldCache = !viewportBounds && !resolution.selectable;
  const cachedGrid = shouldCache ? parcelGridCache.get(cacheKey) : undefined;

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
    resolution,
    viewportBounds
  );

  if (shouldCache) {
    rememberCachedGrid(cacheKey, generatedGrid);
  }

  return generatedGrid;
}

export function getSelectableRuralParcelByKey(
  stateName: string,
  parcelKey: string,
  geometry: ParcelGridGeometry
): ParcelCell | null {
  const parsed = parseRuralParcelKey(parcelKey);

  if (!parsed || parsed.stateSlug !== createStateSlug(stateName)) {
    return null;
  }

  const fineColumnIndex =
    (parsed.planningColumn - 1) *
      LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR +
    (parsed.subdivisionColumn - 1);
  const fineRowIndex =
    (parsed.planningRow - 1) *
      LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR +
    (parsed.subdivisionRow - 1);
  const stateBounds = calculateBoundingBox(geometry.stateBoundary);
  const gridSize = Math.max(
    stateBounds.maximumX - stateBounds.minimumX,
    stateBounds.maximumY - stateBounds.minimumY
  );

  if (gridSize <= GEOMETRY_EPSILON) {
    return null;
  }

  const columns =
    LUNASPHERE_INVENTORY_GRID.ruralPlanningColumns *
    LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR;
  const rows =
    LUNASPHERE_INVENTORY_GRID.ruralPlanningRows *
    LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR;
  const gridStartX =
    (stateBounds.minimumX + stateBounds.maximumX - gridSize) / 2;
  const gridStartY =
    (stateBounds.minimumY + stateBounds.maximumY - gridSize) / 2;
  const cellSize = gridSize / columns;
  const mapX = gridStartX + fineColumnIndex * cellSize;
  const mapY = gridStartY + fineRowIndex * cellSize;
  const rectangleBounds: RectangleBounds = {
    minimumX: mapX,
    minimumY: mapY,
    maximumX: mapX + cellSize,
    maximumY: mapY + cellSize,
  };
  const positions = createRectanglePolygon(mapX, mapY, cellSize, cellSize);

  if (
    fineColumnIndex < 0 ||
    fineColumnIndex >= columns ||
    fineRowIndex < 0 ||
    fineRowIndex >= rows ||
    !rectangleIsFullyInsideState(
      positions,
      rectangleBounds,
      geometry.stateBoundary
    ) ||
    parcelPolygonOverlapsExcludedTerritories(
      positions,
      geometry.excludedTerritories ?? []
    )
  ) {
    return null;
  }

  return {
    parcelKey: parcelKey.trim().toUpperCase(),
    stateName,
    propertyType: "Rural Acre",
    price: 24.95,
    sizeLabel: "1 Acre",
    positions,
    mapX,
    mapY,
    width: cellSize,
    height: cellSize,
    centerX: mapX + cellSize / 2,
    centerY: mapY + cellSize / 2,
    column: fineColumnIndex + 1,
    row: fineRowIndex + 1,
    gridVersion: LUNASPHERE_INVENTORY_GRID_VERSION,
    planningColumn: parsed.planningColumn,
    planningRow: parsed.planningRow,
    subdivisionColumn: parsed.subdivisionColumn,
    subdivisionRow: parsed.subdivisionRow,
    resolutionLevel: 5,
    selectable: true,
  };
}

export function countSelectableRuralParcels(
  stateName: string,
  geometry: ParcelGridGeometry
): number {
  void stateName;

  if (geometry.stateBoundary.length < 3) {
    return 0;
  }

  const resolution = getGridResolutionForZoom(
    LUNASPHERE_SALEABLE_INVENTORY_ZOOM
  );

  if (!resolution) {
    return 0;
  }

  const stateBounds = calculateBoundingBox(geometry.stateBoundary);
  const gridSize = Math.max(
    stateBounds.maximumX - stateBounds.minimumX,
    stateBounds.maximumY - stateBounds.minimumY
  );

  if (gridSize <= GEOMETRY_EPSILON) {
    return 0;
  }

  const gridStartX =
    (stateBounds.minimumX + stateBounds.maximumX - gridSize) / 2;
  const gridStartY =
    (stateBounds.minimumY + stateBounds.maximumY - gridSize) / 2;
  const cellSize = gridSize / resolution.columns;
  const exclusionGeometry = (geometry.excludedTerritories ?? [])
    .filter((territory) => territory.boundary.length >= 3)
    .map((territory) => ({
      territory,
      bounds: calculateBoundingBox(territory.boundary),
    }));
  let count = 0;

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
          geometry.stateBoundary
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

      if (!overlapsExcludedTerritory) {
        count += 1;
      }
    }
  }

  return count;
}


export function parcelPolygonOverlapsExcludedTerritories(
  polygon: LunarPolygon,
  excludedTerritories: readonly ParcelExclusionTerritory[]
): boolean {
  const bounds = calculateBoundingBox(polygon);

  return excludedTerritories.some((territory) => {
    if (territory.boundary.length < 3) {
      return false;
    }

    const territoryBounds = calculateBoundingBox(territory.boundary);
    return rectangleOverlapsExcludedTerritory(
      polygon,
      bounds,
      territory.boundary,
      territoryBounds
    );
  });
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
