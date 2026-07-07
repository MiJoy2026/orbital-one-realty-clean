export interface ParcelCell {
  parcelKey: string;
  stateName: string;
  mapX: number;
  mapY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export function generateParcelGrid(
  stateName: string,
  startX: number,
  startY: number,
  columns: number,
  rows: number,
  cellSize = 24
): ParcelCell[] {
  const parcels: ParcelCell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const x = startX + column * cellSize;
      const y = startY + row * cellSize;

      const parcelColumn = column + 1;
      const parcelRow = row + 1;

      parcels.push({
        parcelKey: `${stateName
         .substring(0, 2)
         .toUpperCase()}-R-C${parcelColumn
         .toString()
         .padStart(3, "0")}-R${parcelRow.toString().padStart(3, "0")}`,

        stateName,

        mapX: x,
        mapY: y,

        width: cellSize,
        height: cellSize,

        centerX: x + cellSize / 2,
        centerY: y + cellSize / 2,
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
  if (zoom <= 2) {
    return generateParcelGrid(stateName, 250, 250, 8, 8, 32);
  }

  if (zoom <= 4) {
    return generateParcelGrid(stateName, 250, 250, 16, 16, 16);
  }

  if (zoom <= 6) {
    return generateParcelGrid(stateName, 250, 250, 32, 32, 8);
  }

  return generateParcelGrid(stateName, 250, 250, 64, 64, 4);
}