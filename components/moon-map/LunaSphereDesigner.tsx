"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  Polyline,
  ScaleControl,
  ZoomControl,
} from "react-leaflet";
import { CRS, divIcon, Transformation } from "leaflet";
import "leaflet/dist/leaflet.css";

import LunarTileLayer from "@/components/moon-map/LunarTileLayer";
import { lunarMapRegions } from "@/lib/lunar-map-regions";
import {
  clearLunaSphereStudioDraft,
  loadLunaSphereStudioDraft,
  saveLunaSphereStudioDraft,
} from "@/lib/lunasphere-studio-draft";
import {
  cloneGeographyDocument,
  createGeographyDocument,
  hasCompatibleGeographyDocumentStructure,
  validateGeographyDocument,
  type LunaSphereGeographyDocument,
} from "@/lib/lunasphere-geography-document";
import {
  cloneTerritoryLayout,
  convertLunarCoordinateToStateRelative,
  createInitialTerritoryLayout,
  createTerritorySummary,
  getSettlementDefinition,
  getSettlementDefinitionsForState,
  insertSettlementBoundaryPoint,
  moveSettlementBoundaryPoint,
  moveSettlementCenter,
  removeSettlementBoundaryPoint,
  resolveStateTerritories,
  restoreSettlementDefinition,
  restoreStateTerritories,
  validateTerritoryLayout,
  type LunaSphereSettlementKind,
  type ResolvedLunaSphereSettlement,
} from "@/lib/lunasphere-territories";
import {
  cloneTopology,
  constrainTopologyEdgeCoordinate,
  createTopologyFromRegions,
  createTopologySummary,
  getStateEdges,
  getStateNodeIds,
  getTopologyState,
  insertTopologyEdgeNode,
  moveTopologyNode,
  removeTopologyEdgeNode,
  restoreTopologyState,
  topologyToLunarMapRegions,
  validateTopology,
  type LunaSphereTopologyEdge,
  type LunaSphereTopologyNode,
} from "@/lib/lunasphere-topology";

const lunarCoordinateScale = 256 / 1000;
const HISTORY_LIMIT = 100;
const AUTOSAVE_DELAY_MS = 900;
const NUDGE_DISTANCE = 1;
const GEOGRAPHY_API_PATH = "/admin/api/lunasphere/geography";

const LunarCRS = {
  ...CRS.Simple,
  transformation: new Transformation(
    lunarCoordinateScale,
    0,
    -lunarCoordinateScale,
    256
  ),
};

const bounds = [
  [0, 0],
  [1000, 1000],
] as [[number, number], [number, number]];

const baselineTopology = createTopologyFromRegions(
  lunarMapRegions,
  {
    status: "draft",
  }
);
const baselineTerritoryLayout = createInitialTerritoryLayout();
const baselineGeography = createGeographyDocument(
  baselineTopology,
  baselineTerritoryLayout
);

const vertexIcon = divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  html: `
    <div style="
      width:18px;
      height:18px;
      border-radius:999px;
      background:#ffffff;
      border:3px solid #111827;
      box-shadow:0 0 0 2px #facc15, 0 3px 12px rgba(0,0,0,0.9);
      cursor:grab;
    "></div>
  `,
});

const selectedVertexIcon = divIcon({
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: `
    <div style="
      width:22px;
      height:22px;
      border-radius:999px;
      background:#facc15;
      border:4px solid #ffffff;
      box-shadow:0 0 0 2px #111827, 0 3px 14px rgba(0,0,0,0.95);
      cursor:grab;
    "></div>
  `,
});

const addVertexIcon = divIcon({
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: `
    <div style="
      width:16px;
      height:16px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:999px;
      background:#22c55e;
      color:#052e16;
      border:2px solid #ffffff;
      box-shadow:0 2px 10px rgba(0,0,0,0.9);
      cursor:pointer;
      font:900 13px/1 Arial,sans-serif;
    ">+</div>
  `,
});

function createTerritoryVertexIcon(
  color: string,
  selected: boolean
) {
  const size = selected ? 20 : 16;
  const anchor = size / 2;

  return divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${selected ? "#ffffff" : color};
        border:${selected ? 4 : 3}px solid ${color};
        box-shadow:0 0 0 2px #020617, 0 3px 12px rgba(0,0,0,0.9);
        cursor:grab;
      "></div>
    `,
  });
}

function createTerritoryCenterIcon(color: string) {
  return divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="
        width:24px;
        height:24px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:6px;
        background:${color};
        color:#020617;
        border:3px solid #ffffff;
        box-shadow:0 0 0 2px #020617, 0 3px 14px rgba(0,0,0,0.95);
        cursor:move;
        font:900 13px/1 Arial,sans-serif;
      ">◆</div>
    `,
  });
}

function createTerritoryAddIcon(color: string) {
  return divIcon({
    className: "",
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
    html: `
      <div style="
        width:15px;
        height:15px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:999px;
        background:#020617;
        color:${color};
        border:2px solid ${color};
        box-shadow:0 2px 10px rgba(0,0,0,0.9);
        cursor:pointer;
        font:900 12px/1 Arial,sans-serif;
      ">+</div>
    `,
  });
}

const cityTerritoryVertexIcon = createTerritoryVertexIcon(
  "#22d3ee",
  false
);
const selectedCityTerritoryVertexIcon = createTerritoryVertexIcon(
  "#22d3ee",
  true
);
const townTerritoryVertexIcon = createTerritoryVertexIcon(
  "#f59e0b",
  false
);
const selectedTownTerritoryVertexIcon = createTerritoryVertexIcon(
  "#f59e0b",
  true
);
const cityTerritoryCenterIcon = createTerritoryCenterIcon("#22d3ee");
const townTerritoryCenterIcon = createTerritoryCenterIcon("#f59e0b");
const cityTerritoryAddIcon = createTerritoryAddIcon("#22d3ee");
const townTerritoryAddIcon = createTerritoryAddIcon("#f59e0b");

type TerritoryDisplayMode = "states" | LunaSphereSettlementKind | "all";

type EdgeSegmentTarget = {
  key: string;
  edgeId: string;
  segmentIndex: number;
  position: [number, number];
};

type GeographyHistoryState = {
  past: LunaSphereGeographyDocument[];
  present: LunaSphereGeographyDocument;
  future: LunaSphereGeographyDocument[];
};

type GeographyHistoryAction =
  | {
      type: "apply";
      update: (
        geography: LunaSphereGeographyDocument
      ) => LunaSphereGeographyDocument;
    }
  | {
      type: "preview";
      update: (
        geography: LunaSphereGeographyDocument
      ) => LunaSphereGeographyDocument;
    }
  | {
      type: "commit-preview";
      baseline: LunaSphereGeographyDocument;
    }
  | {
      type: "undo";
    }
  | {
      type: "redo";
    }
  | {
      type: "replace";
      geography: LunaSphereGeographyDocument;
      recordCurrent: boolean;
    };

type DraftStatus =
  | "loading"
  | "saving"
  | "saved"
  | "not-saved"
  | "error";

type DatabaseStatus =
  | "loading"
  | "ready"
  | "saving"
  | "publishing"
  | "previewing"
  | "activating"
  | "error";

type DatabaseDraftMetadata = {
  savedAt: string;
  topologyRevision: number;
  territoryRevision: number;
  geography: LunaSphereGeographyDocument;
};

type GeographyReleaseMetadata = {
  releaseNumber: number;
  publishedAt: string;
  topologyRevision: number;
  territoryRevision: number;
  topologyHash: string;
};

type GeographyActivationMetadata = GeographyReleaseMetadata & {
  activatedAt: string;
};

type GeographyReleaseDetail = GeographyReleaseMetadata & {
  geography: LunaSphereGeographyDocument;
};

type GeographyWorkspaceResponse = {
  draft: DatabaseDraftMetadata | null;
  latestRelease: GeographyReleaseMetadata | null;
  activeRelease: GeographyActivationMetadata | null;
  releases: GeographyReleaseMetadata[];
  error?: string;
};

function addHistorySnapshot(
  history: LunaSphereGeographyDocument[],
  geography: LunaSphereGeographyDocument
): LunaSphereGeographyDocument[] {
  return [
    ...history,
    cloneGeographyDocument(geography),
  ].slice(-HISTORY_LIMIT);
}

