import {
  cloneTopology,
  type LunaSphereTopology,
} from "./lunasphere-topology";

export const LUNASPHERE_STUDIO_DRAFT_STORAGE_KEY =
  "lunasphere-studio:state-topology-draft:v1";

const DRAFT_FORMAT = "lunasphere-studio-topology-draft";
const DRAFT_STORAGE_VERSION = 1;

export type LunaSphereStudioDraftEnvelope = {
  format: typeof DRAFT_FORMAT;
  storageVersion: typeof DRAFT_STORAGE_VERSION;
  savedAt: string;
  topology: LunaSphereTopology;
};

export type LoadStudioDraftResult =
  | {
      status: "empty";
    }
  | {
      status: "loaded";
      savedAt: string;
      topology: LunaSphereTopology;
    }
  | {
      status: "invalid";
      message: string;
    };

export type SaveStudioDraftResult =
  | {
      ok: true;
      savedAt: string;
      topology: LunaSphereTopology;
    }
  | {
      ok: false;
      message: string;
    };

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;
type StorageRemover = Pick<Storage, "removeItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === "string")
  );
}

function hasCompatibleTopologyStructure(
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

export function loadLunaSphereStudioDraft(
  storage: StorageReader,
  baselineTopology: LunaSphereTopology
): LoadStudioDraftResult {
  let storedValue: string | null;

  try {
    storedValue = storage.getItem(
      LUNASPHERE_STUDIO_DRAFT_STORAGE_KEY
    );
  } catch {
    return {
      status: "invalid",
      message: "Browser storage could not be read.",
    };
  }

  if (!storedValue) {
    return { status: "empty" };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(storedValue);
  } catch {
    return {
      status: "invalid",
      message: "The saved Studio draft is not valid JSON.",
    };
  }

  if (!isRecord(parsedValue)) {
    return {
      status: "invalid",
      message: "The saved Studio draft has an invalid format.",
    };
  }

  if (
    parsedValue.format !== DRAFT_FORMAT ||
    parsedValue.storageVersion !== DRAFT_STORAGE_VERSION ||
    typeof parsedValue.savedAt !== "string" ||
    !hasCompatibleTopologyStructure(
      parsedValue.topology,
      baselineTopology
    )
  ) {
    return {
      status: "invalid",
      message:
        "The saved Studio draft is incompatible with this LunaSphere version.",
    };
  }

  return {
    status: "loaded",
    savedAt: parsedValue.savedAt,
    topology: cloneTopology(parsedValue.topology),
  };
}

export function saveLunaSphereStudioDraft(
  storage: StorageWriter,
  topology: LunaSphereTopology
): SaveStudioDraftResult {
  const savedAt = new Date().toISOString();
  const topologySnapshot = cloneTopology(topology);
  const envelope: LunaSphereStudioDraftEnvelope = {
    format: DRAFT_FORMAT,
    storageVersion: DRAFT_STORAGE_VERSION,
    savedAt,
    topology: topologySnapshot,
  };

  try {
    storage.setItem(
      LUNASPHERE_STUDIO_DRAFT_STORAGE_KEY,
      JSON.stringify(envelope)
    );
  } catch {
    return {
      ok: false,
      message:
        "The browser could not save the LunaSphere Studio draft.",
    };
  }

  return {
    ok: true,
    savedAt,
    topology: topologySnapshot,
  };
}

export function clearLunaSphereStudioDraft(
  storage: StorageRemover
): boolean {
  try {
    storage.removeItem(LUNASPHERE_STUDIO_DRAFT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
