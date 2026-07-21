import { Delaunay } from "d3-delaunay";
import { lunarStates } from "./moon-data";

export type LunarMapRegion = {
  name: string;
  positions: [number, number][];
  labelPosition: [number, number];
};

const MOON_CENTER_X = 500;
const MOON_CENTER_Y = 500;
const MOON_RADIUS = 485;

const rows = [
  { y: 175, count: 3 },
  { y: 250, count: 5 },
  { y: 325, count: 7 },
  { y: 400, count: 7 },
  { y: 475, count: 7 },
  { y: 550, count: 7 },
  { y: 625, count: 7 },
  { y: 700, count: 6 },
  { y: 775, count: 5 },
  { y: 850, count: 3 },
];

const generatedCenters: [number, number][] = [];

for (const row of rows) {
  const startX = 500 - ((row.count - 1) * 85) / 2;

  for (let index = 0; index < row.count; index++) {
    generatedCenters.push([startX + index * 85, row.y]);
  }
}

const specialCenters: Record<string, [number, number]> = {
  Tycho: [500, 735],
  Copernicus: [430, 505],
  Plato: [470, 345],
  Aristarchus: [265, 430],
  "Mar Serenitatis": [610, 345],
  "Mare Humorum": [325, 600],
  "Mare Vaporum": [555, 430],
  "Sinus Iridum": [375, 365],
};

function projectPointInsideMoon(
  point: [number, number],
  padding = 10
): [number, number] {
  const [x, y] = point;
  const dx = x - MOON_CENTER_X;
  const dy = y - MOON_CENTER_Y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maximumDistance = MOON_RADIUS - padding;

  if (distance <= maximumDistance || distance === 0) {
    return point;
  }

  const scale = maximumDistance / distance;

  return [
    MOON_CENTER_X + dx * scale,
    MOON_CENTER_Y + dy * scale,
  ];
}

const stateCenters: [number, number][] = lunarStates.map((state, index) =>
  projectPointInsideMoon(
    specialCenters[state.name] ?? generatedCenters[index]
  )
);

const delaunay = Delaunay.from(stateCenters);
const voronoi = delaunay.voronoi([
  MOON_CENTER_X - MOON_RADIUS,
  MOON_CENTER_Y - MOON_RADIUS,
  MOON_CENTER_X + MOON_RADIUS,
  MOON_CENTER_Y + MOON_RADIUS,
]);

function createMoonBoundary(vertexCount = 180): [number, number][] {
  return Array.from({ length: vertexCount }, (_, index) => {
    const angle = (index / vertexCount) * Math.PI * 2;

    return [
      MOON_CENTER_X + Math.cos(angle) * MOON_RADIUS,
      MOON_CENTER_Y + Math.sin(angle) * MOON_RADIUS,
    ];
  });
}

function isInsideEdge(
  point: [number, number],
  edgeStart: [number, number],
  edgeEnd: [number, number]
) {
  return (
    (edgeEnd[0] - edgeStart[0]) * (point[1] - edgeStart[1]) -
      (edgeEnd[1] - edgeStart[1]) * (point[0] - edgeStart[0]) >=
    0
  );
}

function intersectLines(
  subjectStart: [number, number],
  subjectEnd: [number, number],
  clipStart: [number, number],
  clipEnd: [number, number]
): [number, number] {
  const subjectDx = subjectEnd[0] - subjectStart[0];
  const subjectDy = subjectEnd[1] - subjectStart[1];
  const clipDx = clipEnd[0] - clipStart[0];
  const clipDy = clipEnd[1] - clipStart[1];

  const denominator = subjectDx * clipDy - subjectDy * clipDx;

  if (Math.abs(denominator) < 0.000001) {
    return subjectEnd;
  }

  const startDifferenceX = clipStart[0] - subjectStart[0];
  const startDifferenceY = clipStart[1] - subjectStart[1];

  const subjectDistance =
    (startDifferenceX * clipDy - startDifferenceY * clipDx) / denominator;

  return [
    subjectStart[0] + subjectDistance * subjectDx,
    subjectStart[1] + subjectDistance * subjectDy,
  ];
}

function clipPolygon(
  subjectPolygon: [number, number][],
  clipPolygonPoints: [number, number][]
): [number, number][] {
  let output = subjectPolygon;

  for (let index = 0; index < clipPolygonPoints.length; index++) {
    const clipStart = clipPolygonPoints[index];
    const clipEnd =
      clipPolygonPoints[(index + 1) % clipPolygonPoints.length];

    const input = output;
    output = [];

    if (input.length === 0) {
      break;
    }

    let previousPoint = input[input.length - 1];

    for (const currentPoint of input) {
      const currentInside = isInsideEdge(
        currentPoint,
        clipStart,
        clipEnd
      );
      const previousInside = isInsideEdge(
        previousPoint,
        clipStart,
        clipEnd
      );

      if (currentInside) {
        if (!previousInside) {
          output.push(
            intersectLines(
              previousPoint,
              currentPoint,
              clipStart,
              clipEnd
            )
          );
        }

        output.push(currentPoint);
      } else if (previousInside) {
        output.push(
          intersectLines(
            previousPoint,
            currentPoint,
            clipStart,
            clipEnd
          )
        );
      }

      previousPoint = currentPoint;
    }
  }

  return output;
}

const moonBoundary = createMoonBoundary();

export const lunarMapRegions: LunarMapRegion[] = lunarStates.map(
  (state, index) => {
    const voronoiCell = voronoi.cellPolygon(index);

    const polygon = voronoiCell
      ? voronoiCell.map(
          ([x, y]) => [x, y] as [number, number]
        )
      : [];

    const clippedPolygon = clipPolygon(polygon, moonBoundary);
    const [labelX, labelY] = stateCenters[index];

    return {
      name: state.name,
      labelPosition: [labelY, labelX],
      positions: clippedPolygon.map(
        ([x, y]) => [y, x] as [number, number]
      ),
    };
  }
);

export type LunarStateCenter = {
  x: number;
  y: number;
};

export const lunarStateCenters: Record<string, LunarStateCenter> =
  Object.fromEntries(
    lunarMapRegions.map((region) => [
      region.name,
      {
        x: region.labelPosition[1],
        y: region.labelPosition[0],
      },
    ])
  );

export function getLunarStateCenter(
  stateName: string
): LunarStateCenter {
  return (
    lunarStateCenters[stateName] ?? {
      x: MOON_CENTER_X,
      y: MOON_CENTER_Y,
    }
  );
}

export function getLunarMapRegion(
  stateName: string
): LunarMapRegion | undefined {
  return lunarMapRegions.find(
    (region) =>
      region.name.toLowerCase() ===
      stateName.trim().toLowerCase()
  );
}