function geographyHistoryReducer(
  state: GeographyHistoryState,
  action: GeographyHistoryAction
): GeographyHistoryState {
  if (action.type === "apply") {
    const nextGeography = action.update(state.present);

    if (nextGeography === state.present) {
      return state;
    }

    return {
      past: addHistorySnapshot(state.past, state.present),
      present: nextGeography,
      future: [],
    };
  }

  if (action.type === "preview") {
    const nextGeography = action.update(state.present);

    return nextGeography === state.present
      ? state
      : {
          ...state,
          present: nextGeography,
        };
  }

  if (action.type === "commit-preview") {
    if (geographiesHaveSameContent(action.baseline, state.present)) {
      return state;
    }

    const topologyChanged = !geographiesHaveSameContent(
      createGeographyDocument(
        action.baseline.topology,
        state.present.territories
      ),
      state.present
    );
    const territoriesChanged = !geographiesHaveSameContent(
      createGeographyDocument(
        state.present.topology,
        action.baseline.territories
      ),
      state.present
    );

    return {
      past: addHistorySnapshot(state.past, action.baseline),
      present: {
        ...cloneGeographyDocument(state.present),
        topology: topologyChanged
          ? {
              ...cloneTopology(state.present.topology),
              revision: action.baseline.topology.revision + 1,
            }
          : cloneTopology(state.present.topology),
        territories: territoriesChanged
          ? {
              ...cloneTerritoryLayout(state.present.territories),
              revision: action.baseline.territories.revision + 1,
            }
          : cloneTerritoryLayout(state.present.territories),
      },
      future: [],
    };
  }

  if (action.type === "undo") {
    const previousGeography = state.past.at(-1);

    if (!previousGeography) {
      return state;
    }

    return {
      past: state.past.slice(0, -1),
      present: cloneGeographyDocument(previousGeography),
      future: [
        cloneGeographyDocument(state.present),
        ...state.future,
      ].slice(0, HISTORY_LIMIT),
    };
  }

  if (action.type === "redo") {
    const nextGeography = state.future[0];

    if (!nextGeography) {
      return state;
    }

    return {
      past: addHistorySnapshot(state.past, state.present),
      present: cloneGeographyDocument(nextGeography),
      future: state.future.slice(1),
    };
  }

  if (action.recordCurrent) {
    return {
      past: addHistorySnapshot(state.past, state.present),
      present: cloneGeographyDocument(action.geography),
      future: [],
    };
  }

  return {
    past: [],
    present: cloneGeographyDocument(action.geography),
    future: [],
  };
}

function downloadJson(fileName: string, value: unknown) {
  const fileContents = JSON.stringify(value, null, 2);
  const blob = new Blob([fileContents], {
    type: "application/json",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
}

function createEdgePositions(
  edge: LunaSphereTopologyEdge,
  nodeById: Map<string, LunaSphereTopologyNode>
): [number, number][] {
  return edge.nodeIds
    .map((nodeId) => nodeById.get(nodeId)?.coordinate)
    .filter(
      (coordinate): coordinate is [number, number] =>
        Boolean(coordinate)
    )
    .map(([y, x]) => [y, x]);
}

function formatDatabaseDate(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Saved"
    : date.toLocaleString();
}

function canonicalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeValue(entry));
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = canonicalizeValue(record[key]);
        return result;
      }, {});
  }

  return value;
}

function geographiesHaveSameContent(
  first: LunaSphereGeographyDocument,
  second: LunaSphereGeographyDocument
): boolean {
  return (
    JSON.stringify(canonicalizeValue(first)) ===
    JSON.stringify(canonicalizeValue(second))
  );
}

async function readResponseBody<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(
      body.error || "The LunaSphere database request failed."
    );
  }

  return body;
}

function formatSavedAt(savedAt: string | null): string {
  if (!savedAt) {
    return "No local draft saved";
  }

  const savedDate = new Date(savedAt);

  if (Number.isNaN(savedDate.getTime())) {
    return "Local draft saved";
  }

  return `Saved ${savedDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  })}`;
}

