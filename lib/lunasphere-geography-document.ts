import {
  cloneInventoryGridDefinition,
  hasCompatibleInventoryGridDefinition,
  LUNASPHERE_INVENTORY_GRID,
  type LunaSphereInventoryGridDefinition,
} from "./inventory-grid";
import {
  cloneProtectedAreaLayout,
  createInitialProtectedAreaLayout,
  validateProtectedAreaLayout,
  type LunaSphereProtectedAreaLayout,
} from "./lunasphere-protected-areas";
import {
  cloneTerritoryLayout,
  createInitialTerritoryLayout,
  validateTerritoryLayout,
  type LunaSphereTerritoryLayout,
} from "./lunasphere-territories";
import {
  cloneTopology,
  validateTopology,
  type LunaSphereTopology,
  type LunaSphereTopologyStatus,
} from "./lunasphere-topology";

export const LUNASPHERE_GEOGRAPHY_DOCUMENT_FORMAT =
  "lunasphere-geography-document";
export const LUNASPHERE_GEOGRAPHY_DOCUMENT_SCHEMA_VERSION = 3;

export type LunaSphereGeographyDocument = {
  format: typeof LUNASPHERE_GEOGRAPHY_DOCUMENT_FORMAT;
  schemaVersion: typeof LUNASPHERE_GEOGRAPHY_DOCUMENT_SCHEMA_VERSION;
  inventory: LunaSphereInventoryGridDefinition;
  topology: LunaSphereTopology;
  territories: LunaSphereTerritoryLayout;
  protectedAreas: LunaSphereProtectedAreaLayout;
};

export type LunaSphereGeographyValidation = {
  valid: boolean;
  topology: ReturnType<typeof validateTopology>;
  territories: ReturnType<typeof validateTerritoryLayout>;
  protectedAreas: ReturnType<typeof validateProtectedAreaLayout>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === "string")
  );
}

export function hasCompatibleTopologyStructure(
  value: unknown,
  baselineTopology: LunaSphereTopology
): value is LunaSphereTopology {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.worldId !== "string" ||
    typeof value.worldVersion !== "string" ||
    typeof value.schemaVersion !== "number" ||
    typeof value.revision !== "number" ||
    typeof value.coordinatePrecision !== "number" ||
    !["draft", "approved", "published", "archived"].includes(
      String(value.status)
    ) ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.edges) ||
    !Array.isArray(value.states)
  ) {
    return false;
  }

  if (
    value.worldId !== baselineTopology.worldId ||
    value.worldVersion !== baselineTopology.worldVersion ||
    value.schemaVersion !== baselineTopology.schemaVersion
  ) {
    return false;
  }

  const candidateStateIds = value.states
    .map((state) =>
      isRecord(state) && typeof state.id === "string"
        ? state.id
        : null
    )
    .filter((stateId): stateId is string => Boolean(stateId))
    .sort();
  const baselineStateIds = baselineTopology.states
    .map((state) => state.id)
    .sort();

  if (
    candidateStateIds.length !== baselineStateIds.length ||
    candidateStateIds.some(
      (stateId, index) => stateId !== baselineStateIds[index]
    )
  ) {
    return false;
  }

  const candidateEdgeIds = value.edges
    .map((edge) =>
      isRecord(edge) && typeof edge.id === "string"
        ? edge.id
        : null
    )
    .filter((edgeId): edgeId is string => Boolean(edgeId))
    .sort();
  const baselineEdgeIds = baselineTopology.edges
    .map((edge) => edge.id)
    .sort();

  if (
    candidateEdgeIds.length !== baselineEdgeIds.length ||
    candidateEdgeIds.some(
      (edgeId, index) => edgeId !== baselineEdgeIds[index]
    )
  ) {
    return false;
  }

  const nodesAreValid = value.nodes.every((node) => {
    if (!isRecord(node)) {
      return false;
    }

    return (
      typeof node.id === "string" &&
      Array.isArray(node.coordinate) &&
      node.coordinate.length === 2 &&
      node.coordinate.every(
        (coordinateValue) =>
          typeof coordinateValue === "number" &&
          Number.isFinite(coordinateValue)
      )
    );
  });

  const edgesAreValid = value.edges.every((edge) => {
    if (!isRecord(edge)) {
      return false;
    }

    return (
      typeof edge.id === "string" &&
      isStringArray(edge.nodeIds) &&
      edge.nodeIds.length >= 2 &&
      isStringArray(edge.stateIds) &&
      (edge.kind === "shared-state-border" ||
        edge.kind === "moon-perimeter")
    );
  });

  const statesAreValid = value.states.every((state) => {
    if (!isRecord(state)) {
      return false;
    }

    const labelPositionIsValid =
      Array.isArray(state.labelPosition) &&
      state.labelPosition.length === 2 &&
      state.labelPosition.every(
        (coordinateValue) =>
          typeof coordinateValue === "number" &&
          Number.isFinite(coordinateValue)
      );

    const edgeReferencesAreValid =
      Array.isArray(state.edges) &&
      state.edges.every(
        (edgeReference) =>
          isRecord(edgeReference) &&
          typeof edgeReference.edgeId === "string" &&
          (edgeReference.direction === "forward" ||
            edgeReference.direction === "reverse")
      );

    return (
      typeof state.id === "string" &&
      typeof state.stateNumber === "number" &&
      typeof state.name === "string" &&
      typeof state.slug === "string" &&
      labelPositionIsValid &&
      edgeReferencesAreValid
    );
  });

  return nodesAreValid && edgesAreValid && statesAreValid;
}

