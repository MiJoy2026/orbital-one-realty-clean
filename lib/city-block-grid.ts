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
  parcelPolygonOverlapsExcludedTerritories,
  type ParcelCell,
  type ParcelExclusionTerritory,
} from "./parcel-grid";
import type { PublicLunaSphereSettlement } from "./lunasphere-public-geography";
import {
  calculateBoundingBox,
  isPointInsidePolygon,
  type LunarCoordinate,
  type LunarPolygon,
} from "./lunasphere-world-model";

export interface CityBlockCell extends ParcelCell {
  propertyType: "City Block";
  cityId: string;
  cityName: string;
  cityNumber: number;
  price: 54.95;
  sizeLabel: "1 City Block";
}

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

export type ParsedCityBlockKey = {
  stateSlug: string;
  cityNumber: number;
  planningColumn: number;
  planningRow: number;
  subdivisionColumn: number;
  subdivisionRow: number;
};

const GEOMETRY_EPSILON = 0.000001;
const MAXIMUM_CACHE_ENTRIES = 24;
const cityBlockGridCache = new Map<string, CityBlockCell[]>();

function createStateSlug(stateName: string): string {
  return stateName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createCityBlockKey(input: {
  city: PublicLunaSphereSettlement;
  column: number;
  row: number;
  resolutionLevel: number;
  selectable: boolean;
  planningColumn?: number;
  planningRow?: number;
  subdivisionColumn?: number;
  subdivisionRow?: number;
}): string {
  const stateSlug = createStateSlug(input.city.stateName);
  const cityNumber = input.city.territoryNumber.toString().padStart(2, "0");
  const column = input.column.toString().padStart(3, "0");
  const row = input.row.toString().padStart(3, "0");

  if (
    input.selectable &&
    input.planningColumn &&
    input.planningRow &&
    input.subdivisionColumn &&
    input.subdivisionRow
  ) {
    return `${stateSlug}-CITY-${cityNumber}-CB-C${input.planningColumn
      .toString()
      .padStart(3, "0")}-R${input.planningRow
      .toString()
      .padStart(3, "0")}-SC${input.subdivisionColumn
      .toString()
      .padStart(2, "0")}-SR${input.subdivisionRow
      .toString()
      .padStart(2, "0")}`;
  }

  return `${stateSlug}-CITY-${cityNumber}-PREVIEW-L${input.resolutionLevel}-C${column}-R${row}`;
}

export function parseCityBlockKey(
  blockKey: string
): ParsedCityBlockKey | null {
  const match = blockKey
    .trim()
    .toUpperCase()
    .match(
      /^(.*)-CITY-(\d{2})-CB-C(\d{3})-R(\d{3})-SC(\d{2})-SR(\d{2})$/
    );

  if (!match) {
    return null;
  }

  const parsed: ParsedCityBlockKey = {
    stateSlug: match[1],
    cityNumber: Number(match[2]),
    planningColumn: Number(match[3]),
    planningRow: Number(match[4]),
    subdivisionColumn: Number(match[5]),
    subdivisionRow: Number(match[6]),
  };

  if (
    parsed.cityNumber < 1 ||
    parsed.planningColumn < 1 ||
    parsed.planningColumn > LUNASPHERE_INVENTORY_GRID.cityPlanningColumns ||
    parsed.planningRow < 1 ||
    parsed.planningRow > LUNASPHERE_INVENTORY_GRID.cityPlanningRows ||
    parsed.subdivisionColumn < 1 ||
    parsed.subdivisionColumn > LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR ||
    parsed.subdivisionRow < 1 ||
    parsed.subdivisionRow > LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR
  ) {
    return null;
  }

  return parsed;
}

export function cityBlockKeyMatchesSettlement(
  blockKey: string,
  city: PublicLunaSphereSettlement
): boolean {
  const parsed = parseCityBlockKey(blockKey);

  return Boolean(
    parsed &&
      parsed.stateSlug === createStateSlug(city.stateName) &&
      parsed.cityNumber === city.territoryNumber
  );
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
  const firstOrientation = orientation(firstStart, firstEnd, secondStart);
  const secondOrientation = orientation(firstStart, firstEnd, secondEnd);
  const thirdOrientation = orientation(secondStart, secondEnd, firstStart);
  const fourthOrientation = orientation(secondStart, secondEnd, firstEnd);

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

function rectangleIsFullyInsideCity(
  rectangle: LunarPolygon,
  rectangleBounds: RectangleBounds,
  cityBoundary: LunarPolygon
): boolean {
  if (
    !createRectangleSamplePoints(rectangleBounds).every((point) =>
      pointInsideOrOnPolygon(point, cityBoundary)
    )
  ) {
    return false;
  }

  return !polygonsHaveIntersectingEdges(rectangle, cityBoundary);
}

function getGridResolutionForZoom(zoom: number): GridResolution | null {
  if (zoom < 5) {
    return null;
  }

  if (zoom < 6) {
    return {
      columns: 5,
      rows: 5,
      resolutionLevel: 1,
      selectable: false,
    };
  }

  if (zoom < LUNASPHERE_SALEABLE_INVENTORY_ZOOM) {
    return {
      columns: LUNASPHERE_INVENTORY_GRID.cityPlanningColumns,
      rows: LUNASPHERE_INVENTORY_GRID.cityPlanningRows,
      resolutionLevel: 2,
      selectable: false,
    };
  }

  return {
    columns:
      LUNASPHERE_INVENTORY_GRID.cityPlanningColumns *
      LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
    rows:
      LUNASPHERE_INVENTORY_GRID.cityPlanningRows *
      LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
    resolutionLevel: 3,
    selectable: true,
  };
}

function createGeometrySignature(
  city: PublicLunaSphereSettlement,
  excludedTerritories: readonly ParcelExclusionTerritory[]
): string {
  const serialize = (boundary: readonly [number, number][]) =>
    boundary
      .map(([y, x]) => `${y.toFixed(4)},${x.toFixed(4)}`)
      .join(";");

  return [
    serialize(city.boundary),
    ...excludedTerritories
      .slice()
      .sort((first, second) => first.id.localeCompare(second.id))
      .map((territory) => `${territory.id}:${serialize(territory.boundary)}`),
  ].join("|");
}

function rememberCachedGrid(
  cacheKey: string,
  blocks: CityBlockCell[]
): void {
  cityBlockGridCache.set(cacheKey, blocks);

  while (cityBlockGridCache.size > MAXIMUM_CACHE_ENTRIES) {
    const oldestKey = cityBlockGridCache.keys().next().value;

    if (typeof oldestKey !== "string") {
      break;
    }

    cityBlockGridCache.delete(oldestKey);
  }
}

function generateCityBlockGrid(
  city: PublicLunaSphereSettlement,
  resolution: GridResolution,
  excludedTerritories: readonly ParcelExclusionTerritory[],
  viewportBounds?: InventoryViewportBounds | null
): CityBlockCell[] {
  if (city.kind !== "city" || city.boundary.length < 3) {
    return [];
  }

  const cityBounds = calculateBoundingBox(city.boundary);
  const cityWidth = cityBounds.maximumX - cityBounds.minimumX;
  const cityHeight = cityBounds.maximumY - cityBounds.minimumY;
  const gridSize = Math.max(cityWidth, cityHeight);

  if (gridSize <= GEOMETRY_EPSILON) {
    return [];
  }

  const gridStartX =
    (cityBounds.minimumX + cityBounds.maximumX - gridSize) / 2;
  const gridStartY =
    (cityBounds.minimumY + cityBounds.maximumY - gridSize) / 2;
  const cellSize = gridSize / resolution.columns;
  const blocks: CityBlockCell[] = [];
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
      const bounds: RectangleBounds = {
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

      if (!rectangleIsFullyInsideCity(positions, bounds, city.boundary)) {
        continue;
      }

      if (
        parcelPolygonOverlapsExcludedTerritories(
          positions,
          excludedTerritories
        )
      ) {
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

      blocks.push({
        parcelKey: createCityBlockKey({
          city,
          column,
          row,
          resolutionLevel: resolution.resolutionLevel,
          selectable: resolution.selectable,
          planningColumn: columnHierarchy?.planningIndex,
          planningRow: rowHierarchy?.planningIndex,
          subdivisionColumn: columnHierarchy?.subdivisionIndex,
          subdivisionRow: rowHierarchy?.subdivisionIndex,
        }),
        stateName: city.stateName,
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
        propertyType: "City Block",
        cityId: city.id,
        cityName: city.name,
        cityNumber: city.territoryNumber,
        price: 54.95,
        sizeLabel: "1 City Block",
      });
    }
  }

  return blocks;
}

export function getCityBlockGridForZoom(
  city: PublicLunaSphereSettlement,
  zoom: number,
  excludedTerritories: readonly ParcelExclusionTerritory[] = [],
  viewportBounds?: InventoryViewportBounds | null
): CityBlockCell[] {
  const resolution = getGridResolutionForZoom(zoom);

  if (!resolution || city.kind !== "city") {
    return [];
  }

  const cacheKey = [
    city.id,
    resolution.resolutionLevel,
    createGeometrySignature(city, excludedTerritories),
  ].join(":");
  const shouldCache = !viewportBounds && !resolution.selectable;
  const cachedGrid = shouldCache
    ? cityBlockGridCache.get(cacheKey)
    : undefined;

  if (cachedGrid) {
    cityBlockGridCache.delete(cacheKey);
    cityBlockGridCache.set(cacheKey, cachedGrid);
    return cachedGrid;
  }

  const generatedGrid = generateCityBlockGrid(
    city,
    resolution,
    excludedTerritories,
    viewportBounds
  );

  if (shouldCache) {
    rememberCachedGrid(cacheKey, generatedGrid);
  }

  return generatedGrid;
}

export function getSelectableCityBlockByKey(
  city: PublicLunaSphereSettlement,
  blockKey: string,
  excludedTerritories: readonly ParcelExclusionTerritory[] = []
): CityBlockCell | null {
  const parsed = parseCityBlockKey(blockKey);

  if (
    !parsed ||
    parsed.stateSlug !== createStateSlug(city.stateName) ||
    parsed.cityNumber !== city.territoryNumber ||
    city.kind !== "city"
  ) {
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
  const cityBounds = calculateBoundingBox(city.boundary);
  const gridSize = Math.max(
    cityBounds.maximumX - cityBounds.minimumX,
    cityBounds.maximumY - cityBounds.minimumY
  );

  if (gridSize <= GEOMETRY_EPSILON) {
    return null;
  }

  const columns =
    LUNASPHERE_INVENTORY_GRID.cityPlanningColumns *
    LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR;
  const rows = columns;
  const gridStartX =
    (cityBounds.minimumX + cityBounds.maximumX - gridSize) / 2;
  const gridStartY =
    (cityBounds.minimumY + cityBounds.maximumY - gridSize) / 2;
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
    !rectangleIsFullyInsideCity(
      positions,
      rectangleBounds,
      city.boundary
    ) ||
    parcelPolygonOverlapsExcludedTerritories(
      positions,
      excludedTerritories
    )
  ) {
    return null;
  }

  return {
    parcelKey: blockKey.trim().toUpperCase(),
    stateName: city.stateName,
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
    resolutionLevel: 3,
    selectable: true,
    propertyType: "City Block",
    cityId: city.id,
    cityName: city.name,
    cityNumber: city.territoryNumber,
    price: 54.95,
    sizeLabel: "1 City Block",
  };
}

export function countSelectableCityBlocks(
  city: PublicLunaSphereSettlement,
  excludedTerritories: readonly ParcelExclusionTerritory[] = []
): number {
  if (city.kind !== "city" || city.boundary.length < 3) {
    return 0;
  }

  const resolution = getGridResolutionForZoom(
    LUNASPHERE_SALEABLE_INVENTORY_ZOOM
  );

  if (!resolution) {
    return 0;
  }

  const cityBounds = calculateBoundingBox(city.boundary);
  const gridSize = Math.max(
    cityBounds.maximumX - cityBounds.minimumX,
    cityBounds.maximumY - cityBounds.minimumY
  );

  if (gridSize <= GEOMETRY_EPSILON) {
    return 0;
  }

  const gridStartX =
    (cityBounds.minimumX + cityBounds.maximumX - gridSize) / 2;
  const gridStartY =
    (cityBounds.minimumY + cityBounds.maximumY - gridSize) / 2;
  const cellSize = gridSize / resolution.columns;
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
        rectangleIsFullyInsideCity(
          positions,
          rectangleBounds,
          city.boundary
        ) &&
        !parcelPolygonOverlapsExcludedTerritories(
          positions,
          excludedTerritories
        )
      ) {
        count += 1;
      }
    }
  }

  return count;
}


export function clearCityBlockGridCache(): void {
  cityBlockGridCache.clear();
}
