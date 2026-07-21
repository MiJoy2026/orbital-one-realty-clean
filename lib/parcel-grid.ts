export interface ParcelCell {
  parcelKey: string;
  stateName: string;

  mapX: number;
  mapY: number;

  width: number;
  height: number;

  centerX: number;
  centerY: number;

  resolutionLevel: number;
  selectable: boolean;
}

type GenerateParcelGridOptions = {
  resolutionLevel?: number;
  selectable?: boolean;
};

const RURAL_GRID_START_X = 250;
const RURAL_GRID_START_Y = 250;
const RURAL_GRID_SIZE = 256;

function createStateSlug(stateName: string) {
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
}) {
  const stateSlug = createStateSlug(stateName);
  const formattedColumn = column.toString().padStart(3, "0");
  const formattedRow = row.toString().padStart(3, "0");

  /*
   * Only the deepest grid represents purchasable rural parcels.
   *
   * Final parcel example:
   * APOLLO-R-C001-R001
   *
   * Preview-region example:
   * APOLLO-PREVIEW-L2-C001-R001
   */
  if (selectable) {
    return `${stateSlug}-R-C${formattedColumn}-R${formattedRow}`;
  }

  return `${stateSlug}-PREVIEW-L${resolutionLevel}-C${formattedColumn}-R${formattedRow}`;
}

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

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const mapX = startX + column * cellSize;
      const mapY = startY + row * cellSize;

      const parcelColumn = column + 1;
      const parcelRow = row + 1;

      parcels.push({
        parcelKey: createParcelKey({
          stateName,
          column: parcelColumn,
          row: parcelRow,
          resolutionLevel,
          selectable,
        }),

        stateName,

        mapX,
        mapY,

        width: cellSize,
        height: cellSize,

        centerX: mapX + cellSize / 2,
        centerY: mapY + cellSize / 2,

        resolutionLevel,
        selectable,
      });
    }
  }

  return parcels;
}

export function findParcelAtCoordinate(
  parcels: ParcelCell[],
  x: number,
  y: number
): ParcelCell | null {
  return (
    parcels.find(
      (parcel) =>
        x >= parcel.mapX &&
        x < parcel.mapX + parcel.width &&
        y >= parcel.mapY &&
        y < parcel.mapY + parcel.height
    ) ?? null
  );
}

export function getParcelGridForZoom(
  stateName: string,
  zoom: number
): ParcelCell[] {
  if (zoom < 5) {
  return [];
}
  /*
   * Every resolution covers the same 256 × 256 map area.
   * Each new level divides the previous cells evenly, so the
   * parcel boundaries remain aligned while zooming.
   */

  if (zoom === 5) {
  return generateParcelGrid(
    stateName,
    RURAL_GRID_START_X,
    RURAL_GRID_START_Y,
    16,
    16,
    RURAL_GRID_SIZE / 16,
    {
      resolutionLevel: 2,
      selectable: false,
    }
  );
}

if (zoom === 6) {
  return generateParcelGrid(
    stateName,
    RURAL_GRID_START_X,
    RURAL_GRID_START_Y,
    32,
    32,
    RURAL_GRID_SIZE / 32,
    {
      resolutionLevel: 3,
      selectable: false,
    }
  );
}

return generateParcelGrid(
  stateName,
  RURAL_GRID_START_X,
  RURAL_GRID_START_Y,
  64,
  64,
  RURAL_GRID_SIZE / 64,
  {
    resolutionLevel: 4,
    selectable: true,
  }
);
}