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
export const LUNASPHERE_GEOGRAPHY_DOCUMENT_SCHEMA_VERSION = 1;

export type LunaSphereGeographyDocument = {
  format: typeof LUNASPHERE_GEOGRAPHY_DOCUMENT_FORMAT;
  schemaVersion: typeof LUNASPHERE_GEOGRAPHY_DOCUMENT_SCHEMA_VERSION;
  topology: LunaSphereTopology;
  territories: LunaSphereTerritoryLayout;
};

export type LunaSphereGeographyValidation = {
  valid: boolean;
  topology: ReturnType<typeof validateTopology>;
  territories: ReturnType<typeof validateTerritoryLayout>;
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

export function createGeographyDocument(
  topology: LunaSphereTopology,
  territories: LunaSphereTerritoryLayout
): LunaSphereGeographyDocument {
  return {
    format: LUNASPHERE_GEOGRAPHY_DOCUMENT_FORMAT,
    schemaVersion: LUNASPHERE_GEOGRAPHY_DOCUMENT_SCHEMA_VERSION,
    topology: cloneTopology(topology),
    territories: cloneTerritoryLayout(territories),
  };
}

export function createInitialGeographyDocument(
  topology: LunaSphereTopology
): LunaSphereGeographyDocument {
  return createGeographyDocument(
    topology,
    createInitialTerritoryLayout()
  );
}

export function cloneGeographyDocument(
  geography: LunaSphereGeographyDocument
): LunaSphereGeographyDocument {
  return createGeographyDocument(
    geography.topology,
    geography.territories
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
    hasCompatibleTopologyStructure(
      value.topology,
      baseline.topology
    ) &&
    hasCompatibleTerritoryLayoutStructure(
      value.territories,
      baseline.territories
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

  if (hasCompatibleTopologyStructure(value, baseline.topology)) {
    return createGeographyDocument(value, baseline.territories);
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

  return {
    valid: topology.valid && territories.valid,
    topology,
    territories,
  };
}
