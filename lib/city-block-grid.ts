import type { ParcelCell } from "./parcel-grid";
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
  column: number;
  row: number;
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
}): string {
  const stateSlug = createStateSlug(input.city.stateName);
  const cityNumber = input.city.territoryNumber.toString().padStart(2, "0");
  const column = input.column.toString().padStart(3, "0");
  const row = input.row.toString().padStart(3, "0");

  if (input.selectable) {
    return `${stateSlug}-CITY-${cityNumber}-CB-C${column}-R${row}`;
  }

  return `${stateSlug}-CITY-${cityNumber}-PREVIEW-L${input.resolutionLevel}-C${column}-R${row}`;
}

export function parseCityBlockKey(
  blockKey: string
): ParsedCityBlockKey | null {
  const match = blockKey
    .trim()
    .toUpperCase()
    .match(/^(.*)-CITY-(\d{2})-CB-C(\d{3})-R(\d{3})$/);

  if (!match) {
    return null;
  }

  return {
    stateSlug: match[1],
    cityNumber: Number(match[2]),
    column: Number(match[3]),
    row: Number(match[4]),
  };
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

  if (zoom < 7) {
    return {
      columns: 10,
      rows: 10,
      resolutionLevel: 2,
      selectable: false,
    };
  }

  return {
    columns: 10,
    rows: 10,
    resolutionLevel: 3,
    selectable: true,
  };
}

function createGeometrySignature(city: PublicLunaSphereSettlement): string {
  return city.boundary
    .map(([y, x]) => `${y.toFixed(4)},${x.toFixed(4)}`)
    .join(";");
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
  resolution: GridResolution
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

  for (let rowIndex = 0; rowIndex < resolution.rows; rowIndex += 1) {
    for (
      let columnIndex = 0;
      columnIndex < resolution.columns;
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

      const column = columnIndex + 1;
      const row = rowIndex + 1;

      blocks.push({
        parcelKey: createCityBlockKey({
          city,
          column,
          row,
          resolutionLevel: resolution.resolutionLevel,
          selectable: resolution.selectable,
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
  zoom: number
): CityBlockCell[] {
  const resolution = getGridResolutionForZoom(zoom);

  if (!resolution || city.kind !== "city") {
    return [];
  }

  const cacheKey = [
    city.id,
    resolution.resolutionLevel,
    createGeometrySignature(city),
  ].join(":");
  const cachedGrid = cityBlockGridCache.get(cacheKey);

  if (cachedGrid) {
    cityBlockGridCache.delete(cacheKey);
    cityBlockGridCache.set(cacheKey, cachedGrid);
    return cachedGrid;
  }

  const generatedGrid = generateCityBlockGrid(city, resolution);
  rememberCachedGrid(cacheKey, generatedGrid);
  return generatedGrid;
}

export function getSelectableCityBlockByKey(
  city: PublicLunaSphereSettlement,
  blockKey: string
): CityBlockCell | null {
  if (!cityBlockKeyMatchesSettlement(blockKey, city)) {
    return null;
  }

  return (
    getCityBlockGridForZoom(city, 7).find(
      (block) => block.parcelKey === blockKey
    ) ?? null
  );
}

export function clearCityBlockGridCache(): void {
  cityBlockGridCache.clear();
}