function isTextEntryElement(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export default function LunaSphereDesigner() {
  const [history, dispatchHistory] = useReducer(
    geographyHistoryReducer,
    {
      past: [],
      present: cloneGeographyDocument(baselineGeography),
      future: [],
    }
  );
  const workingGeography = history.present;
  const workingTopology = workingGeography.topology;
  const workingTerritoryLayout = workingGeography.territories;

  const dragBaselineRef =
    useRef<LunaSphereGeographyDocument | null>(null);
  const autosaveTokenRef = useRef(0);
  const [selectedState, setSelectedState] = useState(
    baselineTopology.states[0]?.name ?? ""
  );
  const [territoryDisplayMode, setTerritoryDisplayMode] =
    useState<TerritoryDisplayMode>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<
    string | null
  >(null);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<
    string | null
  >(null);
  const [selectedTerritoryPointIndex, setSelectedTerritoryPointIndex] =
    useState<number | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [draftStatus, setDraftStatus] =
    useState<DraftStatus>("loading");
  const [lastSavedAt, setLastSavedAt] = useState<
    string | null
  >(null);
  const [draftNotice, setDraftNotice] = useState<
    string | null
  >(null);
  const [databaseStatus, setDatabaseStatus] =
    useState<DatabaseStatus>("loading");
  const [databaseDraft, setDatabaseDraft] =
    useState<DatabaseDraftMetadata | null>(null);
  const [latestRelease, setLatestRelease] =
    useState<GeographyReleaseMetadata | null>(null);
  const [activeRelease, setActiveRelease] =
    useState<GeographyActivationMetadata | null>(null);
  const [releases, setReleases] = useState<
    GeographyReleaseMetadata[]
  >([]);
  const [releasePreview, setReleasePreview] =
    useState<GeographyReleaseDetail | null>(null);
  const [databaseNotice, setDatabaseNotice] = useState<
    string | null
  >(null);

  const geography =
    releasePreview?.geography ?? workingGeography;
  const topology = geography.topology;
  const territoryLayout = geography.territories;
  const isPreviewingRelease = releasePreview !== null;

  const regions = useMemo(
    () =>
      topologyToLunarMapRegions(topology).map((region) => ({
        ...region,
        labelPosition: [
          region.labelPosition[0],
          region.labelPosition[1],
        ] as [number, number],
        positions: region.positions.map(
          ([y, x]) => [y, x] as [number, number]
        ),
      })),
    [topology]
  );
  const selectedRegion = useMemo(
    () =>
      regions.find(
        (region) => region.name === selectedState
      ) ?? null,
    [regions, selectedState]
  );
  const selectedTopologyState = useMemo(
    () => getTopologyState(topology, selectedState),
    [topology, selectedState]
  );
  const nodeById = useMemo(
    () =>
      new Map(
        topology.nodes.map(
          (node) => [node.id, node] as const
        )
      ),
    [topology]
  );
  const stateById = useMemo(
    () =>
      new Map(
        topology.states.map(
          (state) => [state.id, state] as const
        )
      ),
    [topology]
  );
  const selectedEdges = useMemo(
    () => getStateEdges(topology, selectedState),
    [topology, selectedState]
  );
  const selectedNodes = useMemo(
    () =>
      getStateNodeIds(topology, selectedState)
        .map((nodeId) => nodeById.get(nodeId))
        .filter(
          (node): node is LunaSphereTopologyNode =>
            Boolean(node)
        ),
    [nodeById, selectedState, topology]
  );
  const selectedNode = selectedNodeId
    ? nodeById.get(selectedNodeId) ?? null
    : null;
  const selectedNodeEdges = useMemo(
    () =>
      selectedNodeId
        ? topology.edges.filter((edge) =>
            edge.nodeIds.includes(selectedNodeId)
          )
        : [],
    [selectedNodeId, topology]
  );
  const selectedNodeStateNames = useMemo(
    () => [
      ...new Set(
        selectedNodeEdges.flatMap((edge) =>
          edge.stateIds
            .map((stateId) => stateById.get(stateId)?.name)
            .filter(
              (stateName): stateName is string =>
                Boolean(stateName)
            )
        )
      ),
    ].sort(),
    [selectedNodeEdges, stateById]
  );
  const selectedNodeIsPerimeter = selectedNodeEdges.some(
    (edge) => edge.kind === "moon-perimeter"
  );
  const edgeSegmentTargets = useMemo(
    () =>
      selectedEdges.flatMap((edge): EdgeSegmentTarget[] =>
        edge.nodeIds.slice(0, -1).flatMap((nodeId, index) => {
          const startNode = nodeById.get(nodeId);
          const endNode = nodeById.get(
            edge.nodeIds[index + 1]
          );

          if (!startNode || !endNode) {
            return [];
          }

          const midpoint: [number, number] = [
            (startNode.coordinate[0] +
              endNode.coordinate[0]) /
              2,
            (startNode.coordinate[1] +
              endNode.coordinate[1]) /
              2,
          ];

          return [
            {
              key: `${edge.id}-segment-${index}`,
              edgeId: edge.id,
              segmentIndex: index,
              position: constrainTopologyEdgeCoordinate(
                topology,
                edge.id,
                midpoint
              ),
            },
          ];
        })
      ),
    [nodeById, selectedEdges, topology]
  );
  const validation = useMemo(
    () => validateTopology(topology),
    [topology]
  );
  const workingValidation = useMemo(
    () => validateGeographyDocument(workingGeography),
    [workingGeography]
  );
  const summary = useMemo(
    () => createTopologySummary(topology),
    [topology]
  );
  const resolvedTerritories = useMemo(
    () =>
      resolveStateTerritories(
        topology,
        territoryLayout,
        selectedState
      ),
    [selectedState, territoryLayout, topology]
  );
  const territorySummary = useMemo(
    () => createTerritorySummary(resolvedTerritories),
    [resolvedTerritories]
  );
  const territoryValidation = useMemo(
    () =>
      validateTerritoryLayout(
        topology,
        territoryLayout
      ),
    [territoryLayout, topology]
  );
  const selectedTerritoryIssues = useMemo(
    () =>
      [
        ...territoryValidation.errors,
        ...territoryValidation.warnings,
        ...territoryValidation.information,
      ].filter(
        (issue) => issue.stateName === selectedState
      ),
    [selectedState, territoryValidation]
  );
  const selectedTerritoryDefinition = useMemo(
    () =>
      selectedTerritoryId
        ? getSettlementDefinition(
            territoryLayout,
            selectedTerritoryId
          )
        : null,
    [selectedTerritoryId, territoryLayout]
  );
  const selectedResolvedTerritory = useMemo(() => {
    if (!selectedTerritoryId || !resolvedTerritories) {
      return null;
    }

    return [...resolvedTerritories.cities, ...resolvedTerritories.towns].find(
      (territory) => territory.id === selectedTerritoryId
    ) ?? null;
  }, [resolvedTerritories, selectedTerritoryId]);
  const selectedTerritoryCanRemovePoint =
    selectedTerritoryDefinition !== null &&
    selectedTerritoryPointIndex !== null &&
    selectedTerritoryDefinition.boundary.length > 4;
  const visibleSettlementOptions = useMemo(() => {
    if (!resolvedTerritories) {
      return [] as ResolvedLunaSphereSettlement[];
    }

    if (territoryDisplayMode === "city") {
      return resolvedTerritories.cities;
    }

    if (territoryDisplayMode === "town") {
      return resolvedTerritories.towns;
    }

    return [
      ...resolvedTerritories.cities,
      ...resolvedTerritories.towns,
    ];
  }, [resolvedTerritories, territoryDisplayMode]);

  const selectedTerritorySegmentTargets = useMemo(() => {
    if (!selectedResolvedTerritory) {
      return [] as {
        key: string;
        segmentIndex: number;
        position: [number, number];
      }[];
    }

    return selectedResolvedTerritory.boundary.map(
      (point, segmentIndex) => {
        const nextPoint =
          selectedResolvedTerritory.boundary[
            (segmentIndex + 1) %
              selectedResolvedTerritory.boundary.length
          ];

        return {
          key: `${selectedResolvedTerritory.id}-segment-${segmentIndex}`,
          segmentIndex,
          position: [
            (point[0] + nextPoint[0]) / 2,
            (point[1] + nextPoint[1]) / 2,
          ] as [number, number],
        };
      }
    );
  }, [selectedResolvedTerritory]);
  const showStateEditingHandles =
    territoryDisplayMode === "states" ||
    (territoryDisplayMode === "all" && !selectedTerritoryId);
  const showTerritoryEditingHandles =
    selectedResolvedTerritory !== null &&
    (territoryDisplayMode === "all" ||
      selectedResolvedTerritory.kind === territoryDisplayMode);

  const removableNodeEdge = useMemo(() => {
    if (!selectedNodeId) {
      return null;
    }

    return (
      selectedEdges.find((edge) => {
        const nodeIndex = edge.nodeIds.indexOf(
          selectedNodeId
        );

        return (
          nodeIndex > 0 &&
          nodeIndex < edge.nodeIds.length - 1
        );
      }) ?? null
    );
  }, [selectedEdges, selectedNodeId]);

  const refreshDatabaseWorkspace = useCallback(
    async (announce = false) => {
      setDatabaseStatus("loading");

      try {
        const response = await fetch(GEOGRAPHY_API_PATH, {
          cache: "no-store",
        });
        const workspace =
          await readResponseBody<GeographyWorkspaceResponse>(
            response
          );

        if (
          workspace.draft &&
          !hasCompatibleGeographyDocumentStructure(
            workspace.draft.geography,
            baselineGeography
          )
        ) {
          throw new Error(
            "The database draft is incompatible with this LunaSphere Studio version."
          );
        }

        setDatabaseDraft(workspace.draft);
        setLatestRelease(workspace.latestRelease);
        setActiveRelease(workspace.activeRelease);
        setReleases(workspace.releases);
        setDatabaseStatus("ready");

        if (announce) {
          setDatabaseNotice(
            workspace.draft
              ? `Database draft refreshed. State revision ${workspace.draft.topologyRevision}, territory revision ${workspace.draft.territoryRevision}, saved ${formatDatabaseDate(
                  workspace.draft.savedAt
                )}.`
              : "No shared database draft has been saved yet."
          );
        }
      } catch (error) {
        setDatabaseStatus("error");
        setDatabaseNotice(
          error instanceof Error
            ? error.message
            : "The LunaSphere database workspace could not be loaded."
        );
      }
    },
    []
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedDraft = loadLunaSphereStudioDraft(
        window.localStorage,
        baselineGeography
      );

      if (savedDraft.status === "loaded") {
        dispatchHistory({
          type: "replace",
          geography: savedDraft.geography,
          recordCurrent: false,
        });
        setLastSavedAt(savedDraft.savedAt);
        setDraftStatus("saved");
        setDraftNotice(
          `${savedDraft.migratedLegacyDraft ? "Migrated and recovered" : "Recovered"} the local Studio geography draft saved ${new Date(
            savedDraft.savedAt
          ).toLocaleString()}.`
        );
      } else if (savedDraft.status === "invalid") {
        setDraftStatus("error");
        setDraftNotice(savedDraft.message);
      } else {
        setDraftStatus("not-saved");
      }

      setDraftReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    void refreshDatabaseWorkspace();
  }, [draftReady, refreshDatabaseWorkspace]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    const autosaveToken = autosaveTokenRef.current + 1;
    autosaveTokenRef.current = autosaveToken;

    const savingStatusTimeoutId = window.setTimeout(() => {
      if (autosaveToken === autosaveTokenRef.current) {
        setDraftStatus("saving");
      }
    }, 0);

    const timeoutId = window.setTimeout(() => {
      if (autosaveToken !== autosaveTokenRef.current) {
        return;
      }

      const result = saveLunaSphereStudioDraft(
        window.localStorage,
        workingGeography
      );

      if (result.ok) {
        setLastSavedAt(result.savedAt);
        setDraftStatus("saved");
      } else {
        setDraftStatus("error");
        setDraftNotice(result.message);
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      window.clearTimeout(savingStatusTimeoutId);
      window.clearTimeout(timeoutId);
    };
  }, [draftReady, workingGeography]);

  useEffect(() => {
    function handleKeyboardShortcut(event: KeyboardEvent) {
      if (isPreviewingRelease || isTextEntryElement(event.target)) {
        return;
      }

      const commandKey = event.ctrlKey || event.metaKey;
      const normalizedKey = event.key.toLowerCase();

      if (commandKey && normalizedKey === "z") {
        event.preventDefault();
        dispatchHistory({
          type: event.shiftKey ? "redo" : "undo",
        });
        setSelectedNodeId(null);
        setSelectedTerritoryPointIndex(null);
        return;
      }

      if (commandKey && normalizedKey === "y") {
        event.preventDefault();
        dispatchHistory({ type: "redo" });
        setSelectedNodeId(null);
        setSelectedTerritoryPointIndex(null);
        return;
      }

      if (
        event.key === "Delete" ||
        event.key === "Backspace"
      ) {
        if (
          selectedTerritoryId &&
          selectedTerritoryPointIndex !== null &&
          selectedTerritoryCanRemovePoint
        ) {
          event.preventDefault();
          dispatchHistory({
            type: "apply",
            update: (currentGeography) => ({
              ...currentGeography,
              territories: removeSettlementBoundaryPoint(
                currentGeography.territories,
                selectedTerritoryId,
                selectedTerritoryPointIndex
              ),
            }),
          });
          setSelectedTerritoryPointIndex(null);
          return;
        }

        if (selectedNodeId && removableNodeEdge) {
          event.preventDefault();
          dispatchHistory({
            type: "apply",
            update: (currentGeography) => ({
              ...currentGeography,
              topology: removeTopologyEdgeNode(
                currentGeography.topology,
                removableNodeEdge.id,
                selectedNodeId
              ),
            }),
          });
          setSelectedNodeId(null);
        }
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcut);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyboardShortcut
      );
  }, [
    isPreviewingRelease,
    removableNodeEdge,
    selectedNodeId,
    selectedTerritoryCanRemovePoint,
    selectedTerritoryId,
    selectedTerritoryPointIndex,
  ]);

  function selectState(stateName: string) {
    setSelectedState(stateName);
    setSelectedNodeId(null);
    setSelectedTerritoryId(null);
    setSelectedTerritoryPointIndex(null);
  }

  function selectTerritory(territoryId: string) {
    const definition = getSettlementDefinition(
      territoryLayout,
      territoryId
    );

    if (!definition) {
      return;
    }

    setSelectedState(definition.stateName);
    setSelectedTerritoryId(territoryId);
    setSelectedTerritoryPointIndex(null);
    setSelectedNodeId(null);
  }

  function updateTerritoryBoundaryFromMap(
    territoryId: string,
    pointIndex: number,
    mapCoordinate: [number, number],
    incrementRevision: boolean
  ) {
    dispatchHistory({
      type: "preview",
      update: (currentGeography) => {
        const definition = getSettlementDefinition(
          currentGeography.territories,
          territoryId
        );

        if (!definition) {
          return currentGeography;
        }

        const resolved = resolveStateTerritories(
          currentGeography.topology,
          currentGeography.territories,
          definition.stateName
        );

        if (!resolved) {
          return currentGeography;
        }

        const relativeCoordinate =
          convertLunarCoordinateToStateRelative(
            mapCoordinate,
            resolved.stateBoundary,
            resolved.interiorOrigin
          );
        const territories = moveSettlementBoundaryPoint(
          currentGeography.territories,
          territoryId,
          pointIndex,
          relativeCoordinate,
          { incrementRevision }
        );

        return territories === currentGeography.territories
          ? currentGeography
          : {
              ...currentGeography,
              territories,
            };
      },
    });
  }

  function updateTerritoryCenterFromMap(
    territoryId: string,
    mapCoordinate: [number, number],
    incrementRevision: boolean
  ) {
    dispatchHistory({
      type: "preview",
      update: (currentGeography) => {
        const definition = getSettlementDefinition(
          currentGeography.territories,
          territoryId
        );

        if (!definition) {
          return currentGeography;
        }

        const resolved = resolveStateTerritories(
          currentGeography.topology,
          currentGeography.territories,
          definition.stateName
        );

        if (!resolved) {
          return currentGeography;
        }

        const relativeCoordinate =
          convertLunarCoordinateToStateRelative(
            mapCoordinate,
            resolved.stateBoundary,
            resolved.interiorOrigin
          );
        const territories = moveSettlementCenter(
          currentGeography.territories,
          territoryId,
          relativeCoordinate,
          { incrementRevision }
        );

        return territories === currentGeography.territories
          ? currentGeography
          : {
              ...currentGeography,
              territories,
            };
      },
    });
  }

  function addSelectedTerritoryPoint(segmentIndex: number) {
    if (!selectedTerritoryId) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        territories: insertSettlementBoundaryPoint(
          currentGeography.territories,
          selectedTerritoryId,
          segmentIndex
        ),
      }),
    });
    setSelectedTerritoryPointIndex(segmentIndex + 1);
  }

  function removeSelectedTerritoryPoint() {
    if (
      !selectedTerritoryId ||
      selectedTerritoryPointIndex === null ||
      !selectedTerritoryCanRemovePoint
    ) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        territories: removeSettlementBoundaryPoint(
          currentGeography.territories,
          selectedTerritoryId,
          selectedTerritoryPointIndex
        ),
      }),
    });
    setSelectedTerritoryPointIndex(null);
  }

  function resetSelectedTerritory() {
    if (!selectedTerritoryId) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        territories: restoreSettlementDefinition(
          currentGeography.territories,
          baselineTerritoryLayout,
          selectedTerritoryId
        ),
      }),
    });
    setSelectedTerritoryPointIndex(null);
  }

  function resetSelectedStateTerritories() {
    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        territories: restoreStateTerritories(
          currentGeography.territories,
          baselineTerritoryLayout,
          selectedState
        ),
      }),
    });
    setSelectedTerritoryPointIndex(null);
  }

  function nudgeSelectedTerritoryPoint(
    deltaY: number,
    deltaX: number
  ) {
    if (
      !selectedTerritoryId ||
      selectedTerritoryPointIndex === null ||
      !selectedTerritoryDefinition
    ) {
      return;
    }

    const point =
      selectedTerritoryDefinition.boundary[
        selectedTerritoryPointIndex
      ];

    if (!point) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        territories: moveSettlementBoundaryPoint(
          currentGeography.territories,
          selectedTerritoryId,
          selectedTerritoryPointIndex,
          [point[0] + deltaY, point[1] + deltaX]
        ),
      }),
    });
  }

  function nudgeSelectedTerritoryCenter(
    deltaY: number,
    deltaX: number
  ) {
    if (!selectedTerritoryId || !selectedTerritoryDefinition) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        territories: moveSettlementCenter(
          currentGeography.territories,
          selectedTerritoryId,
          [
            selectedTerritoryDefinition.center[0] + deltaY,
            selectedTerritoryDefinition.center[1] + deltaX,
          ]
        ),
      }),
    });
  }

  function addControlPoint(target: EdgeSegmentTarget) {
    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        topology: insertTopologyEdgeNode(
          currentGeography.topology,
          target.edgeId,
          target.segmentIndex,
          target.position
        ),
      }),
    });
    setSelectedNodeId(null);
  }

  function removeSelectedControlPoint() {
    if (!selectedNodeId || !removableNodeEdge) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        topology: removeTopologyEdgeNode(
          currentGeography.topology,
          removableNodeEdge.id,
          selectedNodeId
        ),
      }),
    });
    setSelectedNodeId(null);
  }

  function nudgeSelectedNode(deltaY: number, deltaX: number) {
    if (!selectedNode) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        topology: moveTopologyNode(
          currentGeography.topology,
          selectedNode.id,
          [
            selectedNode.coordinate[0] + deltaY,
            selectedNode.coordinate[1] + deltaX,
          ]
        ),
      }),
    });
  }

  function resetSelectedState() {
    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        topology: restoreTopologyState(
          currentGeography.topology,
          baselineTopology,
          selectedState
        ),
      }),
    });
    setSelectedNodeId(null);
  }

  function resetAllStates() {
    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        topology: cloneTopology(baselineTopology),
      }),
    });
    setSelectedNodeId(null);
  }

  function undo() {
    dispatchHistory({ type: "undo" });
    setSelectedNodeId(null);
    setSelectedTerritoryPointIndex(null);
  }

  function redo() {
    dispatchHistory({ type: "redo" });
    setSelectedNodeId(null);
    setSelectedTerritoryPointIndex(null);
  }

  function saveDraftNow() {
    const result = saveLunaSphereStudioDraft(
      window.localStorage,
      workingGeography
    );

    if (result.ok) {
      setLastSavedAt(result.savedAt);
      setDraftStatus("saved");
      setDraftNotice("The current geography draft was saved locally.");
    } else {
      setDraftStatus("error");
      setDraftNotice(result.message);
    }
  }

  function reloadSavedDraft() {
    const savedDraft = loadLunaSphereStudioDraft(
      window.localStorage,
      baselineGeography
    );

    if (savedDraft.status === "loaded") {
      dispatchHistory({
        type: "replace",
        geography: savedDraft.geography,
        recordCurrent: true,
      });
      setLastSavedAt(savedDraft.savedAt);
      setDraftStatus("saved");
      setDraftNotice("Reloaded the most recent local draft.");
      setSelectedNodeId(null);
      return;
    }

    setDraftStatus(
      savedDraft.status === "invalid" ? "error" : "not-saved"
    );
    setDraftNotice(
      savedDraft.status === "invalid"
        ? savedDraft.message
        : "No saved local draft is available."
    );
  }

  function clearSavedDraft() {
    autosaveTokenRef.current += 1;

    const cleared = clearLunaSphereStudioDraft(
      window.localStorage
    );

    if (cleared) {
      setLastSavedAt(null);
      setDraftStatus("not-saved");
      setDraftNotice(
        "The browser copy was cleared. Current unsaved map edits remain open."
      );
    } else {
      setDraftStatus("error");
      setDraftNotice("The browser draft could not be cleared.");
    }
  }

  async function saveDatabaseDraft() {
    if (!workingValidation.valid) {
      setDatabaseNotice(
        "Fix all state and settlement geography errors before saving the shared database draft."
      );
      return;
    }

    setDatabaseStatus("saving");

    try {
      const response = await fetch(GEOGRAPHY_API_PATH, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          geography: workingGeography,
          expectedSavedAt: databaseDraft?.savedAt ?? null,
        }),
      });
      const result = await readResponseBody<{
        draft: DatabaseDraftMetadata;
      }>(response);

      if (
        !hasCompatibleGeographyDocumentStructure(
          result.draft.geography,
          baselineGeography
        )
      ) {
        throw new Error(
          "The saved database draft response was incompatible."
        );
      }

      setDatabaseDraft(result.draft);
      setDatabaseStatus("ready");
      setDatabaseNotice(
        `Shared database draft saved at state revision ${result.draft.topologyRevision} and territory revision ${result.draft.territoryRevision}.`
      );
    } catch (error) {
      setDatabaseStatus("error");
      setDatabaseNotice(
        error instanceof Error
          ? error.message
          : "The shared database draft could not be saved."
      );
    }
  }

  function loadDatabaseDraft() {
    if (!databaseDraft) {
      setDatabaseNotice(
        "No shared database draft is available to load."
      );
      return;
    }

    if (
      !hasCompatibleGeographyDocumentStructure(
        databaseDraft.geography,
        baselineGeography
      )
    ) {
      setDatabaseStatus("error");
      setDatabaseNotice(
        "The shared database draft is incompatible with this Studio version."
      );
      return;
    }

    dispatchHistory({
      type: "replace",
      geography: databaseDraft.geography,
      recordCurrent: true,
    });
    setSelectedNodeId(null);
    setDatabaseStatus("ready");
    setDatabaseNotice(
      `Loaded shared database draft state revision ${databaseDraft.topologyRevision} and territory revision ${databaseDraft.territoryRevision}. Your previous open version can be restored with Undo.`
    );
  }

  async function publishDatabaseRelease() {
    if (!workingValidation.valid) {
      setDatabaseNotice(
        "Fix all state and settlement geography errors before publishing a release."
      );
      return;
    }

    const confirmed = window.confirm(
      "Publish this validated state, city, and town geography as the next immutable LunaSphere release? Publishing records the release, but the public Moon Map will continue using only the state layer until later settlement activation work."
    );

    if (!confirmed) {
      return;
    }

    setDatabaseStatus("publishing");

    try {
      const response = await fetch(
        `${GEOGRAPHY_API_PATH}/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ geography: workingGeography }),
        }
      );
      const result = await readResponseBody<{
        draft: DatabaseDraftMetadata;
        release: GeographyReleaseMetadata;
      }>(response);

      setDatabaseDraft(result.draft);
      setLatestRelease(result.release);
      setReleases((currentReleases) => [
        result.release,
        ...currentReleases.filter(
          (release) =>
            release.releaseNumber !== result.release.releaseNumber
        ),
      ]);
      setDatabaseStatus("ready");
      setDatabaseNotice(
        `Published immutable LunaSphere geography release ${result.release.releaseNumber}. Activate it separately when it is ready for the public Moon Map.`
      );
    } catch (error) {
      setDatabaseStatus("error");
      setDatabaseNotice(
        error instanceof Error
          ? error.message
          : "The LunaSphere geography release could not be published."
      );
    }
  }

  async function previewGeographyRelease(releaseNumber: number) {
    setDatabaseStatus("previewing");

    try {
      const response = await fetch(
        `${GEOGRAPHY_API_PATH}/releases/${releaseNumber}`,
        { cache: "no-store" }
      );
      const result = await readResponseBody<{
        release: GeographyReleaseDetail;
      }>(response);

      if (
        !hasCompatibleGeographyDocumentStructure(
          result.release.geography,
          baselineGeography
        )
      ) {
        throw new Error(
          "The selected release is incompatible with this Studio version."
        );
      }

      setReleasePreview(result.release);
      setSelectedNodeId(null);
      setDatabaseStatus("ready");
      setDatabaseNotice(
        `Previewing immutable geography release ${result.release.releaseNumber}. Editing and draft-saving controls are temporarily disabled.`
      );
    } catch (error) {
      setDatabaseStatus("error");
      setDatabaseNotice(
        error instanceof Error
          ? error.message
          : "The LunaSphere geography release could not be previewed."
      );
    }
  }

  function exitReleasePreview() {
    if (!releasePreview) {
      return;
    }

    const releaseNumber = releasePreview.releaseNumber;
    setReleasePreview(null);
    setSelectedNodeId(null);
    setDatabaseStatus("ready");
    setDatabaseNotice(
      `Closed release ${releaseNumber} preview and returned to the open Studio draft.`
    );
  }

  function copyReleasePreviewToDraft() {
    if (!releasePreview) {
      return;
    }

    const copiedGeography = cloneGeographyDocument(
      releasePreview.geography
    );
    copiedGeography.topology = {
      ...copiedGeography.topology,
      status: "draft",
      revision:
        Math.max(
          workingTopology.revision,
          releasePreview.geography.topology.revision
        ) + 1,
    };
    copiedGeography.territories = {
      ...copiedGeography.territories,
      status: "draft",
      revision:
        Math.max(
          workingTerritoryLayout.revision,
          releasePreview.geography.territories.revision
        ) + 1,
    };
    const releaseNumber = releasePreview.releaseNumber;

    dispatchHistory({
      type: "replace",
      geography: copiedGeography,
      recordCurrent: true,
    });
    setReleasePreview(null);
    setSelectedNodeId(null);
    setDatabaseStatus("ready");
    setDatabaseNotice(
      `Copied release ${releaseNumber} into the editable Studio draft. Save it locally or to the shared database when ready.`
    );
  }

  async function activateRelease(releaseNumber: number) {
    const isRollback =
      activeRelease !== null &&
      releaseNumber < activeRelease.releaseNumber;
    const actionLabel = isRollback ? "roll back to" : "activate";
    const confirmed = window.confirm(
      `${actionLabel[0].toUpperCase()}${actionLabel.slice(1)} LunaSphere geography release ${releaseNumber}? This records the controlled active release, preserves the previous activation history, and changes the public Moon Map on its next refresh.`
    );

    if (!confirmed) {
      return;
    }

    setDatabaseStatus("activating");

    try {
      const response = await fetch(
        `${GEOGRAPHY_API_PATH}/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ releaseNumber }),
        }
      );
      const result = await readResponseBody<{
        activeRelease: GeographyActivationMetadata;
      }>(response);

      setActiveRelease(result.activeRelease);
      setDatabaseStatus("ready");
      setDatabaseNotice(
        `${isRollback ? "Rolled back" : "Activated"} LunaSphere geography release ${result.activeRelease.releaseNumber}. The public Moon Map will use this state geography on its next refresh.`
      );
    } catch (error) {
      setDatabaseStatus("error");
      setDatabaseNotice(
        error instanceof Error
          ? error.message
          : "The LunaSphere geography release could not be activated."
      );
    }
  }

  function exportSelectedState() {
    if (
      !validation.valid ||
      !territoryValidation.valid ||
      !selectedRegion ||
      !selectedTopologyState
    ) {
      return;
    }

    downloadJson(
      `${selectedTopologyState.slug}-state-draft.json`,
      {
        topologyId: topology.id,
        schemaVersion: topology.schemaVersion,
        revision: topology.revision,
        status: topology.status,
        state: {
          ...selectedTopologyState,
          labelPosition: [
            ...selectedTopologyState.labelPosition,
          ],
          edges: selectedTopologyState.edges.map(
            (edgeReference) => ({ ...edgeReference })
          ),
          positions: selectedRegion.positions.map(([y, x]) => [
            Number(y.toFixed(4)),
            Number(x.toFixed(4)),
          ]),
        },
        territories: getSettlementDefinitionsForState(
          territoryLayout,
          selectedState
        ),
      }
    );
  }

  function exportAllStates() {
    if (!validation.valid || !territoryValidation.valid) {
      return;
    }

    downloadJson(
      `lunasphere-geography-draft-state-r${topology.revision}-territory-r${territoryLayout.revision}.json`,
      geography
    );
  }

  const saveStatusLabel =
    draftStatus === "saving"
      ? "Saving…"
      : draftStatus === "error"
        ? "Save error"
        : formatSavedAt(lastSavedAt);
  const databaseBusy =
    databaseStatus === "loading" ||
    databaseStatus === "saving" ||
    databaseStatus === "publishing" ||
    databaseStatus === "previewing" ||
    databaseStatus === "activating";
  const databaseDraftIsCurrent =
    databaseDraft !== null &&
    geographiesHaveSameContent(
      databaseDraft.geography,
      workingGeography
    );
  const databaseStatusLabel =
    databaseStatus === "loading"
      ? "Loading database…"
      : databaseStatus === "saving"
        ? "Saving database draft…"
        : databaseStatus === "publishing"
          ? "Publishing release…"
          : databaseStatus === "previewing"
            ? "Loading release preview…"
            : databaseStatus === "activating"
              ? "Activating release…"
          : databaseStatus === "error"
            ? "Database error"
            : databaseDraft
              ? `State r${databaseDraft.topologyRevision} · Territory r${databaseDraft.territoryRevision}${
                  databaseDraftIsCurrent ? " · current" : " · differs"
                }`
              : "No database draft";

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 rounded-3xl border border-yellow-400/30 bg-zinc-950 p-6">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
            LunaSphere Studio
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Shared State and Territory Geography Editor
          </h1>

          <p className="mt-2 max-w-4xl text-sm text-zinc-400">
            Every state border is stored once. Dragging a white handle
            updates all states that share it. Cities and towns now use
            state-relative territory geometry that reflows with the selected
            state. Browser autosave and database releases protect the state
            topology while Moon-perimeter handles remain locked to the
            circular saleable boundary.
          </p>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="min-w-64">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Selected state
              </span>

              <select
                value={selectedState}
                onChange={(event) =>
                  selectState(event.target.value)
                }
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 font-bold text-white"
              >
                {regions.map((region) => (
                  <option key={region.name} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Territory view
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  ["states", "city", "town", "all"] as const
                ).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTerritoryDisplayMode(mode)}
                    className={`rounded-xl border px-3 py-3 text-xs font-black uppercase tracking-wider transition ${
                      territoryDisplayMode === mode
                        ? "border-cyan-300 bg-cyan-300 text-black"
                        : "border-white/15 bg-black text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {mode === "states"
                      ? "States"
                      : mode === "city"
                        ? "Cities"
                        : mode === "town"
                          ? "Towns"
                          : "All"}
                  </button>
                ))}
              </div>
            </div>

            <label className="min-w-72">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Selected city or town
              </span>
              <select
                value={selectedTerritoryId ?? ""}
                onChange={(event) => {
                  const territoryId = event.target.value;
                  if (territoryId) {
                    selectTerritory(territoryId);
                  } else {
                    setSelectedTerritoryId(null);
                    setSelectedTerritoryPointIndex(null);
                  }
                }}
                disabled={
                  territoryDisplayMode === "states" ||
                  visibleSettlementOptions.length === 0
                }
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <option value="">Choose a territory</option>
                {visibleSettlementOptions.map((territory) => (
                  <option key={territory.id} value={territory.id}>
                    {territory.kind === "city" ? "City" : "Town"}{" "}
                    {territory.territoryNumber}: {territory.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={undo}
              disabled={isPreviewingRelease || history.past.length === 0}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Undo
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={isPreviewingRelease || history.future.length === 0}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Redo
            </button>

            <button
              type="button"
              onClick={saveDraftNow}
              disabled={isPreviewingRelease}
              className="rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm font-black text-sky-100 hover:bg-sky-400/20"
            >
              Save Draft Now
            </button>

            <span className="rounded-xl border border-white/10 bg-black px-4 py-3 text-xs font-bold text-zinc-300">
              {saveStatusLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetSelectedState}
              disabled={isPreviewingRelease}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/10"
            >
              Reset State
            </button>

            <button
              type="button"
              onClick={resetAllStates}
              disabled={isPreviewingRelease}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/10"
            >
              Reset All
            </button>

            <button
              type="button"
              onClick={resetSelectedTerritory}
              disabled={isPreviewingRelease || !selectedTerritoryId}
              className="rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-bold text-cyan-100 enabled:hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Reset Selected Territory
            </button>

            <button
              type="button"
              onClick={resetSelectedStateTerritories}
              disabled={isPreviewingRelease}
              className="rounded-xl border border-amber-300/30 px-4 py-3 text-sm font-bold text-amber-100 enabled:hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Reset State Cities & Towns
            </button>

            <button
              type="button"
              onClick={reloadSavedDraft}
              disabled={isPreviewingRelease || !lastSavedAt}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Reload Saved Draft
            </button>

            <button
              type="button"
              onClick={clearSavedDraft}
              disabled={!lastSavedAt}
              className="rounded-xl border border-red-300/30 px-4 py-3 text-sm font-bold text-red-100 enabled:hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Clear Browser Draft
            </button>

            <button
              type="button"
              onClick={exportSelectedState}
              disabled={!validation.valid || !territoryValidation.valid}
              className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black enabled:hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Export Selected State
            </button>

            <button
              type="button"
              onClick={exportAllStates}
              disabled={!validation.valid || !territoryValidation.valid}
              className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Export Geography Draft
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-violet-400/25 bg-violet-400/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-200">
                  Shared Database Workspace
                </p>
                <p className="mt-1 text-sm text-violet-50/75">
                  Save one cross-device geography draft, including states,
                  cities, and towns. Publish immutable releases, preview any
                  release, and choose the release whose state layer is used by
                  the public Moon Map.
                </p>
              </div>

              <span className="rounded-xl border border-violet-100/20 bg-black/30 px-4 py-2 text-xs font-bold text-violet-50">
                {databaseStatusLabel}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void saveDatabaseDraft()}
                disabled={
                  isPreviewingRelease ||
                  !workingValidation.valid ||
                  databaseBusy
                }
                className="rounded-xl bg-violet-200 px-4 py-3 text-sm font-black text-violet-950 enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                Save Database Draft
              </button>

              <button
                type="button"
                onClick={loadDatabaseDraft}
                disabled={
                  isPreviewingRelease ||
                  !databaseDraft ||
                  databaseBusy
                }
                className="rounded-xl border border-violet-100/30 px-4 py-3 text-sm font-bold text-violet-50 enabled:hover:bg-violet-100/10 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Load Database Draft
              </button>

              <button
                type="button"
                onClick={() => void refreshDatabaseWorkspace(true)}
                disabled={databaseBusy}
                className="rounded-xl border border-violet-100/30 px-4 py-3 text-sm font-bold text-violet-50 enabled:hover:bg-violet-100/10 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Refresh Database Status
              </button>

              <button
                type="button"
                onClick={() => void publishDatabaseRelease()}
                disabled={
                  isPreviewingRelease ||
                  !workingValidation.valid ||
                  !databaseDraftIsCurrent ||
                  databaseBusy
                }
                className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100 enabled:hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-35"
                title={
                  databaseDraftIsCurrent
                    ? "Publish the current database-saved draft"
                    : "Save the current topology to the database before publishing"
                }
              >
                Publish Numbered Release
              </button>
            </div>

            {!databaseDraftIsCurrent && databaseDraft && (
              <p className="mt-3 text-xs font-bold text-amber-200">
                The open geography differs from the shared database draft.
                Save it to the database before publishing a release.
              </p>
            )}

            <div className="mt-4 grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-violet-50/80">
                <strong className="text-violet-100">Database draft:</strong>{" "}
                {databaseDraft
                  ? `State r${databaseDraft.topologyRevision} · Territory r${databaseDraft.territoryRevision}, saved ${formatDatabaseDate(
                      databaseDraft.savedAt
                    )}`
                  : "Not saved yet"}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-violet-50/80">
                <strong className="text-violet-100">Latest release:</strong>{" "}
                {latestRelease
                  ? `Release ${latestRelease.releaseNumber}, state r${latestRelease.topologyRevision} · territory r${latestRelease.territoryRevision}, published ${formatDatabaseDate(
                      latestRelease.publishedAt
                    )}`
                  : "No releases published yet"}
              </div>

              <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-emerald-50/85">
                <strong className="text-emerald-100">Controlled active release:</strong>{" "}
                {activeRelease
                  ? `Release ${activeRelease.releaseNumber}, activated ${formatDatabaseDate(
                      activeRelease.activatedAt
                    )}`
                  : "No release activated yet"}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-100">
                    Release Management
                  </p>
                  <p className="mt-1 text-xs text-violet-50/65">
                    Preview an immutable release without changing your draft. Activating an older release creates a safe rollback record.
                  </p>
                </div>

                {releasePreview && (
                  <span className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs font-black text-amber-100">
                    Previewing Release {releasePreview.releaseNumber}
                  </span>
                )}
              </div>

              {releases.length === 0 ? (
                <p className="mt-3 text-sm text-violet-50/60">
                  Publish a numbered release to begin release management.
                </p>
              ) : (
                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {releases.map((release) => {
                    const isActive =
                      activeRelease?.releaseNumber ===
                      release.releaseNumber;
                    const isPreviewed =
                      releasePreview?.releaseNumber ===
                      release.releaseNumber;
                    const isRollback =
                      activeRelease !== null &&
                      release.releaseNumber <
                        activeRelease.releaseNumber;

                    return (
                      <div
                        key={release.releaseNumber}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950/80 p-3"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-white">
                              Release {release.releaseNumber}
                            </p>
                            {isActive && (
                              <span className="rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-950">
                                Active
                              </span>
                            )}
                            {isPreviewed && (
                              <span className="rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950">
                                Preview
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-zinc-400">
                            State r{release.topologyRevision} · Territory r{release.territoryRevision} · Published {formatDatabaseDate(
                              release.publishedAt
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void previewGeographyRelease(
                                release.releaseNumber
                              )
                            }
                            disabled={databaseBusy || isPreviewed}
                            className="rounded-lg border border-violet-200/30 px-3 py-2 text-xs font-black text-violet-50 enabled:hover:bg-violet-100/10 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            {isPreviewed ? "Previewing" : "Preview"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void activateRelease(
                                release.releaseNumber
                              )
                            }
                            disabled={databaseBusy || isActive}
                            className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100 enabled:hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            {isActive
                              ? "Active"
                              : isRollback
                                ? "Roll Back"
                                : "Activate"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {releasePreview && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-4 text-amber-50">
              <div>
                <p className="text-sm font-black">
                  Read-only preview: Release {releasePreview.releaseNumber}
                </p>
                <p className="mt-1 text-xs text-amber-50/75">
                  Published {formatDatabaseDate(
                    releasePreview.publishedAt
                  )}. Your editable draft remains preserved in memory and browser autosave.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReleasePreviewToDraft}
                  className="rounded-lg bg-amber-200 px-3 py-2 text-xs font-black text-amber-950 hover:bg-white"
                >
                  Copy Release to Draft
                </button>
                <button
                  type="button"
                  onClick={exitReleasePreview}
                  className="rounded-lg border border-amber-100/30 px-3 py-2 text-xs font-black text-amber-50 hover:bg-amber-100/10"
                >
                  Exit Preview
                </button>
              </div>
            </div>
          )}

          {draftNotice && (
            <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
              <p>{draftNotice}</p>
              <button
                type="button"
                onClick={() => setDraftNotice(null)}
                className="shrink-0 font-black text-sky-50/70 hover:text-white"
                aria-label="Dismiss draft message"
              >
                ×
              </button>
            </div>
          )}

          {databaseNotice && (
            <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm text-violet-100">
              <p>{databaseNotice}</p>
              <button
                type="button"
                onClick={() => setDatabaseNotice(null)}
                className="shrink-0 font-black text-violet-50/70 hover:text-white"
                aria-label="Dismiss database message"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="h-[820px] overflow-hidden rounded-3xl border border-yellow-400/40 bg-black">
            <MapContainer
              key="lunasphere-designer-map"
              crs={LunarCRS}
              center={[500, 500]}
              zoom={0}
              minZoom={-2}
              maxZoom={7}
              zoomControl={false}
              preferCanvas={false}
              zoomAnimation
              inertia
              maxBounds={bounds}
              maxBoundsViscosity={0.8}
              style={{
                height: "100%",
                width: "100%",
                background: "#000",
              }}
            >
              <LunarTileLayer />

              <ZoomControl position="topright" />
              <ScaleControl position="bottomleft" />

              {regions.map((region) => {
                const isSelected =
                  region.name === selectedState;

                return (
                  <Polygon
                    key={region.name}
                    positions={region.positions}
                    pathOptions={{
                      color: isSelected
                        ? "#facc15"
                        : "#ffffff",
                      weight: isSelected ? 3 : 1,
                      opacity: isSelected ? 1 : 0.18,
                      fillColor: "#facc15",
                      fillOpacity: isSelected ? 0.13 : 0.01,
                    }}
                    eventHandlers={{
                      click: () => selectState(region.name),
                    }}
                  >
                    <Popup>{region.name}</Popup>
                  </Polygon>
                );
              })}

              {resolvedTerritories &&
                (territoryDisplayMode === "city" ||
                  territoryDisplayMode === "all") &&
                resolvedTerritories.cities.map((city) => {
                  const isSelected = city.id === selectedTerritoryId;

                  return (
                    <Polygon
                      key={`territory-${city.id}`}
                      positions={city.boundary}
                      pathOptions={{
                        color: isSelected ? "#ffffff" : "#22d3ee",
                        weight: isSelected ? 4 : 2,
                        opacity: 0.95,
                        fillColor: "#0891b2",
                        fillOpacity: isSelected ? 0.4 : 0.22,
                      }}
                      eventHandlers={{
                        click: () => selectTerritory(city.id),
                      }}
                    >
                      <Popup>
                        <strong>{city.name}</strong>
                        <br />
                        City {city.territoryNumber} · {city.stateName}
                        <br />
                        Area {city.area.toFixed(1)}
                        <br />
                        Click to edit
                      </Popup>
                    </Polygon>
                  );
                })}

              {resolvedTerritories &&
                (territoryDisplayMode === "town" ||
                  territoryDisplayMode === "all") &&
                resolvedTerritories.towns.map((town) => {
                  const isSelected = town.id === selectedTerritoryId;

                  return (
                    <Polygon
                      key={`territory-${town.id}`}
                      positions={town.boundary}
                      pathOptions={{
                        color: isSelected ? "#ffffff" : "#f59e0b",
                        weight: isSelected ? 3.5 : 1.4,
                        opacity: 0.9,
                        fillColor: "#d97706",
                        fillOpacity: isSelected ? 0.4 : 0.2,
                      }}
                      eventHandlers={{
                        click: () => selectTerritory(town.id),
                      }}
                    >
                      <Popup>
                        <strong>{town.name}</strong>
                        <br />
                        Town {town.territoryNumber} · {town.stateName}
                        <br />
                        Area {town.area.toFixed(1)}
                        <br />
                        Click to edit
                      </Popup>
                    </Polygon>
                  );
                })}

              {showStateEditingHandles &&
                selectedEdges.map((edge) => (
                  <Polyline
                    key={`${selectedState}-${edge.id}`}
                    positions={createEdgePositions(edge, nodeById)}
                    pathOptions={{
                      color:
                        edge.kind === "moon-perimeter"
                          ? "#38bdf8"
                          : "#facc15",
                      weight: 4,
                      opacity: 0.9,
                      dashArray:
                        edge.kind === "moon-perimeter"
                          ? "8 7"
                          : undefined,
                    }}
                  />
                ))}

              {!isPreviewingRelease &&
                showStateEditingHandles &&
                edgeSegmentTargets.map((target) => (
                  <Marker
                    key={target.key}
                    position={target.position}
                    icon={addVertexIcon}
                    eventHandlers={{
                      click: () => addControlPoint(target),
                    }}
                  >
                    <Popup>Add a state-border control point</Popup>
                  </Marker>
                ))}

              {showStateEditingHandles &&
                selectedNodes.map((node) => (
                  <Marker
                    key={node.id}
                    position={node.coordinate}
                    icon={
                      node.id === selectedNodeId
                        ? selectedVertexIcon
                        : vertexIcon
                    }
                    draggable={!isPreviewingRelease}
                    eventHandlers={{
                      click: () => {
                        setSelectedNodeId(node.id);
                        setSelectedTerritoryId(null);
                        setSelectedTerritoryPointIndex(null);
                      },
                      dragstart: () => {
                        dragBaselineRef.current =
                          cloneGeographyDocument(geography);
                        setSelectedNodeId(node.id);
                        setSelectedTerritoryId(null);
                        setSelectedTerritoryPointIndex(null);
                      },
                      drag: (event) => {
                        const nextPosition = event.target.getLatLng();

                        dispatchHistory({
                          type: "preview",
                          update: (currentGeography) => ({
                            ...currentGeography,
                            topology: moveTopologyNode(
                              currentGeography.topology,
                              node.id,
                              [nextPosition.lat, nextPosition.lng],
                              { incrementRevision: false }
                            ),
                          }),
                        });
                      },
                      dragend: (event) => {
                        const baseline = dragBaselineRef.current;
                        const nextPosition = event.target.getLatLng();

                        dispatchHistory({
                          type: "preview",
                          update: (currentGeography) => ({
                            ...currentGeography,
                            topology: moveTopologyNode(
                              currentGeography.topology,
                              node.id,
                              [nextPosition.lat, nextPosition.lng],
                              { incrementRevision: false }
                            ),
                          }),
                        });

                        if (baseline) {
                          dispatchHistory({
                            type: "commit-preview",
                            baseline,
                          });
                        }

                        dragBaselineRef.current = null;
                      },
                    }}
                  />
                ))}

              {showTerritoryEditingHandles &&
                selectedResolvedTerritory && (
                  <>
                    <Marker
                      key={`${selectedResolvedTerritory.id}-center`}
                      position={selectedResolvedTerritory.center}
                      icon={
                        selectedResolvedTerritory.kind === "city"
                          ? cityTerritoryCenterIcon
                          : townTerritoryCenterIcon
                      }
                      draggable={!isPreviewingRelease}
                      eventHandlers={{
                        dragstart: () => {
                          dragBaselineRef.current =
                            cloneGeographyDocument(geography);
                          setSelectedTerritoryPointIndex(null);
                        },
                        drag: (event) => {
                          const nextPosition = event.target.getLatLng();
                          updateTerritoryCenterFromMap(
                            selectedResolvedTerritory.id,
                            [nextPosition.lat, nextPosition.lng],
                            false
                          );
                        },
                        dragend: (event) => {
                          const baseline = dragBaselineRef.current;
                          const nextPosition = event.target.getLatLng();
                          updateTerritoryCenterFromMap(
                            selectedResolvedTerritory.id,
                            [nextPosition.lat, nextPosition.lng],
                            false
                          );

                          if (baseline) {
                            dispatchHistory({
                              type: "commit-preview",
                              baseline,
                            });
                          }

                          dragBaselineRef.current = null;
                        },
                      }}
                    >
                      <Popup>Drag to move the entire territory</Popup>
                    </Marker>

                    {!isPreviewingRelease &&
                      selectedTerritorySegmentTargets.map((target) => (
                        <Marker
                          key={target.key}
                          position={target.position}
                          icon={
                            selectedResolvedTerritory.kind === "city"
                              ? cityTerritoryAddIcon
                              : townTerritoryAddIcon
                          }
                          eventHandlers={{
                            click: () =>
                              addSelectedTerritoryPoint(
                                target.segmentIndex
                              ),
                          }}
                        >
                          <Popup>Add a territory boundary point</Popup>
                        </Marker>
                      ))}

                    {selectedResolvedTerritory.boundary.map(
                      (position, pointIndex) => (
                        <Marker
                          key={`${selectedResolvedTerritory.id}-point-${pointIndex}`}
                          position={position}
                          icon={
                            selectedResolvedTerritory.kind === "city"
                              ? pointIndex ===
                                selectedTerritoryPointIndex
                                ? selectedCityTerritoryVertexIcon
                                : cityTerritoryVertexIcon
                              : pointIndex ===
                                  selectedTerritoryPointIndex
                                ? selectedTownTerritoryVertexIcon
                                : townTerritoryVertexIcon
                          }
                          draggable={!isPreviewingRelease}
                          eventHandlers={{
                            click: () => {
                              setSelectedTerritoryPointIndex(
                                pointIndex
                              );
                              setSelectedNodeId(null);
                            },
                            dragstart: () => {
                              dragBaselineRef.current =
                                cloneGeographyDocument(geography);
                              setSelectedTerritoryPointIndex(
                                pointIndex
                              );
                              setSelectedNodeId(null);
                            },
                            drag: (event) => {
                              const nextPosition =
                                event.target.getLatLng();
                              updateTerritoryBoundaryFromMap(
                                selectedResolvedTerritory.id,
                                pointIndex,
                                [nextPosition.lat, nextPosition.lng],
                                false
                              );
                            },
                            dragend: (event) => {
                              const baseline = dragBaselineRef.current;
                              const nextPosition =
                                event.target.getLatLng();
                              updateTerritoryBoundaryFromMap(
                                selectedResolvedTerritory.id,
                                pointIndex,
                                [nextPosition.lat, nextPosition.lng],
                                false
                              );

                              if (baseline) {
                                dispatchHistory({
                                  type: "commit-preview",
                                  baseline,
                                });
                              }

                              dragBaselineRef.current = null;
                            },
                          }}
                        />
                      )
                    )}
                  </>
                )}
            </MapContainer>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
              {isPreviewingRelease ? "Release Preview" : "Editing"}
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {selectedRegion?.name ?? "No state selected"}
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-black p-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Revisions
                </p>
                <p className="mt-1 text-lg font-black">
                  State {topology.revision} · Territory {territoryLayout.revision}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black p-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Handles
                </p>
                <p className="mt-1 text-xl font-black">
                  {selectedNodes.length}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black p-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  History
                </p>
                <p className="mt-1 text-xl font-black">
                  {history.past.length}/{history.future.length}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
                  Undo / redo
                </p>
              </div>

              <div
                className={`rounded-xl border p-3 ${
                  workingValidation.valid
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-red-400/30 bg-red-400/10"
                }`}
              >
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  Validation
                </p>
                <p className="mt-1 text-xl font-black">
                  {workingValidation.valid ? "Valid" : "Review"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              {isPreviewingRelease ? (
                <p>
                  This immutable release is displayed read-only. Exit the
                  preview to continue editing, or copy the release into a new
                  draft as a controlled starting point.
                </p>
              ) : (
                <>
                  <p>
                    Drag a white handle to reshape the selected state.
                    Shared neighbors move with the same border.
                  </p>

                  <p>
                    Click a green plus handle to add an editable point.
                    Press Ctrl+Z/Ctrl+Y to undo or redo.
                  </p>
                </>
              )}

              <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-cyan-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">
                      Nested Territory Foundation
                    </p>
                    <p className="mt-1 text-xs text-cyan-50/70">
                      Cities and towns use stable state-relative geometry,
                      so they move and resize automatically when this state
                      boundary changes.
                    </p>
                  </div>
                  <span
                    className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                      territoryValidation.valid
                        ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                        : "border-red-300/30 bg-red-400/10 text-red-100"
                    }`}
                  >
                    {territoryValidation.valid ? "Valid" : "Review"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-cyan-100/15 bg-black/30 p-2">
                    <p className="text-lg font-black">
                      {territorySummary.cityCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-cyan-50/60">
                      Cities
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-100/15 bg-black/30 p-2">
                    <p className="text-lg font-black text-amber-100">
                      {territorySummary.townCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-amber-50/60">
                      Towns
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-100/15 bg-black/30 p-2">
                    <p className="text-lg font-black text-emerald-100">
                      {territorySummary.ruralCoveragePercent.toFixed(1)}%
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-50/60">
                      Rural
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-cyan-50/75">
                  World plan: {territoryValidation.cityCount} cities ·{" "}
                  {territoryValidation.townCount} towns ·{" "}
                  {territoryValidation.errors.length} errors ·{" "}
                  {territoryValidation.warnings.length} warnings
                </p>

                {selectedTerritoryIssues.length > 0 && (
                  <div className="mt-3 max-h-28 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-2 text-[11px] text-cyan-50/75">
                    {selectedTerritoryIssues.slice(0, 4).map((issue) => (
                      <p key={`${issue.code}-${issue.territoryId ?? issue.stateId ?? issue.message}`}>
                        <strong>{issue.code}:</strong> {issue.message}
                      </p>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-[11px] font-bold text-cyan-100/80">
                  These overlays are Studio-only in this milestone. They do
                  not yet replace public city/town markers or generate
                  saleable blocks.
                </p>
              </div>

              {selectedResolvedTerritory &&
                selectedTerritoryDefinition && (
                  <div
                    className={`rounded-xl border p-3 ${
                      selectedResolvedTerritory.kind === "city"
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-50"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-50"
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                      Selected {selectedResolvedTerritory.kind}
                    </p>
                    <p className="mt-1 text-lg font-black">
                      {selectedResolvedTerritory.name}
                    </p>
                    <p className="mt-1 font-mono text-[11px] opacity-70">
                      {selectedResolvedTerritory.id} · Territory revision{" "}
                      {territoryLayout.revision}
                    </p>
                    <p className="mt-2 text-xs opacity-80">
                      Drag the diamond to move the entire territory. Drag the
                      circular handles to reshape its boundary. Plus handles
                      add detail points.
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-black">
                      <span />
                      <button
                        type="button"
                        onClick={() =>
                          selectedTerritoryPointIndex === null
                            ? nudgeSelectedTerritoryCenter(-0.005, 0)
                            : nudgeSelectedTerritoryPoint(-0.005, 0)
                        }
                        disabled={isPreviewingRelease}
                        className="rounded-lg border border-white/25 px-2 py-2 enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <span />
                      <button
                        type="button"
                        onClick={() =>
                          selectedTerritoryPointIndex === null
                            ? nudgeSelectedTerritoryCenter(0, -0.005)
                            : nudgeSelectedTerritoryPoint(0, -0.005)
                        }
                        disabled={isPreviewingRelease}
                        className="rounded-lg border border-white/25 px-2 py-2 enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          selectedTerritoryPointIndex === null
                            ? nudgeSelectedTerritoryCenter(0.005, 0)
                            : nudgeSelectedTerritoryPoint(0.005, 0)
                        }
                        disabled={isPreviewingRelease}
                        className="rounded-lg border border-white/25 px-2 py-2 enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          selectedTerritoryPointIndex === null
                            ? nudgeSelectedTerritoryCenter(0, 0.005)
                            : nudgeSelectedTerritoryPoint(0, 0.005)
                        }
                        disabled={isPreviewingRelease}
                        className="rounded-lg border border-white/25 px-2 py-2 enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        →
                      </button>
                    </div>

                    <p className="mt-2 text-[11px] opacity-75">
                      {selectedTerritoryPointIndex === null
                        ? "Precision controls move the entire territory."
                        : `Boundary point ${selectedTerritoryPointIndex + 1} of ${selectedTerritoryDefinition.boundary.length} selected.`}
                    </p>

                    <div className="mt-3 grid gap-2">
                      <button
                        type="button"
                        onClick={removeSelectedTerritoryPoint}
                        disabled={
                          isPreviewingRelease ||
                          !selectedTerritoryCanRemovePoint
                        }
                        className="rounded-lg border border-white/25 px-3 py-2 text-xs font-black enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {selectedTerritoryPointIndex === null
                          ? "Select a Boundary Point to Remove"
                          : selectedTerritoryCanRemovePoint
                            ? "Remove Selected Boundary Point"
                            : "Minimum Boundary Detail Reached"}
                      </button>
                      <button
                        type="button"
                        onClick={resetSelectedTerritory}
                        disabled={isPreviewingRelease}
                        className="rounded-lg border border-white/25 px-3 py-2 text-xs font-black enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        Reset This Territory
                      </button>
                    </div>
                  </div>
                )}

              {selectedNode && (
                <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3">
                  <p className="font-bold text-yellow-100">
                    Selected handle
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-yellow-50/80">
                    {selectedNode.id}
                  </p>
                  <p className="mt-2 font-mono text-xs text-yellow-50/80">
                    Y {selectedNode.coordinate[0].toFixed(4)} · X{" "}
                    {selectedNode.coordinate[1].toFixed(4)}
                  </p>
                  <p className="mt-2 text-xs text-yellow-50/70">
                    {selectedNodeIsPerimeter
                      ? "Moon perimeter: movement stays locked to the circular saleable boundary."
                      : `Shared by ${selectedNodeStateNames.length} state${
                          selectedNodeStateNames.length === 1
                            ? ""
                            : "s"
                        }: ${selectedNodeStateNames.join(", ")}`}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-black">
                    <span />
                    <button
                      type="button"
                      onClick={() =>
                        nudgeSelectedNode(-NUDGE_DISTANCE, 0)
                      }
                      disabled={isPreviewingRelease}
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 enabled:hover:bg-yellow-100/10 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Nudge selected handle up"
                    >
                      ↑
                    </button>
                    <span />
                    <button
                      type="button"
                      onClick={() =>
                        nudgeSelectedNode(0, -NUDGE_DISTANCE)
                      }
                      disabled={isPreviewingRelease}
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 enabled:hover:bg-yellow-100/10 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Nudge selected handle left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        nudgeSelectedNode(NUDGE_DISTANCE, 0)
                      }
                      disabled={isPreviewingRelease}
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 enabled:hover:bg-yellow-100/10 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Nudge selected handle down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        nudgeSelectedNode(0, NUDGE_DISTANCE)
                      }
                      disabled={isPreviewingRelease}
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 enabled:hover:bg-yellow-100/10 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Nudge selected handle right"
                    >
                      →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={removeSelectedControlPoint}
                    disabled={isPreviewingRelease || !removableNodeEdge}
                    className="mt-3 w-full rounded-lg border border-yellow-100/30 px-3 py-2 text-xs font-black text-yellow-50 enabled:hover:bg-yellow-100/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {removableNodeEdge
                      ? "Remove Control Point"
                      : "Junction Point Cannot Be Removed"}
                  </button>
                </div>
              )}

              <div
                className={`rounded-xl border p-3 ${
                  validation.valid
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                    : "border-red-400/30 bg-red-400/10 text-red-100"
                }`}
              >
                <p className="font-black">
                  {validation.valid
                    ? "Shared topology is valid"
                    : `${validation.errors.length} topology error${
                        validation.errors.length === 1 ? "" : "s"
                      }`}
                </p>
                <p className="mt-1 text-xs opacity-80">
                  {summary.stateCount} states · {summary.nodeCount}{" "}
                  nodes · {summary.sharedEdgeCount} shared borders ·{" "}
                  {validation.warnings.length} warnings
                </p>
                {!validation.valid && (
                  <p className="mt-2 text-xs font-bold">
                    Exports are disabled until all errors are fixed.
                  </p>
                )}
              </div>

              {!validation.valid && (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-red-400/20 bg-black p-3 text-xs text-red-100">
                  {validation.errors.slice(0, 8).map((issue) => (
                    <p
                      key={`${issue.code}-${issue.entityId ?? issue.message}`}
                    >
                      <strong>{issue.code}:</strong> {issue.message}
                    </p>
                  ))}
                </div>
              )}

              <p className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-3 text-sky-100">
                Browser autosave protects immediate work. The controlled
                active state release now drives the public Moon Map. Nested
                city and town territories remain Studio-only in this milestone,
                and parcels, reservations, checkout, and customer records are
                unchanged.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
