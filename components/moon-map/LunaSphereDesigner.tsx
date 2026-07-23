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
  geographyReadinessReportMatchesDocument,
  runGeographyReadinessAuditAsync,
  type GeographyReadinessAuditProgress,
  type GeographyReadinessReport,
} from "@/lib/lunasphere-geography-diagnostics";
import {
  PROTECTED_AREA_CATEGORIES,
  addProtectedArea,
  cloneProtectedAreaLayout,
  createInitialProtectedAreaLayout,
  deleteProtectedArea,
  getProtectedAreaDefinition,
  getProtectedAreasForState,
  insertProtectedAreaBoundaryPoint,
  moveProtectedAreaBoundaryPoint,
  moveProtectedAreaCenter,
  removeProtectedAreaBoundaryPoint,
  resolveProtectedAreasForState,
  restoreProtectedArea,
  restoreStateProtectedAreas,
  updateProtectedAreaMetadata,
  validateProtectedAreaLayout,
  type LunaSphereProtectedAreaCategory,
  type ResolvedLunaSphereProtectedArea,
} from "@/lib/lunasphere-protected-areas";
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
  naturalizeTopologyStateBorders,
  removeTopologyEdgeNode,
  restoreTopologyState,
  smoothTopologyStateBorders,
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
const baselineProtectedAreaLayout = createInitialProtectedAreaLayout(
  baselineTopology
);
const baselineGeography = createGeographyDocument(
  baselineTopology,
  baselineTerritoryLayout,
  baselineProtectedAreaLayout
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
const protectedAreaVertexIcon = createTerritoryVertexIcon("#f43f5e", false);
const selectedProtectedAreaVertexIcon = createTerritoryVertexIcon("#f43f5e", true);
const protectedAreaCenterIcon = createTerritoryCenterIcon("#f43f5e");
const protectedAreaAddIcon = createTerritoryAddIcon("#f43f5e");

type TerritoryDisplayMode =
  | "states"
  | LunaSphereSettlementKind
  | "protected"
  | "all";

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
  | "freezing"
  | "unfreezing"
  | "error";

type DatabaseDraftMetadata = {
  savedAt: string;
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  topologyRevision: number;
  territoryRevision: number;
  protectedAreaRevision: number;
  geography: LunaSphereGeographyDocument;
};

type GeographyReleaseMetadata = {
  releaseNumber: number;
  publishedAt: string;
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  topologyRevision: number;
  territoryRevision: number;
  protectedAreaRevision: number;
  topologyHash: string;
};

type GeographyActivationMetadata = GeographyReleaseMetadata & {
  activatedAt: string;
};

type GeographyReleaseDetail = GeographyReleaseMetadata & {
  geography: LunaSphereGeographyDocument;
};

type GeographyFreezeMetadata = {
  id: string;
  label: string;
  frozenAt: string;
  unfrozenAt: string | null;
  releaseNumber: number;
  topologyHash: string;
  inventoryGridVersion: number;
  inventorySubdivisionFactor: number;
  topologyRevision: number;
  territoryRevision: number;
  protectedAreaRevision: number;
  readinessStatus: "ready" | "review";
  readyStateCount: number;
  reviewStateCount: number;
  blockedStateCount: number;
  totalRuralParcels: number;
  totalCityBlocks: number;
  totalTownBlocks: number;
  totalSaleableProperties: number;
  totalProtectedAreas: number;
  auditReport: GeographyReadinessReport;
  freezeNote: string | null;
  unfreezeNote: string | null;
};

type GeographyWorkspaceResponse = {
  draft: DatabaseDraftMetadata | null;
  latestRelease: GeographyReleaseMetadata | null;
  activeRelease: GeographyActivationMetadata | null;
  activeFreeze: GeographyFreezeMetadata | null;
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
        state.present.territories,
        state.present.protectedAreas
      ),
      state.present
    );
    const territoriesChanged = !geographiesHaveSameContent(
      createGeographyDocument(
        state.present.topology,
        action.baseline.territories,
        state.present.protectedAreas
      ),
      state.present
    );
    const protectedAreasChanged = !geographiesHaveSameContent(
      createGeographyDocument(
        state.present.topology,
        state.present.territories,
        action.baseline.protectedAreas
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
        protectedAreas: protectedAreasChanged
          ? {
              ...cloneProtectedAreaLayout(state.present.protectedAreas),
              revision: action.baseline.protectedAreas.revision + 1,
            }
          : cloneProtectedAreaLayout(state.present.protectedAreas),
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
  const workingProtectedAreaLayout = workingGeography.protectedAreas;

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
  const [selectedProtectedAreaId, setSelectedProtectedAreaId] = useState<
    string | null
  >(null);
  const [selectedProtectedAreaPointIndex, setSelectedProtectedAreaPointIndex] =
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
  const [activeFreeze, setActiveFreeze] =
    useState<GeographyFreezeMetadata | null>(null);
  const [releases, setReleases] = useState<
    GeographyReleaseMetadata[]
  >([]);
  const [releasePreview, setReleasePreview] =
    useState<GeographyReleaseDetail | null>(null);
  const [databaseNotice, setDatabaseNotice] = useState<
    string | null
  >(null);
  const [readinessReport, setReadinessReport] = useState<
    GeographyReadinessReport | null
  >(null);
  const [readinessBusy, setReadinessBusy] = useState(false);
  const [readinessProgress, setReadinessProgress] = useState<
    GeographyReadinessAuditProgress | null
  >(null);
  const [readinessNotice, setReadinessNotice] = useState<
    string | null
  >(null);

  const geography =
    releasePreview?.geography ?? workingGeography;
  const topology = geography.topology;
  const territoryLayout = geography.territories;
  const protectedAreaLayout = geography.protectedAreas;
  const isPreviewingRelease = releasePreview !== null;
  const editingLocked = isPreviewingRelease || activeFreeze !== null;

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
  const workingValidationIssues = useMemo(
    () => [
      ...workingValidation.topology.errors.map((issue) => ({
        ...issue,
        source: "State topology",
      })),
      ...workingValidation.territories.errors.map((issue) => ({
        ...issue,
        source: "Cities and towns",
      })),
      ...workingValidation.protectedAreas.errors.map((issue) => ({
        ...issue,
        source: "Protected areas",
      })),
    ],
    [workingValidation]
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
  const resolvedProtectedAreas = useMemo(
    () =>
      resolveProtectedAreasForState(
        topology,
        protectedAreaLayout,
        selectedState
      ),
    [protectedAreaLayout, selectedState, topology]
  );
  const protectedAreaValidation = useMemo(
    () => validateProtectedAreaLayout(topology, protectedAreaLayout),
    [protectedAreaLayout, topology]
  );
  const selectedProtectedAreaDefinition = useMemo(
    () =>
      selectedProtectedAreaId
        ? getProtectedAreaDefinition(
            protectedAreaLayout,
            selectedProtectedAreaId
          )
        : null,
    [protectedAreaLayout, selectedProtectedAreaId]
  );
  const selectedResolvedProtectedArea = useMemo(
    () =>
      selectedProtectedAreaId
        ? resolvedProtectedAreas.find(
            (area) => area.id === selectedProtectedAreaId
          ) ?? null
        : null,
    [resolvedProtectedAreas, selectedProtectedAreaId]
  );
  const selectedProtectedAreaCanRemovePoint =
    selectedProtectedAreaDefinition !== null &&
    selectedProtectedAreaPointIndex !== null &&
    selectedProtectedAreaDefinition.boundary.length > 4;
  const selectedProtectedAreaIssues = useMemo(
    () =>
      [
        ...protectedAreaValidation.errors,
        ...protectedAreaValidation.warnings,
        ...protectedAreaValidation.information,
      ].filter(
        (issue) =>
          issue.areaId === selectedProtectedAreaId ||
          (!selectedProtectedAreaId && issue.stateName === selectedState)
      ),
    [
      protectedAreaValidation,
      selectedProtectedAreaId,
      selectedState,
    ]
  );
  const selectedProtectedAreaSegmentTargets = useMemo(() => {
    if (!selectedResolvedProtectedArea) {
      return [] as {
        key: string;
        segmentIndex: number;
        position: [number, number];
      }[];
    }

    return selectedResolvedProtectedArea.boundary.map(
      (point, segmentIndex) => {
        const nextPoint =
          selectedResolvedProtectedArea.boundary[
            (segmentIndex + 1) %
              selectedResolvedProtectedArea.boundary.length
          ];

        return {
          key: `${selectedResolvedProtectedArea.id}-segment-${segmentIndex}`,
          segmentIndex,
          position: [
            (point[0] + nextPoint[0]) / 2,
            (point[1] + nextPoint[1]) / 2,
          ] as [number, number],
        };
      }
    );
  }, [selectedResolvedProtectedArea]);
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
    (territoryDisplayMode === "all" &&
      !selectedTerritoryId &&
      !selectedProtectedAreaId);
  const showTerritoryEditingHandles =
    selectedResolvedTerritory !== null &&
    (territoryDisplayMode === "all" ||
      selectedResolvedTerritory.kind === territoryDisplayMode);
  const showProtectedAreaEditingHandles =
    selectedResolvedProtectedArea !== null &&
    (territoryDisplayMode === "all" ||
      territoryDisplayMode === "protected");
  const readinessReportIsCurrent = useMemo(
    () =>
      readinessReport !== null &&
      geographyReadinessReportMatchesDocument(
        readinessReport,
        workingGeography
      ),
    [readinessReport, workingGeography]
  );
  const selectedReadinessDiagnostic = useMemo(
    () =>
      readinessReport?.states.find(
        (state) => state.stateName === selectedState
      ) ?? null,
    [readinessReport, selectedState]
  );

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
        setActiveFreeze(workspace.activeFreeze);
        setReleases(workspace.releases);

        if (workspace.activeFreeze) {
          const releaseResponse = await fetch(
            `${GEOGRAPHY_API_PATH}/releases/${workspace.activeFreeze.releaseNumber}`,
            { cache: "no-store" }
          );
          const releaseResult = await readResponseBody<{
            release: GeographyReleaseDetail;
          }>(releaseResponse);

          if (
            !hasCompatibleGeographyDocumentStructure(
              releaseResult.release.geography,
              baselineGeography
            )
          ) {
            throw new Error(
              "The frozen Geography 1.0 release is incompatible with this Studio version."
            );
          }

          setReleasePreview(releaseResult.release);
        }

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
      if (editingLocked || isTextEntryElement(event.target)) {
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
        setSelectedProtectedAreaPointIndex(null);
        return;
      }

      if (commandKey && normalizedKey === "y") {
        event.preventDefault();
        dispatchHistory({ type: "redo" });
        setSelectedNodeId(null);
        setSelectedTerritoryPointIndex(null);
        setSelectedProtectedAreaPointIndex(null);
        return;
      }

      if (
        event.key === "Delete" ||
        event.key === "Backspace"
      ) {
        if (
          selectedProtectedAreaId &&
          selectedProtectedAreaPointIndex !== null &&
          selectedProtectedAreaCanRemovePoint
        ) {
          event.preventDefault();
          dispatchHistory({
            type: "apply",
            update: (currentGeography) => ({
              ...currentGeography,
              protectedAreas: removeProtectedAreaBoundaryPoint(
                currentGeography.protectedAreas,
                selectedProtectedAreaId,
                selectedProtectedAreaPointIndex
              ),
            }),
          });
          setSelectedProtectedAreaPointIndex(null);
          return;
        }

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
    editingLocked,
    removableNodeEdge,
    selectedNodeId,
    selectedProtectedAreaCanRemovePoint,
    selectedProtectedAreaId,
    selectedProtectedAreaPointIndex,
    selectedTerritoryCanRemovePoint,
    selectedTerritoryId,
    selectedTerritoryPointIndex,
  ]);

  function selectState(stateName: string) {
    setSelectedState(stateName);
    setSelectedNodeId(null);
    setSelectedTerritoryId(null);
    setSelectedTerritoryPointIndex(null);
    setSelectedProtectedAreaId(null);
    setSelectedProtectedAreaPointIndex(null);
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
    setSelectedProtectedAreaId(null);
    setSelectedProtectedAreaPointIndex(null);
    setSelectedNodeId(null);
  }

  function selectProtectedArea(areaId: string) {
    const definition = getProtectedAreaDefinition(
      protectedAreaLayout,
      areaId
    );

    if (!definition) {
      return;
    }

    setSelectedState(definition.stateName);
    setSelectedProtectedAreaId(areaId);
    setSelectedProtectedAreaPointIndex(null);
    setSelectedTerritoryId(null);
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

  function updateProtectedAreaBoundaryFromMap(
    areaId: string,
    pointIndex: number,
    mapCoordinate: [number, number],
    incrementRevision: boolean
  ) {
    dispatchHistory({
      type: "preview",
      update: (currentGeography) => {
        const definition = getProtectedAreaDefinition(
          currentGeography.protectedAreas,
          areaId
        );

        if (!definition) {
          return currentGeography;
        }

        const resolvedState = resolveStateTerritories(
          currentGeography.topology,
          currentGeography.territories,
          definition.stateName
        );

        if (!resolvedState) {
          return currentGeography;
        }

        const relativeCoordinate =
          convertLunarCoordinateToStateRelative(
            mapCoordinate,
            resolvedState.stateBoundary,
            resolvedState.interiorOrigin
          );
        const protectedAreas = moveProtectedAreaBoundaryPoint(
          currentGeography.protectedAreas,
          areaId,
          pointIndex,
          relativeCoordinate,
          { incrementRevision }
        );

        return protectedAreas === currentGeography.protectedAreas
          ? currentGeography
          : { ...currentGeography, protectedAreas };
      },
    });
  }

  function updateProtectedAreaCenterFromMap(
    areaId: string,
    mapCoordinate: [number, number],
    incrementRevision: boolean
  ) {
    dispatchHistory({
      type: "preview",
      update: (currentGeography) => {
        const definition = getProtectedAreaDefinition(
          currentGeography.protectedAreas,
          areaId
        );

        if (!definition) {
          return currentGeography;
        }

        const resolvedState = resolveStateTerritories(
          currentGeography.topology,
          currentGeography.territories,
          definition.stateName
        );

        if (!resolvedState) {
          return currentGeography;
        }

        const relativeCoordinate =
          convertLunarCoordinateToStateRelative(
            mapCoordinate,
            resolvedState.stateBoundary,
            resolvedState.interiorOrigin
          );
        const protectedAreas = moveProtectedAreaCenter(
          currentGeography.protectedAreas,
          areaId,
          relativeCoordinate,
          { incrementRevision }
        );

        return protectedAreas === currentGeography.protectedAreas
          ? currentGeography
          : { ...currentGeography, protectedAreas };
      },
    });
  }

  function addSelectedProtectedAreaPoint(segmentIndex: number) {
    if (!selectedProtectedAreaId) return;

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: insertProtectedAreaBoundaryPoint(
          currentGeography.protectedAreas,
          selectedProtectedAreaId,
          segmentIndex
        ),
      }),
    });
    setSelectedProtectedAreaPointIndex(segmentIndex + 1);
  }

  function removeSelectedProtectedAreaPoint() {
    if (
      !selectedProtectedAreaId ||
      selectedProtectedAreaPointIndex === null ||
      !selectedProtectedAreaCanRemovePoint
    ) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: removeProtectedAreaBoundaryPoint(
          currentGeography.protectedAreas,
          selectedProtectedAreaId,
          selectedProtectedAreaPointIndex
        ),
      }),
    });
    setSelectedProtectedAreaPointIndex(null);
  }

  function nudgeSelectedProtectedAreaPoint(
    deltaY: number,
    deltaX: number
  ) {
    if (
      !selectedProtectedAreaId ||
      selectedProtectedAreaPointIndex === null ||
      !selectedProtectedAreaDefinition
    ) {
      return;
    }

    const point =
      selectedProtectedAreaDefinition.boundary[
        selectedProtectedAreaPointIndex
      ];

    if (!point) return;

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: moveProtectedAreaBoundaryPoint(
          currentGeography.protectedAreas,
          selectedProtectedAreaId,
          selectedProtectedAreaPointIndex,
          [point[0] + deltaY, point[1] + deltaX]
        ),
      }),
    });
  }

  function nudgeSelectedProtectedAreaCenter(
    deltaY: number,
    deltaX: number
  ) {
    if (!selectedProtectedAreaId || !selectedProtectedAreaDefinition) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: moveProtectedAreaCenter(
          currentGeography.protectedAreas,
          selectedProtectedAreaId,
          [
            selectedProtectedAreaDefinition.center[0] + deltaY,
            selectedProtectedAreaDefinition.center[1] + deltaX,
          ]
        ),
      }),
    });
  }

  function createProtectedArea() {
    const nextLayout = addProtectedArea(
      workingTopology,
      workingProtectedAreaLayout,
      selectedState
    );
    const existingIds = new Set(
      workingProtectedAreaLayout.areas.map((area) => area.id)
    );
    const addedArea = nextLayout.areas.find(
      (area) => !existingIds.has(area.id)
    );

    if (!addedArea) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: nextLayout,
      }),
    });
    setTerritoryDisplayMode("protected");
    setSelectedProtectedAreaId(addedArea.id);
    setSelectedProtectedAreaPointIndex(null);
    setSelectedTerritoryId(null);
    setSelectedTerritoryPointIndex(null);
    setSelectedNodeId(null);
  }

  function removeSelectedProtectedArea() {
    if (!selectedProtectedAreaId) return;

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: deleteProtectedArea(
          currentGeography.protectedAreas,
          selectedProtectedAreaId
        ),
      }),
    });
    setSelectedProtectedAreaId(null);
    setSelectedProtectedAreaPointIndex(null);
  }

  function resetSelectedProtectedArea() {
    if (!selectedProtectedAreaId) return;

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: restoreProtectedArea(
          currentGeography.topology,
          currentGeography.protectedAreas,
          selectedProtectedAreaId
        ),
      }),
    });
    setSelectedProtectedAreaPointIndex(null);
  }

  function resetSelectedStateProtectedAreas() {
    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: restoreStateProtectedAreas(
          currentGeography.topology,
          currentGeography.protectedAreas,
          selectedState
        ),
      }),
    });
    setSelectedProtectedAreaId(null);
    setSelectedProtectedAreaPointIndex(null);
  }

  function updateSelectedProtectedAreaMetadata(
    input: Partial<{
      name: string;
      category: LunaSphereProtectedAreaCategory;
      description: string;
      minZoom: number;
    }>
  ) {
    if (!selectedProtectedAreaId) return;

    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        protectedAreas: updateProtectedAreaMetadata(
          currentGeography.protectedAreas,
          selectedProtectedAreaId,
          input
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

  function naturalizeSelectedStateBorders() {
    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        topology: naturalizeTopologyStateBorders(
          currentGeography.topology,
          selectedState
        ),
      }),
    });
    setSelectedNodeId(null);
    setReadinessNotice(
      `Added gentle shared-border detail around ${selectedState}. Run the Geography 1.0 audit after reviewing the shape.`
    );
  }

  function smoothSelectedStateBorders() {
    dispatchHistory({
      type: "apply",
      update: (currentGeography) => ({
        ...currentGeography,
        topology: smoothTopologyStateBorders(
          currentGeography.topology,
          selectedState
        ),
      }),
    });
    setSelectedNodeId(null);
    setReadinessNotice(
      `Smoothed existing control points around ${selectedState}.`
    );
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
    setSelectedProtectedAreaPointIndex(null);
  }

  function redo() {
    dispatchHistory({ type: "redo" });
    setSelectedNodeId(null);
    setSelectedTerritoryPointIndex(null);
    setSelectedProtectedAreaPointIndex(null);
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

    if (activeFreeze) {
      setDatabaseNotice(
        `${activeFreeze.label} is frozen. The Studio remains on its protected release until it is explicitly unfrozen.`
      );
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
    if (!releasePreview || activeFreeze) {
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
    copiedGeography.protectedAreas = {
      ...copiedGeography.protectedAreas,
      status: "draft",
      revision:
        Math.max(
          workingProtectedAreaLayout.revision,
          releasePreview.geography.protectedAreas.revision
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

  async function freezeGeography1() {
    if (!activeRelease) {
      setDatabaseNotice(
        "Activate the approved numbered release before freezing Geography 1.0."
      );
      return;
    }

    const confirmation = window.prompt(
      `This will freeze active release ${activeRelease.releaseNumber}, lock Studio geography editing, store a server-generated Grid V2 audit, and protect sold properties. Type FREEZE GEOGRAPHY 1.0 to continue.`
    );

    if (confirmation !== "FREEZE GEOGRAPHY 1.0") {
      setDatabaseNotice("The Geography 1.0 freeze was cancelled.");
      return;
    }

    const acceptWarnings = window.confirm(
      "Freeze the active release if the server audit has no blockers? Selecting OK also accepts any remaining non-blocking review warnings."
    );

    if (!acceptWarnings) {
      setDatabaseNotice("The Geography 1.0 freeze was cancelled.");
      return;
    }

    setDatabaseStatus("freezing");

    try {
      const response = await fetch(`${GEOGRAPHY_API_PATH}/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          releaseNumber: activeRelease.releaseNumber,
          confirmation,
          acceptWarnings,
          note: "Approved in LunaSphere Studio",
        }),
      });
      const result = await readResponseBody<{
        freeze: GeographyFreezeMetadata;
      }>(response);

      setActiveFreeze(result.freeze);
      setReadinessReport(result.freeze.auditReport);
      setReadinessNotice(
        `Server audit stored with ${result.freeze.totalSaleableProperties.toLocaleString()} saleable properties.`
      );

      try {
        const releaseResult = await readResponseBody<{
          release: GeographyReleaseDetail;
        }>(
          await fetch(
            `${GEOGRAPHY_API_PATH}/releases/${result.freeze.releaseNumber}`,
            { cache: "no-store" }
          )
        );
        setReleasePreview(releaseResult.release);
      } catch (previewError) {
        console.error(
          "The frozen release preview could not be loaded immediately.",
          previewError
        );
      }

      setDatabaseStatus("ready");
      setDatabaseNotice(
        `${result.freeze.label} is now frozen at release ${result.freeze.releaseNumber}. Studio geography editing and release switching are locked.`
      );
    } catch (error) {
      setDatabaseStatus("error");
      setDatabaseNotice(
        error instanceof Error
          ? error.message
          : "Geography 1.0 could not be frozen."
      );
    }
  }

  async function unfreezeGeography1() {
    if (!activeFreeze) {
      return;
    }

    const confirmation = window.prompt(
      `Unfreezing restores editing, but sold Grid V2 properties will remain protected from movement. Type UNFREEZE GEOGRAPHY 1.0 to continue.`
    );

    if (confirmation !== "UNFREEZE GEOGRAPHY 1.0") {
      setDatabaseNotice("The Geography 1.0 unfreeze was cancelled.");
      return;
    }

    const note = window.prompt(
      "Optional: record why Geography 1.0 is being unlocked.",
      "Administrative geography revision"
    );

    setDatabaseStatus("unfreezing");

    try {
      await readResponseBody<{ freeze: GeographyFreezeMetadata }>(
        await fetch(`${GEOGRAPHY_API_PATH}/freeze`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmation, note }),
        })
      );

      if (releasePreview) {
        const editableGeography = cloneGeographyDocument(
          releasePreview.geography
        );
        editableGeography.topology.status = "draft";
        editableGeography.territories.status = "draft";
        editableGeography.protectedAreas.status = "draft";
        dispatchHistory({
          type: "replace",
          geography: editableGeography,
          recordCurrent: true,
        });
      }

      setActiveFreeze(null);
      setReleasePreview(null);
      setDatabaseStatus("ready");
      setDatabaseNotice(
        "Geography 1.0 is unlocked. Any future save, publication, or activation will still be rejected if it moves or removes a sold Grid V2 property."
      );
    } catch (error) {
      setDatabaseStatus("error");
      setDatabaseNotice(
        error instanceof Error
          ? error.message
          : "Geography 1.0 could not be unfrozen."
      );
    }
  }

  function exportFrozenLaunchSummary() {
    if (!activeFreeze) {
      return;
    }

    downloadJson(
      `lunasphere-${activeFreeze.label.toLowerCase().replaceAll(" ", "-")}-release-${activeFreeze.releaseNumber}.json`,
      {
        format: "lunasphere-frozen-launch-summary",
        schemaVersion: 1,
        ...activeFreeze,
      }
    );
  }

  function exportSelectedState() {
    if (
      !validation.valid ||
      !territoryValidation.valid ||
      !protectedAreaValidation.valid ||
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
        protectedAreas: getProtectedAreasForState(
          protectedAreaLayout,
          selectedState
        ),
      }
    );
  }

  function exportAllStates() {
    if (
      !validation.valid ||
      !territoryValidation.valid ||
      !protectedAreaValidation.valid
    ) {
      return;
    }

    downloadJson(
      `lunasphere-geography-draft-state-r${topology.revision}-territory-r${territoryLayout.revision}-protected-r${protectedAreaLayout.revision}.json`,
      geography
    );
  }

  async function runReadinessReport() {
    if (editingLocked) {
      return;
    }

    setReadinessBusy(true);
    setReadinessNotice(
      "Auditing all 57 states, 171 cities, 1,140 towns, protected zones, and saleable inventory…"
    );

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 30);
    });

    try {
      const report = await runGeographyReadinessAuditAsync(
        workingGeography,
        setReadinessProgress
      );
      setReadinessReport(report);
      setReadinessNotice(
        report.status === "ready"
          ? "Geography 1.0 audit passed. All states are ready for final review and freeze."
          : report.status === "blocked"
            ? `Geography 1.0 audit found ${report.blockedStateCount} blocked state${report.blockedStateCount === 1 ? "" : "s"}.`
            : `Geography 1.0 audit completed with ${report.reviewStateCount} state${report.reviewStateCount === 1 ? "" : "s"} needing design review.`
      );
    } catch (error) {
      setReadinessNotice(
        error instanceof Error
          ? error.message
          : "The Geography 1.0 audit could not be completed."
      );
    } finally {
      setReadinessBusy(false);
      setReadinessProgress(null);
    }
  }

  function exportReadinessReport() {
    if (!readinessReport) {
      return;
    }

    downloadJson(
      `lunasphere-geography-1-readiness-r${readinessReport.topologyRevision}.json`,
      readinessReport
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
    databaseStatus === "activating" ||
    databaseStatus === "freezing" ||
    databaseStatus === "unfreezing";
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
              : databaseStatus === "freezing"
                ? "Freezing Geography 1.0…"
                : databaseStatus === "unfreezing"
                  ? "Unfreezing Geography 1.0…"
          : databaseStatus === "error"
            ? "Database error"
            : databaseDraft
              ? `State r${databaseDraft.topologyRevision} · Territory r${databaseDraft.territoryRevision} · Protected r${databaseDraft.protectedAreaRevision}${
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
            updates all states that share it. Cities, towns, and protected
            areas use state-relative geometry that reflows with the selected
            state. Browser autosave and database releases protect the complete
            geography while Moon-perimeter handles remain locked to the
            circular saleable boundary.
          </p>

          {activeFreeze && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-emerald-50">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
                  {activeFreeze.label} Frozen
                </p>
                <p className="mt-1 text-sm text-emerald-50/80">
                  Release {activeFreeze.releaseNumber} is the protected launch geography. Editing, database draft changes, publication, and release switching are locked until an explicit unfreeze.
                </p>
              </div>
              <span className="rounded-xl bg-emerald-200 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-950">
                {activeFreeze.totalSaleableProperties.toLocaleString()} Properties
              </span>
            </div>
          )}

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
                  ["states", "city", "town", "protected", "all"] as const
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
                          : mode === "protected"
                            ? "Protected"
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
                  territoryDisplayMode === "protected" ||
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

            <label className="min-w-72">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Selected protected area
              </span>
              <select
                value={selectedProtectedAreaId ?? ""}
                onChange={(event) => {
                  const areaId = event.target.value;
                  if (areaId) {
                    selectProtectedArea(areaId);
                  } else {
                    setSelectedProtectedAreaId(null);
                    setSelectedProtectedAreaPointIndex(null);
                  }
                }}
                disabled={
                  territoryDisplayMode === "states" ||
                  territoryDisplayMode === "city" ||
                  territoryDisplayMode === "town"
                }
                className="w-full rounded-xl border border-rose-300/30 bg-black px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <option value="">Choose a protected area</option>
                {resolvedProtectedAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.category}: {area.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={undo}
              disabled={editingLocked || history.past.length === 0}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Undo
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={editingLocked || history.future.length === 0}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Redo
            </button>

            <button
              type="button"
              onClick={saveDraftNow}
              disabled={editingLocked}
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
              disabled={editingLocked}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/10"
            >
              Reset State
            </button>

            <button
              type="button"
              onClick={resetAllStates}
              disabled={editingLocked}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/10"
            >
              Reset All
            </button>

            <button
              type="button"
              onClick={naturalizeSelectedStateBorders}
              disabled={
                editingLocked ||
                selectedEdges.every(
                  (edge) =>
                    edge.kind !== "shared-state-border" ||
                    edge.nodeIds.length > 2
                )
              }
              className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-400/10 px-4 py-3 text-sm font-bold text-fuchsia-100 enabled:hover:bg-fuchsia-400/20 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Naturalize Straight Borders
            </button>

            <button
              type="button"
              onClick={smoothSelectedStateBorders}
              disabled={
                editingLocked ||
                selectedEdges.every((edge) => edge.nodeIds.length <= 2)
              }
              className="rounded-xl border border-indigo-300/30 bg-indigo-400/10 px-4 py-3 text-sm font-bold text-indigo-100 enabled:hover:bg-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Smooth State Borders
            </button>

            <button
              type="button"
              onClick={resetSelectedTerritory}
              disabled={editingLocked || !selectedTerritoryId}
              className="rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-bold text-cyan-100 enabled:hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Reset Selected Territory
            </button>

            <button
              type="button"
              onClick={resetSelectedStateTerritories}
              disabled={editingLocked}
              className="rounded-xl border border-amber-300/30 px-4 py-3 text-sm font-bold text-amber-100 enabled:hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Reset State Cities & Towns
            </button>

            <button
              type="button"
              onClick={createProtectedArea}
              disabled={editingLocked}
              className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-100 enabled:hover:bg-rose-400/20 disabled:opacity-35"
            >
              Add Protected Area
            </button>

            <button
              type="button"
              onClick={resetSelectedStateProtectedAreas}
              disabled={editingLocked}
              className="rounded-xl border border-rose-300/30 px-4 py-3 text-sm font-bold text-rose-100 enabled:hover:bg-rose-400/10 disabled:opacity-35"
            >
              Reset State Protected Areas
            </button>

            <button
              type="button"
              onClick={reloadSavedDraft}
              disabled={editingLocked || !lastSavedAt}
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
              disabled={!validation.valid || !territoryValidation.valid || !protectedAreaValidation.valid}
              className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black enabled:hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Export Selected State
            </button>

            <button
              type="button"
              onClick={exportAllStates}
              disabled={!validation.valid || !territoryValidation.valid || !protectedAreaValidation.valid}
              className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Export Geography Draft
            </button>

            <button
              type="button"
              onClick={() => void runReadinessReport()}
              disabled={editingLocked || readinessBusy}
              title={
                workingValidation.valid
                  ? "Audit the current working geography"
                  : "Audit the current geography and identify its validation errors"
              }
              className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-black text-emerald-950 enabled:hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {readinessBusy
                ? readinessProgress
                  ? `Auditing ${readinessProgress.completedStateCount}/${readinessProgress.totalStateCount}: ${readinessProgress.stateName}`
                  : "Starting Geography Audit…"
                : "Run Geography 1.0 Audit"}
            </button>

            <button
              type="button"
              onClick={exportReadinessReport}
              disabled={!readinessReport}
              className="rounded-xl border border-emerald-300/30 px-4 py-3 text-sm font-bold text-emerald-100 enabled:hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Export Readiness Report
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                  Geography 1.0 Readiness
                </p>
                <p className="mt-1 max-w-4xl text-sm text-emerald-50/75">
                  The audit counts saleable Rural Acres, City Blocks, and Town Blocks, checks settlement and protected-area health, and identifies states whose borders still need professional shaping.
                </p>
              </div>

              <span
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-wider ${
                  !readinessReport
                    ? "border-white/15 bg-black/30 text-zinc-300"
                    : readinessReport.status === "ready"
                      ? "border-emerald-200/40 bg-emerald-200 text-emerald-950"
                      : readinessReport.status === "blocked"
                        ? "border-red-300/40 bg-red-300 text-red-950"
                        : "border-amber-300/40 bg-amber-300 text-amber-950"
                }`}
              >
                {!readinessReport
                  ? "Not audited"
                  : `${readinessReport.status}${
                      readinessReportIsCurrent ? " · current" : " · stale"
                    }`}
              </span>
            </div>

            {readinessNotice && (
              <p className="mt-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-emerald-50">
                {readinessNotice}
              </p>
            )}

            {readinessReport && (
              <>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-300/25 bg-purple-400/10 px-4 py-3">
                  <p className="text-sm font-black text-purple-100">
                    Inventory Grid V{readinessReport.inventoryGridVersion} · {readinessReport.inventorySubdivisionFactor}×{readinessReport.inventorySubdivisionFactor} saleable subcells
                  </p>
                  <p className="text-sm text-purple-100/80">
                    Total saleable properties: <strong className="text-white">{readinessReport.totalSaleableProperties.toLocaleString()}</strong>
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">Ready</p>
                    <p className="mt-1 text-2xl font-black text-emerald-200">{readinessReport.readyStateCount}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">Review</p>
                    <p className="mt-1 text-2xl font-black text-amber-200">{readinessReport.reviewStateCount}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">Blocked</p>
                    <p className="mt-1 text-2xl font-black text-red-200">{readinessReport.blockedStateCount}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">Rural Acres</p>
                    <p className="mt-1 text-2xl font-black">{readinessReport.totalRuralParcels.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">City Blocks</p>
                    <p className="mt-1 text-2xl font-black">{readinessReport.totalCityBlocks.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-400">Town Blocks</p>
                    <p className="mt-1 text-2xl font-black">{readinessReport.totalTownBlocks.toLocaleString()}</p>
                  </div>
                </div>

                {readinessReport.globalIssues.length > 0 && (
                  <div className="mt-4 rounded-xl border border-red-300/30 bg-red-400/10 p-4 text-red-50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-black">Global geography blockers</p>
                      <span className="rounded-lg bg-red-300 px-3 py-1 text-xs font-black uppercase text-red-950">
                        {readinessReport.globalIssues.length}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-red-50/75">
                      These document-wide errors can keep the Validation badge at Review even when no individual state shows a red issue box.
                    </p>
                    <div className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
                      {readinessReport.globalIssues.map((issue, index) => (
                        <p key={`${issue.code}-${index}`}>
                          <strong>{issue.code}:</strong> {issue.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReadinessDiagnostic && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-black">{selectedReadinessDiagnostic.stateName} readiness</p>
                      <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase ${
                        selectedReadinessDiagnostic.status === "ready"
                          ? "bg-emerald-300 text-emerald-950"
                          : selectedReadinessDiagnostic.status === "blocked"
                            ? "bg-red-300 text-red-950"
                            : "bg-amber-300 text-amber-950"
                      }`}>
                        {selectedReadinessDiagnostic.status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                      <p>Rural Acres: <strong>{selectedReadinessDiagnostic.ruralParcelCount.toLocaleString()}</strong></p>
                      <p>City Blocks: <strong>{selectedReadinessDiagnostic.cityBlockCount.toLocaleString()}</strong></p>
                      <p>Town Blocks: <strong>{selectedReadinessDiagnostic.townBlockCount.toLocaleString()}</strong></p>
                      <p>Protected Areas: <strong>{selectedReadinessDiagnostic.protectedAreaCount}</strong></p>
                      <p>Smallest City: <strong>{selectedReadinessDiagnostic.minimumCityBlockCount} blocks</strong></p>
                      <p>Smallest Town: <strong>{selectedReadinessDiagnostic.minimumTownBlockCount} blocks</strong></p>
                      <p>Straight Borders: <strong>{selectedReadinessDiagnostic.straightSharedBorderCount}</strong></p>
                      <p>Border Detail Points: <strong>{selectedReadinessDiagnostic.borderControlPointCount}</strong></p>
                    </div>
                    {selectedReadinessDiagnostic.issues.length > 0 ? (
                      <div className="mt-3 max-h-36 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
                        {selectedReadinessDiagnostic.issues.map((issue, index) => (
                          <p key={`${issue.code}-${index}`} className={issue.severity === "error" ? "text-red-200" : issue.severity === "warning" ? "text-amber-200" : "text-sky-200"}>
                            <strong>{issue.code}:</strong> {issue.message}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm font-bold text-emerald-200">No readiness issues were found for this state.</p>
                    )}
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black">States needing attention</p>
                    <p className="text-xs text-zinc-400">Click a state to review it in the Studio.</p>
                  </div>
                  <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                    {readinessReport.states
                      .filter((state) => state.status !== "ready")
                      .map((state) => (
                        <button
                          key={`readiness-${state.stateId}`}
                          type="button"
                          onClick={() => selectState(state.stateName)}
                          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs transition ${
                            state.stateName === selectedState
                              ? "border-white bg-white/10"
                              : state.status === "blocked"
                                ? "border-red-300/25 bg-red-400/10 hover:bg-red-400/20"
                                : "border-amber-300/25 bg-amber-400/10 hover:bg-amber-400/20"
                          }`}
                        >
                          <span>
                            <strong className="block text-white">{state.stateName}</strong>
                            <span className="text-zinc-400">{state.issues[0]?.message ?? "Review required"}</span>
                          </span>
                          <span className={`rounded-md px-2 py-1 font-black uppercase ${
                            state.status === "blocked"
                              ? "bg-red-300 text-red-950"
                              : "bg-amber-300 text-amber-950"
                          }`}>
                            {state.status}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-violet-400/25 bg-violet-400/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-200">
                  Shared Database Workspace
                </p>
                <p className="mt-1 text-sm text-violet-50/75">
                  Save one cross-device geography draft containing states,
                  cities, towns, and protected areas. Publish immutable
                  releases, preview any release, and choose the complete
                  geography used by the public Moon Map.
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
                  editingLocked ||
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
                  editingLocked ||
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
                  editingLocked ||
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
                  ? `State r${databaseDraft.topologyRevision} · Territory r${databaseDraft.territoryRevision} · Protected r${databaseDraft.protectedAreaRevision}, saved ${formatDatabaseDate(
                      databaseDraft.savedAt
                    )}`
                  : "Not saved yet"}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-violet-50/80">
                <strong className="text-violet-100">Latest release:</strong>{" "}
                {latestRelease
                  ? `Release ${latestRelease.releaseNumber}, state r${latestRelease.topologyRevision} · territory r${latestRelease.territoryRevision} · protected r${latestRelease.protectedAreaRevision}, published ${formatDatabaseDate(
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

            <div className={`mt-4 rounded-2xl border p-4 ${
              activeFreeze
                ? "border-emerald-300/35 bg-emerald-400/10"
                : "border-yellow-300/30 bg-yellow-400/10"
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${
                    activeFreeze ? "text-emerald-200" : "text-yellow-200"
                  }`}>
                    Geography 1.0 Approval & Freeze
                  </p>
                  <p className={`mt-1 max-w-4xl text-sm ${
                    activeFreeze ? "text-emerald-50/75" : "text-yellow-50/75"
                  }`}>
                    {activeFreeze
                      ? `Frozen release ${activeFreeze.releaseNumber} is the permanent launch baseline. Its server-generated readiness audit and Grid V2 totals are stored with the freeze record.`
                      : "Freeze the approved active release only after its final audit. The server reruns the complete audit, records exact inventory totals, and verifies every sold Grid V2 property before locking Studio."}
                  </p>
                </div>

                {activeFreeze ? (
                  <span className="rounded-xl bg-emerald-200 px-3 py-2 text-xs font-black uppercase tracking-wider text-emerald-950">
                    Frozen {formatDatabaseDate(activeFreeze.frozenAt)}
                  </span>
                ) : (
                  <span className="rounded-xl border border-yellow-200/30 bg-black/25 px-3 py-2 text-xs font-black text-yellow-100">
                    {activeRelease
                      ? `Active Release ${activeRelease.releaseNumber}`
                      : "No Active Release"}
                  </span>
                )}
              </div>

              {activeFreeze ? (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="text-xs uppercase text-emerald-100/60">Rural Acres</p>
                      <p className="mt-1 text-xl font-black text-white">{activeFreeze.totalRuralParcels.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="text-xs uppercase text-emerald-100/60">City Blocks</p>
                      <p className="mt-1 text-xl font-black text-white">{activeFreeze.totalCityBlocks.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="text-xs uppercase text-emerald-100/60">Town Blocks</p>
                      <p className="mt-1 text-xl font-black text-white">{activeFreeze.totalTownBlocks.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200/20 bg-emerald-300/10 p-3">
                      <p className="text-xs uppercase text-emerald-100/70">Total Saleable</p>
                      <p className="mt-1 text-xl font-black text-emerald-100">{activeFreeze.totalSaleableProperties.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={exportFrozenLaunchSummary}
                      className="rounded-xl bg-emerald-200 px-4 py-3 text-sm font-black text-emerald-950 hover:bg-white"
                    >
                      Export Frozen Launch Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => void unfreezeGeography1()}
                      disabled={databaseBusy}
                      className="rounded-xl border border-red-300/35 bg-red-400/10 px-4 py-3 text-sm font-black text-red-100 enabled:hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Explicitly Unfreeze
                    </button>
                    <p className="text-xs text-emerald-50/65">
                      Grid V{activeFreeze.inventoryGridVersion} · {activeFreeze.inventorySubdivisionFactor}×{activeFreeze.inventorySubdivisionFactor} · {activeFreeze.readyStateCount} ready · {activeFreeze.reviewStateCount} accepted review · 0 blocked
                    </p>
                  </div>
                </>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void freezeGeography1()}
                    disabled={
                      !activeRelease ||
                      databaseBusy ||
                      isPreviewingRelease
                    }
                    className="rounded-xl bg-yellow-300 px-4 py-3 text-sm font-black text-yellow-950 enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Freeze Geography 1.0
                  </button>
                  <p className="text-xs text-yellow-50/70">
                    Requires an active valid Grid V2 release. Blocked audit results cannot be frozen; non-blocking warnings require explicit acceptance.
                  </p>
                </div>
              )}
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
                    const isFrozenRelease =
                      activeFreeze?.releaseNumber ===
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
                            {isFrozenRelease && (
                              <span className="rounded-full border border-emerald-200/40 bg-emerald-400/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-100">
                                Geography 1.0
                              </span>
                            )}
                            {isPreviewed && (
                              <span className="rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950">
                                Preview
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-zinc-400">
                            State r{release.topologyRevision} · Territory r{release.territoryRevision} · Protected r{release.protectedAreaRevision} · Published {formatDatabaseDate(
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
                            disabled={
                              databaseBusy ||
                              isPreviewed ||
                              (activeFreeze !== null && !isFrozenRelease)
                            }
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
                            disabled={
                              databaseBusy ||
                              isActive ||
                              activeFreeze !== null
                            }
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
                  disabled={activeFreeze !== null}
                  className="rounded-lg bg-amber-200 disabled:cursor-not-allowed disabled:opacity-35 px-3 py-2 text-xs font-black text-amber-950 hover:bg-white"
                >
                  Copy Release to Draft
                </button>
                <button
                  type="button"
                  onClick={exitReleasePreview}
                  disabled={activeFreeze !== null}
                  className="rounded-lg border border-amber-100/30 disabled:cursor-not-allowed disabled:opacity-35 px-3 py-2 text-xs font-black text-amber-50 hover:bg-amber-100/10"
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

              {(territoryDisplayMode === "protected" ||
                territoryDisplayMode === "all") &&
                resolvedProtectedAreas.map((area) => {
                  const isSelected =
                    area.id === selectedProtectedAreaId;

                  return (
                    <Polygon
                      key={`protected-${area.id}`}
                      positions={area.boundary}
                      pathOptions={{
                        color: isSelected ? "#ffffff" : "#f43f5e",
                        weight: isSelected ? 4 : 2.2,
                        opacity: 0.96,
                        fillColor: "#be123c",
                        fillOpacity: isSelected ? 0.42 : 0.24,
                        dashArray:
                          area.category === "Reserved Area"
                            ? "8 5"
                            : undefined,
                      }}
                      eventHandlers={{
                        click: () => selectProtectedArea(area.id),
                      }}
                    >
                      <Popup>
                        <strong>{area.name}</strong>
                        <br />
                        {area.category} · {area.stateName}
                        <br />
                        Protected from property inventory
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

              {!editingLocked &&
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
                    draggable={!editingLocked}
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
                      draggable={!editingLocked}
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

                    {!editingLocked &&
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
                          draggable={!editingLocked}
                          eventHandlers={{
                            click: () => {
                              setSelectedTerritoryPointIndex(
                                pointIndex
                              );
                              setSelectedProtectedAreaId(null);
                              setSelectedProtectedAreaPointIndex(null);
                              setSelectedNodeId(null);
                            },
                            dragstart: () => {
                              dragBaselineRef.current =
                                cloneGeographyDocument(geography);
                              setSelectedTerritoryPointIndex(
                                pointIndex
                              );
                              setSelectedProtectedAreaId(null);
                              setSelectedProtectedAreaPointIndex(null);
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

              {showProtectedAreaEditingHandles &&
                selectedResolvedProtectedArea && (
                  <>
                    <Marker
                      key={`${selectedResolvedProtectedArea.id}-center`}
                      position={selectedResolvedProtectedArea.center}
                      icon={protectedAreaCenterIcon}
                      draggable={!editingLocked}
                      eventHandlers={{
                        dragstart: () => {
                          dragBaselineRef.current =
                            cloneGeographyDocument(geography);
                          setSelectedProtectedAreaPointIndex(null);
                          setSelectedTerritoryId(null);
                          setSelectedTerritoryPointIndex(null);
                          setSelectedNodeId(null);
                        },
                        drag: (event) => {
                          const nextPosition = event.target.getLatLng();
                          updateProtectedAreaCenterFromMap(
                            selectedResolvedProtectedArea.id,
                            [nextPosition.lat, nextPosition.lng],
                            false
                          );
                        },
                        dragend: (event) => {
                          const baseline = dragBaselineRef.current;
                          const nextPosition = event.target.getLatLng();
                          updateProtectedAreaCenterFromMap(
                            selectedResolvedProtectedArea.id,
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
                      <Popup>Drag to move the entire protected area</Popup>
                    </Marker>

                    {!editingLocked &&
                      selectedProtectedAreaSegmentTargets.map((target) => (
                        <Marker
                          key={target.key}
                          position={target.position}
                          icon={protectedAreaAddIcon}
                          eventHandlers={{
                            click: () =>
                              addSelectedProtectedAreaPoint(
                                target.segmentIndex
                              ),
                          }}
                        >
                          <Popup>Add a protected-area boundary point</Popup>
                        </Marker>
                      ))}

                    {selectedResolvedProtectedArea.boundary.map(
                      (position, pointIndex) => (
                        <Marker
                          key={`${selectedResolvedProtectedArea.id}-point-${pointIndex}`}
                          position={position}
                          icon={
                            pointIndex ===
                            selectedProtectedAreaPointIndex
                              ? selectedProtectedAreaVertexIcon
                              : protectedAreaVertexIcon
                          }
                          draggable={!editingLocked}
                          eventHandlers={{
                            click: () => {
                              setSelectedProtectedAreaPointIndex(
                                pointIndex
                              );
                              setSelectedTerritoryId(null);
                              setSelectedTerritoryPointIndex(null);
                              setSelectedNodeId(null);
                            },
                            dragstart: () => {
                              dragBaselineRef.current =
                                cloneGeographyDocument(geography);
                              setSelectedProtectedAreaPointIndex(
                                pointIndex
                              );
                              setSelectedTerritoryId(null);
                              setSelectedTerritoryPointIndex(null);
                              setSelectedNodeId(null);
                            },
                            drag: (event) => {
                              const nextPosition =
                                event.target.getLatLng();
                              updateProtectedAreaBoundaryFromMap(
                                selectedResolvedProtectedArea.id,
                                pointIndex,
                                [nextPosition.lat, nextPosition.lng],
                                false
                              );
                            },
                            dragend: (event) => {
                              const baseline = dragBaselineRef.current;
                              const nextPosition =
                                event.target.getLatLng();
                              updateProtectedAreaBoundaryFromMap(
                                selectedResolvedProtectedArea.id,
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
              {isPreviewingRelease
                ? "Release Preview"
                : activeFreeze
                  ? `${activeFreeze.label} Frozen`
                  : "Editing"}
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
                  State {topology.revision} · Territory {territoryLayout.revision} · Protected {protectedAreaLayout.revision}
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
                {!workingValidation.valid && (
                  <p className="mt-1 text-xs font-bold text-red-100/80">
                    {workingValidationIssues.length} global error{workingValidationIssues.length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            </div>

            {workingValidationIssues.length > 0 && (
              <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-red-50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wider">
                    Global validation errors
                  </p>
                  <span className="rounded-lg border border-red-200/25 bg-black/25 px-2 py-1 text-[10px] font-black uppercase tracking-wider">
                    {workingValidationIssues.length} found
                  </span>
                </div>
                <p className="mt-2 text-xs text-red-50/75">
                  These errors may not belong to the selected state. Run the Geography 1.0 audit to diagnose the entire working draft. Saving and publishing remain disabled until they are corrected.
                </p>
                <div className="mt-3 max-h-44 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
                  {workingValidationIssues.map((issue, index) => (
                    <p key={`${issue.source}-${issue.code}-${index}`}>
                      <strong>{issue.source} · {issue.code}:</strong> {issue.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

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
                  City and town territories are part of the same published
                  geography and already control public block inventory.
                </p>
              </div>

              <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-rose-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">Protected & Historic Areas</p>
                    <p className="mt-1 text-xs text-rose-50/70">
                      These editable, state-relative zones are permanently
                      excluded from Rural Acres, City Blocks, and Town Blocks.
                    </p>
                  </div>
                  <span
                    className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                      protectedAreaValidation.valid
                        ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                        : "border-red-300/30 bg-red-400/10 text-red-100"
                    }`}
                  >
                    {protectedAreaValidation.valid ? "Valid" : "Review"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-rose-100/15 bg-black/30 p-2">
                    <p className="text-lg font-black">
                      {resolvedProtectedAreas.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-rose-50/60">
                      This State
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-100/15 bg-black/30 p-2">
                    <p className="text-lg font-black">
                      {protectedAreaValidation.areaCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-rose-50/60">
                      World Total
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-100/15 bg-black/30 p-2">
                    <p className="text-lg font-black">
                      {protectedAreaValidation.errors.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-rose-50/60">
                      Errors
                    </p>
                  </div>
                </div>

                {selectedProtectedAreaIssues.length > 0 && (
                  <div className="mt-3 max-h-28 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-2 text-[11px] text-rose-50/75">
                    {selectedProtectedAreaIssues.slice(0, 5).map((issue) => (
                      <p key={`${issue.code}-${issue.areaId ?? issue.message}`}>
                        <strong>{issue.code}:</strong> {issue.message}
                      </p>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-[11px] font-bold text-rose-100/80">
                  Protected geometry is saved in browser drafts, database
                  drafts, numbered releases, previews, activation, and rollback.
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
                        disabled={editingLocked}
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
                        disabled={editingLocked}
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
                        disabled={editingLocked}
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
                        disabled={editingLocked}
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
                          editingLocked ||
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
                        disabled={editingLocked}
                        className="rounded-lg border border-white/25 px-3 py-2 text-xs font-black enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        Reset This Territory
                      </button>
                    </div>
                  </div>
                )}

              {selectedResolvedProtectedArea &&
                selectedProtectedAreaDefinition && (
                  <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-rose-50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200/70">
                      Selected protected area
                    </p>

                    <label className="mt-3 block text-xs font-bold">
                      Name
                      <input
                        value={selectedProtectedAreaDefinition.name}
                        onChange={(event) =>
                          updateSelectedProtectedAreaMetadata({
                            name: event.target.value,
                          })
                        }
                        disabled={editingLocked}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white disabled:opacity-40"
                      />
                    </label>

                    <label className="mt-3 block text-xs font-bold">
                      Classification
                      <select
                        value={selectedProtectedAreaDefinition.category}
                        onChange={(event) =>
                          updateSelectedProtectedAreaMetadata({
                            category: event.target.value as LunaSphereProtectedAreaCategory,
                          })
                        }
                        disabled={editingLocked}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white disabled:opacity-40"
                      >
                        {PROTECTED_AREA_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="mt-3 block text-xs font-bold">
                      Description
                      <textarea
                        value={selectedProtectedAreaDefinition.description}
                        onChange={(event) =>
                          updateSelectedProtectedAreaMetadata({
                            description: event.target.value,
                          })
                        }
                        disabled={editingLocked}
                        rows={4}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white disabled:opacity-40"
                      />
                    </label>

                    <label className="mt-3 block text-xs font-bold">
                      Public minimum zoom
                      <select
                        value={selectedProtectedAreaDefinition.minZoom}
                        onChange={(event) =>
                          updateSelectedProtectedAreaMetadata({
                            minZoom: Number(event.target.value),
                          })
                        }
                        disabled={editingLocked}
                        className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white disabled:opacity-40"
                      >
                        {[2, 3, 4, 5, 6, 7].map((zoom) => (
                          <option key={zoom} value={zoom}>
                            Zoom {zoom}
                          </option>
                        ))}
                      </select>
                    </label>

                    <p className="mt-3 font-mono text-[11px] text-rose-50/70">
                      {selectedResolvedProtectedArea.id} · Protected revision{" "}
                      {protectedAreaLayout.revision}
                    </p>
                    <p className="mt-2 text-xs text-rose-50/75">
                      Drag the diamond to move the complete zone. Drag circular
                      handles to reshape it; plus handles add detail points.
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-black">
                      <span />
                      <button
                        type="button"
                        onClick={() =>
                          selectedProtectedAreaPointIndex === null
                            ? nudgeSelectedProtectedAreaCenter(-0.005, 0)
                            : nudgeSelectedProtectedAreaPoint(-0.005, 0)
                        }
                        disabled={editingLocked}
                        className="rounded-lg border border-white/25 px-2 py-2 enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <span />
                      <button
                        type="button"
                        onClick={() =>
                          selectedProtectedAreaPointIndex === null
                            ? nudgeSelectedProtectedAreaCenter(0, -0.005)
                            : nudgeSelectedProtectedAreaPoint(0, -0.005)
                        }
                        disabled={editingLocked}
                        className="rounded-lg border border-white/25 px-2 py-2 enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          selectedProtectedAreaPointIndex === null
                            ? nudgeSelectedProtectedAreaCenter(0.005, 0)
                            : nudgeSelectedProtectedAreaPoint(0.005, 0)
                        }
                        disabled={editingLocked}
                        className="rounded-lg border border-white/25 px-2 py-2 enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          selectedProtectedAreaPointIndex === null
                            ? nudgeSelectedProtectedAreaCenter(0, 0.005)
                            : nudgeSelectedProtectedAreaPoint(0, 0.005)
                        }
                        disabled={editingLocked}
                        className="rounded-lg border border-white/25 px-2 py-2 enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        →
                      </button>
                    </div>

                    <p className="mt-2 text-[11px] text-rose-50/70">
                      {selectedProtectedAreaPointIndex === null
                        ? "Precision controls move the entire protected zone."
                        : `Boundary point ${selectedProtectedAreaPointIndex + 1} of ${selectedProtectedAreaDefinition.boundary.length} selected.`}
                    </p>

                    <div className="mt-3 grid gap-2">
                      <button
                        type="button"
                        onClick={removeSelectedProtectedAreaPoint}
                        disabled={
                          editingLocked ||
                          !selectedProtectedAreaCanRemovePoint
                        }
                        className="rounded-lg border border-white/25 px-3 py-2 text-xs font-black enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        {selectedProtectedAreaPointIndex === null
                          ? "Select a Boundary Point to Remove"
                          : selectedProtectedAreaCanRemovePoint
                            ? "Remove Selected Boundary Point"
                            : "Minimum Boundary Detail Reached"}
                      </button>
                      <button
                        type="button"
                        onClick={resetSelectedProtectedArea}
                        disabled={editingLocked}
                        className="rounded-lg border border-white/25 px-3 py-2 text-xs font-black enabled:hover:bg-white/10 disabled:opacity-40"
                      >
                        Reset This Protected Area
                      </button>
                      <button
                        type="button"
                        onClick={removeSelectedProtectedArea}
                        disabled={editingLocked}
                        className="rounded-lg border border-red-300/40 bg-red-400/10 px-3 py-2 text-xs font-black text-red-100 enabled:hover:bg-red-400/20 disabled:opacity-40"
                      >
                        Delete This Protected Area
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
                      disabled={editingLocked}
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
                      disabled={editingLocked}
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
                      disabled={editingLocked}
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
                      disabled={editingLocked}
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 enabled:hover:bg-yellow-100/10 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Nudge selected handle right"
                    >
                      →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={removeSelectedControlPoint}
                    disabled={editingLocked || !removableNodeEdge}
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
                Browser autosave protects immediate work. The controlled active
                release drives states, cities, towns, protected areas, and
                property inventory on the public Moon Map. Published property
                records remain stable while new draft geography stays private.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
