import { lunarStates } from "./moon-data";

export type LunarMapRegion = {
  name: string;
  positions: [number, number][];
  labelPosition: [number, number];
};

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

const labelPositions: [number, number][] = [];

for (const row of rows) {
  const startX = 500 - ((row.count - 1) * 85) / 2;

  for (let i = 0; i < row.count; i++) {
    labelPositions.push([row.y, startX + i * 85]);
  }
}

function createRegion(
  name: string,
  labelPosition: [number, number]
): LunarMapRegion {
  const [y, x] = labelPosition;

  return {
    name,
    labelPosition,
    positions: [
  [y - 38, x - 36],
  [y - 48, x + 6],
  [y - 28, x + 43],
  [y + 12, x + 50],
  [y + 42, x + 20],
  [y + 48, x - 18],
  [y + 26, x - 48],
  [y - 8, x - 52],
],
  };
}

const specialPositions: Record<string, [number, number]> = {
  Tycho: [735, 500],
  Copernicus: [505, 430],
  Plato: [345, 470],
  Aristarchus: [430, 265],
  "Mar Serenitatis": [345, 610],
  "Mare Humorum": [600, 325],
  "Mare Vaporum": [430, 555],
  "Sinus Iridum": [365, 375],
};

export const lunarMapRegions: LunarMapRegion[] = lunarStates.map(
  (state, index) =>
    createRegion(
      state.name,
      specialPositions[state.name] || labelPositions[index]
    )
);