export function hasCompatibleTerritoryLayoutStructure(
  value: unknown,
  baselineLayout: LunaSphereTerritoryLayout
): value is LunaSphereTerritoryLayout {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.worldId !== "string" ||
    typeof value.worldVersion !== "string" ||
    typeof value.schemaVersion !== "number" ||
    typeof value.revision !== "number" ||
    !["draft", "approved", "published", "archived"].includes(
      String(value.status)
    ) ||
    !Array.isArray(value.settlements)
  ) {
    return false;
  }

  if (
    value.worldId !== baselineLayout.worldId ||
    value.worldVersion !== baselineLayout.worldVersion ||
    value.schemaVersion !== baselineLayout.schemaVersion
  ) {
    return false;
  }

  const baselineById = new Map(
    baselineLayout.settlements.map((settlement) => [
      settlement.id,
      settlement,
    ])
  );
  const candidateIds = new Set<string>();

  for (const settlement of value.settlements) {
    if (!isRecord(settlement) || typeof settlement.id !== "string") {
      return false;
    }

    const baseline = baselineById.get(settlement.id);

    if (!baseline || candidateIds.has(settlement.id)) {
      return false;
    }

    candidateIds.add(settlement.id);

    const centerIsValid =
      Array.isArray(settlement.center) &&
      settlement.center.length === 2 &&
      settlement.center.every(
        (coordinateValue) =>
          typeof coordinateValue === "number" &&
          Number.isFinite(coordinateValue)
      );
    const boundaryIsValid =
      Array.isArray(settlement.boundary) &&
      settlement.boundary.length >= 3 &&
      settlement.boundary.every(
        (coordinate) =>
          Array.isArray(coordinate) &&
          coordinate.length === 2 &&
          coordinate.every(
            (coordinateValue) =>
              typeof coordinateValue === "number" &&
              Number.isFinite(coordinateValue)
          )
      );

    if (
      settlement.stateId !== baseline.stateId ||
      settlement.stateName !== baseline.stateName ||
      settlement.stateNumber !== baseline.stateNumber ||
      settlement.kind !== baseline.kind ||
      settlement.territoryNumber !== baseline.territoryNumber ||
      settlement.name !== baseline.name ||
      settlement.slug !== baseline.slug ||
      !centerIsValid ||
      !boundaryIsValid
    ) {
      return false;
    }
  }

  return candidateIds.size === baselineById.size;
}


export function hasCompatibleProtectedAreaLayoutStructure(
  value: unknown,
  baselineLayout: LunaSphereProtectedAreaLayout
): value is LunaSphereProtectedAreaLayout {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.worldId !== "string" ||
    typeof value.worldVersion !== "string" ||
    typeof value.schemaVersion !== "number" ||
    typeof value.revision !== "number" ||
    !["draft", "approved", "published", "archived"].includes(
      String(value.status)
    ) ||
    !Array.isArray(value.areas)
  ) {
    return false;
  }

  if (
    value.worldId !== baselineLayout.worldId ||
    value.worldVersion !== baselineLayout.worldVersion ||
    value.schemaVersion !== baselineLayout.schemaVersion
  ) {
    return false;
  }

  const candidateIds = new Set<string>();

  return value.areas.every((area) => {
    if (!isRecord(area) || typeof area.id !== "string") {
      return false;
    }

    if (candidateIds.has(area.id)) {
      return false;
    }

    candidateIds.add(area.id);

    const centerIsValid =
      Array.isArray(area.center) &&
      area.center.length === 2 &&
      area.center.every(
        (coordinate) => typeof coordinate === "number" && Number.isFinite(coordinate)
      );
    const boundaryIsValid =
      Array.isArray(area.boundary) &&
      area.boundary.length >= 4 &&
      area.boundary.every(
        (coordinate) =>
          Array.isArray(coordinate) &&
          coordinate.length === 2 &&
          coordinate.every(
            (value) => typeof value === "number" && Number.isFinite(value)
          )
      );

    return (
      typeof area.stateId === "string" &&
      typeof area.stateName === "string" &&
      typeof area.stateNumber === "number" &&
      typeof area.name === "string" &&
      typeof area.slug === "string" &&
      ["Historic Site", "Landmark", "Scientific Preserve", "Reserved Area"].includes(
        String(area.category)
      ) &&
      typeof area.description === "string" &&
      (area.attractionId === null || typeof area.attractionId === "string") &&
      typeof area.minZoom === "number" &&
      centerIsValid &&
      boundaryIsValid
    );
  });
}

