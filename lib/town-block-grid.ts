import type { ParcelCell } from "./parcel-grid";
import type { PublicLunaSphereSettlement } from "./lunasphere-public-geography";
import {
  calculateBoundingBox,
  isPointInsidePolygon,
  type LunarCoordinate,
  type LunarPolygon,
} from "./lunasphere-world-model";

export interface TownBlockCell extends ParcelCell {
  propertyType: "Town Block";
  townId: string;
  townName: string;
  townNumber: number;
  price: 39.95;
  sizeLabel: "1 Town Block";
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

export type ParsedTownBlockKey = {
  stateSlug: string;
  townNumber: number;
  column: number;
  row: number;
};

const GEOMETRY_EPSILON = 0.000001;
const MAXIMUM_CACHE_ENTRIES = 24;
const townBlockGridCache = new Map<string, TownBlockCell[]>();

function createStateSlug(stateName: string): string {
  return stateName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createTownBlockKey(input: {
  town: PublicLunaSphereSettlement;
  column: number;
  row: number;
  resolutionLevel: number;
  selectable: boolean;
}): string {
  const stateSlug = createStateSlug(input.town.stateName);
  const townNumber = input.town.territoryNumber.toString().padStart(2, "0");
  const column = input.column.toString().padStart(3, "0");
  const row = input.row.toString().padStart(3, "0");

  if (input.selectable) {
    return `${stateSlug}-TOWN-${townNumber}-TB-C${column}-R${row}`;
  }

  return `${stateSlug}-TOWN-${townNumber}-PREVIEW-L${input.resolutionLevel}-C${column}-R${row}`;
}

export function parseTownBlockKey(
  blockKey: string
): ParsedTownBlockKey | null {
  const match = blockKey
    .trim()
    .toUpperCase()
    .match(/^(.*)-TOWN-(\d{2})-TB-C(\d{3})-R(\d{3})$/);

  if (!match) {
    return null;
  }

  return {
    stateSlug: match[1],
    townNumber: Number(match[2]),
    column: Number(match[3]),
    row: Number(match[4]),
  };
}

export function townBlockKeyMatchesSettlement(
  blockKey: string,
  town: PublicLunaSphereSettlement
): boolean {
  const parsed = parseTownBlockKey(blockKey);

  return Boolean(
    parsed &&
      parsed.stateSlug === createStateSlug(town.stateName) &&
      parsed.townNumber === town.territoryNumber
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

function rectangleIsFullyInsideTown(
  rectangle: LunarPolygon,
  rectangleBounds: RectangleBounds,
  townBoundary: LunarPolygon
): boolean {
  if (
    !createRectangleSamplePoints(rectangleBounds).every((point) =>
      pointInsideOrOnPolygon(point, townBoundary)
    )
  ) {
    return false;
  }

  return !polygonsHaveIntersectingEdges(rectangle, townBoundary);
}

function getGridResolutionForZoom(zoom: number): GridResolution | null {
  if (zoom < 5) {
    return null;
  }

  if (zoom < 6) {
    return {
      columns: 3,
      rows: 3,
      resolutionLevel: 1,
      selectable: false,
    };
  }

  if (zoom < 7) {
    return {
      columns: 6,
      rows: 6,
      resolutionLevel: 2,
      selectable: false,
    };
  }

  return {
    columns: 6,
    rows: 6,
    resolutionLevel: 3,
    selectable: true,
  };
}

function createGeometrySignature(town: PublicLunaSphereSettlement): string {
  return town.boundary
    .map(([y, x]) => `${y.toFixed(4)},${x.toFixed(4)}`)
    .join(";");
}

function rememberCachedGrid(
  cacheKey: string,
  blocks: TownBlockCell[]
): void {
  townBlockGridCache.set(cacheKey, blocks);

  while (townBlockGridCache.size > MAXIMUM_CACHE_ENTRIES) {
    const oldestKey = townBlockGridCache.keys().next().value;

    if (typeof oldestKey !== "string") {
      break;
    }

    townBlockGridCache.delete(oldestKey);
  }
}

function generateTownBlockGrid(
  town: PublicLunaSphereSettlement,
  resolution: GridResolution
): TownBlockCell[] {
  if (town.kind !== "town" || town.boundary.length < 3) {
    return [];
  }

  const townBounds = calculateBoundingBox(town.boundary);
  const townWidth = townBounds.maximumX - townBounds.minimumX;
  const townHeight = townBounds.maximumY - townBounds.minimumY;

  if (
    townWidth <= GEOMETRY_EPSILON ||
    townHeight <= GEOMETRY_EPSILON
  ) {
    return [];
  }

  const cellWidth = townWidth / resolution.columns;
  const cellHeight = townHeight / resolution.rows;
  const blocks: TownBlockCell[] = [];

  for (let rowIndex = 0; rowIndex < resolution.rows; rowIndex += 1) {
    for (
      let columnIndex = 0;
      columnIndex < resolution.columns;
      columnIndex += 1
    ) {
      const mapX = townBounds.minimumX + columnIndex * cellWidth;
      const mapY = townBounds.minimumY + rowIndex * cellHeight;
      const bounds: RectangleBounds = {
        minimumX: mapX,
        minimumY: mapY,
        maximumX: mapX + cellWidth,
        maximumY: mapY + cellHeight,
      };
      const positions = createRectanglePolygon(
        mapX,
        mapY,
        cellWidth,
        cellHeight
      );

      if (!rectangleIsFullyInsideTown(positions, bounds, town.boundary)) {
        continue;
      }

      const column = columnIndex + 1;
      const row = rowIndex + 1;

      blocks.push({
        parcelKey: createTownBlockKey({
          town,
          column,
          row,
          resolutionLevel: resolution.resolutionLevel,
          selectable: resolution.selectable,
        }),
        stateName: town.stateName,
        positions,
        mapX,
        mapY,
        width: cellWidth,
        height: cellHeight,
        centerX: mapX + cellWidth / 2,
        centerY: mapY + cellHeight / 2,
        column,
        row,
        resolutionLevel: resolution.resolutionLevel,
        selectable: resolution.selectable,
        propertyType: "Town Block",
        townId: town.id,
        townName: town.name,
        townNumber: town.territoryNumber,
        price: 39.95,
        sizeLabel: "1 Town Block",
      });
    }
  }

  return blocks;
}

export function getTownBlockGridForZoom(
  town: PublicLunaSphereSettlement,
  zoom: number
): TownBlockCell[] {
  const resolution = getGridResolutionForZoom(zoom);

  if (!resolution || town.kind !== "town") {
    return [];
  }

  const cacheKey = [
    town.id,
    resolution.resolutionLevel,
    createGeometrySignature(town),
  ].join(":");
  const cachedGrid = townBlockGridCache.get(cacheKey);

  if (cachedGrid) {
    townBlockGridCache.delete(cacheKey);
    townBlockGridCache.set(cacheKey, cachedGrid);
    return cachedGrid;
  }

  const generatedGrid = generateTownBlockGrid(town, resolution);
  rememberCachedGrid(cacheKey, generatedGrid);
  return generatedGrid;
}

export function getSelectableTownBlockByKey(
  town: PublicLunaSphereSettlement,
  blockKey: string
): TownBlockCell | null {
  if (!townBlockKeyMatchesSettlement(blockKey, town)) {
    return null;
  }

  return (
    getTownBlockGridForZoom(town, 7).find(
      (block) => block.parcelKey === blockKey
    ) ?? null
  );
}

export function clearTownBlockGridCache(): void {
  townBlockGridCache.clear();
}
