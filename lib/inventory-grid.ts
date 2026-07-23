export const LUNASPHERE_INVENTORY_GRID_VERSION = 2 as const;
export const LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR = 5 as const;
export const LUNASPHERE_SALEABLE_INVENTORY_ZOOM = 8 as const;
export const LUNASPHERE_PROPERTY_DETAIL_ZOOM = 9 as const;

export type LunaSphereInventoryGridDefinition = {
  version: typeof LUNASPHERE_INVENTORY_GRID_VERSION;
  subdivisionFactor: typeof LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR;
  ruralPlanningColumns: 64;
  ruralPlanningRows: 64;
  cityPlanningColumns: 10;
  cityPlanningRows: 10;
  townPlanningColumns: 6;
  townPlanningRows: 6;
};

export const LUNASPHERE_INVENTORY_GRID: LunaSphereInventoryGridDefinition = {
  version: LUNASPHERE_INVENTORY_GRID_VERSION,
  subdivisionFactor: LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR,
  ruralPlanningColumns: 64,
  ruralPlanningRows: 64,
  cityPlanningColumns: 10,
  cityPlanningRows: 10,
  townPlanningColumns: 6,
  townPlanningRows: 6,
};

export type InventoryViewportBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type InventoryGridIndexRange = {
  startColumnIndex: number;
  endColumnIndex: number;
  startRowIndex: number;
  endRowIndex: number;
};

export function cloneInventoryGridDefinition(
  definition: LunaSphereInventoryGridDefinition = LUNASPHERE_INVENTORY_GRID
): LunaSphereInventoryGridDefinition {
  return { ...definition };
}

export function hasCompatibleInventoryGridDefinition(
  value: unknown
): value is LunaSphereInventoryGridDefinition {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.version === LUNASPHERE_INVENTORY_GRID_VERSION &&
    candidate.subdivisionFactor === LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR &&
    candidate.ruralPlanningColumns === 64 &&
    candidate.ruralPlanningRows === 64 &&
    candidate.cityPlanningColumns === 10 &&
    candidate.cityPlanningRows === 10 &&
    candidate.townPlanningColumns === 6 &&
    candidate.townPlanningRows === 6
  );
}

export function getInventoryGridIndexRange(input: {
  gridStartX: number;
  gridStartY: number;
  cellWidth: number;
  cellHeight: number;
  columns: number;
  rows: number;
  viewportBounds?: InventoryViewportBounds | null;
}): InventoryGridIndexRange {
  const fullRange: InventoryGridIndexRange = {
    startColumnIndex: 0,
    endColumnIndex: Math.max(0, input.columns - 1),
    startRowIndex: 0,
    endRowIndex: Math.max(0, input.rows - 1),
  };

  if (!input.viewportBounds) {
    return fullRange;
  }

  const paddingColumns = 1;
  const paddingRows = 1;
  const startColumnIndex = Math.max(
    0,
    Math.floor(
      (input.viewportBounds.west - input.gridStartX) / input.cellWidth
    ) - paddingColumns
  );
  const endColumnIndex = Math.min(
    input.columns - 1,
    Math.floor(
      (input.viewportBounds.east - input.gridStartX) / input.cellWidth
    ) + paddingColumns
  );
  const startRowIndex = Math.max(
    0,
    Math.floor(
      (input.viewportBounds.south - input.gridStartY) / input.cellHeight
    ) - paddingRows
  );
  const endRowIndex = Math.min(
    input.rows - 1,
    Math.floor(
      (input.viewportBounds.north - input.gridStartY) / input.cellHeight
    ) + paddingRows
  );

  if (
    endColumnIndex < startColumnIndex ||
    endRowIndex < startRowIndex
  ) {
    return {
      startColumnIndex: 0,
      endColumnIndex: -1,
      startRowIndex: 0,
      endRowIndex: -1,
    };
  }

  return {
    startColumnIndex,
    endColumnIndex,
    startRowIndex,
    endRowIndex,
  };
}

export function getHierarchicalGridCoordinates(
  zeroBasedFineIndex: number,
  subdivisionFactor = LUNASPHERE_INVENTORY_SUBDIVISION_FACTOR
): {
  planningIndex: number;
  subdivisionIndex: number;
} {
  return {
    planningIndex: Math.floor(zeroBasedFineIndex / subdivisionFactor) + 1,
    subdivisionIndex: (zeroBasedFineIndex % subdivisionFactor) + 1,
  };
}