export function createGeographyDocument(
  topology: LunaSphereTopology,
  territories: LunaSphereTerritoryLayout,
  protectedAreas: LunaSphereProtectedAreaLayout =
    createInitialProtectedAreaLayout(topology),
  inventory: LunaSphereInventoryGridDefinition =
    LUNASPHERE_INVENTORY_GRID
): LunaSphereGeographyDocument {
  return {
    format: LUNASPHERE_GEOGRAPHY_DOCUMENT_FORMAT,
    schemaVersion: LUNASPHERE_GEOGRAPHY_DOCUMENT_SCHEMA_VERSION,
    inventory: cloneInventoryGridDefinition(inventory),
    topology: cloneTopology(topology),
    territories: cloneTerritoryLayout(territories),
    protectedAreas: cloneProtectedAreaLayout(protectedAreas),
  };
}

export function createInitialGeographyDocument(
  topology: LunaSphereTopology
): LunaSphereGeographyDocument {
  return createGeographyDocument(
    topology,
    createInitialTerritoryLayout(),
    createInitialProtectedAreaLayout(topology)
  );
}

export function cloneGeographyDocument(
  geography: LunaSphereGeographyDocument
): LunaSphereGeographyDocument {
  return createGeographyDocument(
    geography.topology,
    geography.territories,
    geography.protectedAreas,
    geography.inventory
  );
}

export function hasCompatibleGeographyDocumentStructure(
  value: unknown,
  baseline: LunaSphereGeographyDocument
): value is LunaSphereGeographyDocument {
  return (
    isRecord(value) &&
    value.format === LUNASPHERE_GEOGRAPHY_DOCUMENT_FORMAT &&
    value.schemaVersion ===
      LUNASPHERE_GEOGRAPHY_DOCUMENT_SCHEMA_VERSION &&
    hasCompatibleInventoryGridDefinition(value.inventory) &&
    hasCompatibleTopologyStructure(
      value.topology,
      baseline.topology
    ) &&
    hasCompatibleTerritoryLayoutStructure(
      value.territories,
      baseline.territories
    ) &&
    hasCompatibleProtectedAreaLayoutStructure(
      value.protectedAreas,
      baseline.protectedAreas
    )
  );
}

/**
 * Loads current geography documents and legacy state-only topology records.
 * Legacy records receive the deterministic baseline settlement layout so old
 * releases remain readable and can be copied forward into the new editor.
 */
export function normalizeGeographyDocument(
  value: unknown,
  baseline: LunaSphereGeographyDocument
): LunaSphereGeographyDocument | null {
  if (hasCompatibleGeographyDocumentStructure(value, baseline)) {
    return cloneGeographyDocument(value);
  }

  if (
    isRecord(value) &&
    value.format === LUNASPHERE_GEOGRAPHY_DOCUMENT_FORMAT &&
    value.schemaVersion === 2 &&
    hasCompatibleTopologyStructure(value.topology, baseline.topology) &&
    hasCompatibleTerritoryLayoutStructure(
      value.territories,
      baseline.territories
    ) &&
    hasCompatibleProtectedAreaLayoutStructure(
      value.protectedAreas,
      baseline.protectedAreas
    )
  ) {
    return createGeographyDocument(
      value.topology,
      value.territories,
      value.protectedAreas,
      LUNASPHERE_INVENTORY_GRID
    );
  }

  if (
    isRecord(value) &&
    value.format === LUNASPHERE_GEOGRAPHY_DOCUMENT_FORMAT &&
    value.schemaVersion === 1 &&
    hasCompatibleTopologyStructure(value.topology, baseline.topology) &&
    hasCompatibleTerritoryLayoutStructure(
      value.territories,
      baseline.territories
    )
  ) {
    return createGeographyDocument(
      value.topology,
      value.territories,
      baseline.protectedAreas
    );
  }

  if (hasCompatibleTopologyStructure(value, baseline.topology)) {
    return createGeographyDocument(
      value,
      baseline.territories,
      baseline.protectedAreas
    );
  }

  return null;
}

export function setGeographyStatus(
  geography: LunaSphereGeographyDocument,
  status: LunaSphereTopologyStatus
): LunaSphereGeographyDocument {
  const cloned = cloneGeographyDocument(geography);

  return {
    ...cloned,
    topology: {
      ...cloned.topology,
      status,
    },
    territories: {
      ...cloned.territories,
      status,
    },
    protectedAreas: {
      ...cloned.protectedAreas,
      status,
    },
  };
}

export function validateGeographyDocument(
  geography: LunaSphereGeographyDocument
): LunaSphereGeographyValidation {
  const topology = validateTopology(geography.topology);
  const territories = validateTerritoryLayout(
    geography.topology,
    geography.territories
  );
  const protectedAreas = validateProtectedAreaLayout(
    geography.topology,
    geography.protectedAreas
  );

  return {
    valid: topology.valid && territories.valid && protectedAreas.valid,
    topology,
    territories,
    protectedAreas,
  };
}
