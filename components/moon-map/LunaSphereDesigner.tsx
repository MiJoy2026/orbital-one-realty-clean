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
  hasCompatibleTopologyStructure,
  loadLunaSphereStudioDraft,
  saveLunaSphereStudioDraft,
} from "@/lib/lunasphere-studio-draft";
import {
  createInitialTerritoryLayout,
  createTerritorySummary,
  resolveStateTerritories,
  validateTerritoryLayout,
  type LunaSphereSettlementKind,
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
  type LunaSphereTopology,
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

type TerritoryDisplayMode = "states" | LunaSphereSettlementKind | "all";

type EdgeSegmentTarget = {
  key: string;
  edgeId: string;
  segmentIndex: number;
  position: [number, number];
};

type TopologyHistoryState = {
  past: LunaSphereTopology[];
  present: LunaSphereTopology;
  future: LunaSphereTopology[];
};

type TopologyHistoryAction =
  | {
      type: "apply";
      update: (
        topology: LunaSphereTopology
      ) => LunaSphereTopology;
    }
  | {
      type: "preview";
      update: (
        topology: LunaSphereTopology
      ) => LunaSphereTopology;
    }
  | {
      type: "commit-preview";
      baseline: LunaSphereTopology;
      nodeId: string;
    }
  | {
      type: "undo";
    }
  | {
      type: "redo";
    }
  | {
      type: "replace";
      topology: LunaSphereTopology;
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
  topology: LunaSphereTopology;
};

type GeographyReleaseMetadata = {
  releaseNumber: number;
  publishedAt: string;
  topologyRevision: number;
  topologyHash: string;
};

type GeographyActivationMetadata = GeographyReleaseMetadata & {
  activatedAt: string;
};

type GeographyReleaseDetail = GeographyReleaseMetadata & {
  topology: LunaSphereTopology;
};

type GeographyWorkspaceResponse = {
  draft: DatabaseDraftMetadata | null;
  latestRelease: GeographyReleaseMetadata | null;
  activeRelease: GeographyActivationMetadata | null;
  releases: GeographyReleaseMetadata[];
  error?: string;
};

function addHistorySnapshot(
  history: LunaSphereTopology[],
  topology: LunaSphereTopology
): LunaSphereTopology[] {
  return [
    ...history,
    cloneTopology(topology),
  ].slice(-HISTORY_LIMIT);
}

function topologyHistoryReducer(
  state: TopologyHistoryState,
  action: TopologyHistoryAction
): TopologyHistoryState {
  if (action.type === "apply") {
    const nextTopology = action.update(state.present);

    if (nextTopology === state.present) {
      return state;
    }

    return {
      past: addHistorySnapshot(state.past, state.present),
      present: nextTopology,
      future: [],
    };
  }

  if (action.type === "preview") {
    const nextTopology = action.update(state.present);

    return nextTopology === state.present
      ? state
      : {
          ...state,
          present: nextTopology,
        };
  }

  if (action.type === "commit-preview") {
    const baselineNode = action.baseline.nodes.find(
      (node) => node.id === action.nodeId
    );
    const currentNode = state.present.nodes.find(
      (node) => node.id === action.nodeId
    );

    if (!baselineNode || !currentNode) {
      return state;
    }

    const coordinateChanged =
      baselineNode.coordinate[0] !== currentNode.coordinate[0] ||
      baselineNode.coordinate[1] !== currentNode.coordinate[1];

    if (!coordinateChanged) {
      return state;
    }

    return {
      past: addHistorySnapshot(state.past, action.baseline),
      present: {
        ...state.present,
        revision: action.baseline.revision + 1,
      },
      future: [],
    };
  }

  if (action.type === "undo") {
    const previousTopology = state.past.at(-1);

    if (!previousTopology) {
      return state;
    }

    return {
      past: state.past.slice(0, -1),
      present: cloneTopology(previousTopology),
      future: [
        cloneTopology(state.present),
        ...state.future,
      ].slice(0, HISTORY_LIMIT),
    };
  }

  if (action.type === "redo") {
    const nextTopology = state.future[0];

    if (!nextTopology) {
      return state;
    }

    return {
      past: addHistorySnapshot(state.past, state.present),
      present: cloneTopology(nextTopology),
      future: state.future.slice(1),
    };
  }

  if (action.recordCurrent) {
    return {
      past: addHistorySnapshot(state.past, state.present),
      present: cloneTopology(action.topology),
      future: [],
    };
  }

  return {
    past: [],
    present: cloneTopology(action.topology),
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

function topologiesHaveSameContent(
  first: LunaSphereTopology,
  second: LunaSphereTopology
): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
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
    topologyHistoryReducer,
    {
      past: [],
      present: cloneTopology(baselineTopology),
      future: [],
    }
  );
  const workingTopology = history.present;

  const dragBaselineRef = useRef<LunaSphereTopology | null>(
    null
  );
  const autosaveTokenRef = useRef(0);
  const [selectedState, setSelectedState] = useState(
    baselineTopology.states[0]?.name ?? ""
  );
  const [territoryDisplayMode, setTerritoryDisplayMode] =
    useState<TerritoryDisplayMode>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<
    string | null
  >(null);
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

  const topology = releasePreview?.topology ?? workingTopology;
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
    () => validateTopology(workingTopology),
    [workingTopology]
  );
  const summary = useMemo(
    () => createTopologySummary(topology),
    [topology]
  );
  const resolvedTerritories = useMemo(
    () =>
      resolveStateTerritories(
        topology,
        baselineTerritoryLayout,
        selectedState
      ),
    [selectedState, topology]
  );
  const territorySummary = useMemo(
    () => createTerritorySummary(resolvedTerritories),
    [resolvedTerritories]
  );
  const territoryValidation = useMemo(
    () =>
      validateTerritoryLayout(
        topology,
        baselineTerritoryLayout
      ),
    [topology]
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
          !hasCompatibleTopologyStructure(
            workspace.draft.topology,
            baselineTopology
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
              ? `Database draft refreshed. Revision ${workspace.draft.topologyRevision} was saved ${formatDatabaseDate(
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
        baselineTopology
      );

      if (savedDraft.status === "loaded") {
        dispatchHistory({
          type: "replace",
          topology: savedDraft.topology,
          recordCurrent: false,
        });
        setLastSavedAt(savedDraft.savedAt);
        setDraftStatus("saved");
        setDraftNotice(
          `Recovered the local Studio draft saved ${new Date(
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
        workingTopology
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
  }, [draftReady, workingTopology]);

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
        return;
      }

      if (commandKey && normalizedKey === "y") {
        event.preventDefault();
        dispatchHistory({ type: "redo" });
        setSelectedNodeId(null);
        return;
      }

      if (
        (event.key === "Delete" ||
          event.key === "Backspace") &&
        selectedNodeId &&
        removableNodeEdge
      ) {
        event.preventDefault();
        dispatchHistory({
          type: "apply",
          update: (currentTopology) =>
            removeTopologyEdgeNode(
              currentTopology,
              removableNodeEdge.id,
              selectedNodeId
            ),
        });
        setSelectedNodeId(null);
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcut);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyboardShortcut
      );
  }, [isPreviewingRelease, removableNodeEdge, selectedNodeId]);

  function selectState(stateName: string) {
    setSelectedState(stateName);
    setSelectedNodeId(null);
  }

  function addControlPoint(target: EdgeSegmentTarget) {
    dispatchHistory({
      type: "apply",
      update: (currentTopology) =>
        insertTopologyEdgeNode(
          currentTopology,
          target.edgeId,
          target.segmentIndex,
          target.position
        ),
    });
    setSelectedNodeId(null);
  }

  function removeSelectedControlPoint() {
    if (!selectedNodeId || !removableNodeEdge) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentTopology) =>
        removeTopologyEdgeNode(
          currentTopology,
          removableNodeEdge.id,
          selectedNodeId
        ),
    });
    setSelectedNodeId(null);
  }

  function nudgeSelectedNode(deltaY: number, deltaX: number) {
    if (!selectedNode) {
      return;
    }

    dispatchHistory({
      type: "apply",
      update: (currentTopology) =>
        moveTopologyNode(
          currentTopology,
          selectedNode.id,
          [
            selectedNode.coordinate[0] + deltaY,
            selectedNode.coordinate[1] + deltaX,
          ]
        ),
    });
  }

  function resetSelectedState() {
    dispatchHistory({
      type: "apply",
      update: (currentTopology) =>
        restoreTopologyState(
          currentTopology,
          baselineTopology,
          selectedState
        ),
    });
    setSelectedNodeId(null);
  }

  function resetAllStates() {
    dispatchHistory({
      type: "apply",
      update: () => cloneTopology(baselineTopology),
    });
    setSelectedNodeId(null);
  }

  function undo() {
    dispatchHistory({ type: "undo" });
    setSelectedNodeId(null);
  }

  function redo() {
    dispatchHistory({ type: "redo" });
    setSelectedNodeId(null);
  }

  function saveDraftNow() {
    const result = saveLunaSphereStudioDraft(
      window.localStorage,
      workingTopology
    );

    if (result.ok) {
      setLastSavedAt(result.savedAt);
      setDraftStatus("saved");
      setDraftNotice("The current topology draft was saved locally.");
    } else {
      setDraftStatus("error");
      setDraftNotice(result.message);
    }
  }

  function reloadSavedDraft() {
    const savedDraft = loadLunaSphereStudioDraft(
      window.localStorage,
      baselineTopology
    );

    if (savedDraft.status === "loaded") {
      dispatchHistory({
        type: "replace",
        topology: savedDraft.topology,
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
        "Fix the topology errors before saving the shared database draft."
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
          topology: workingTopology,
          expectedSavedAt: databaseDraft?.savedAt ?? null,
        }),
      });
      const result = await readResponseBody<{
        draft: DatabaseDraftMetadata;
      }>(response);

      if (
        !hasCompatibleTopologyStructure(
          result.draft.topology,
          baselineTopology
        )
      ) {
        throw new Error(
          "The saved database draft response was incompatible."
        );
      }

      setDatabaseDraft(result.draft);
      setDatabaseStatus("ready");
      setDatabaseNotice(
        `Shared database draft saved at revision ${result.draft.topologyRevision}.`
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
      !hasCompatibleTopologyStructure(
        databaseDraft.topology,
        baselineTopology
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
      topology: databaseDraft.topology,
      recordCurrent: true,
    });
    setSelectedNodeId(null);
    setDatabaseStatus("ready");
    setDatabaseNotice(
      `Loaded shared database draft revision ${databaseDraft.topologyRevision}. Your previous open version can be restored with Undo.`
    );
  }

  async function publishDatabaseRelease() {
    if (!workingValidation.valid) {
      setDatabaseNotice(
        "Fix the topology errors before publishing a geography release."
      );
      return;
    }

    const confirmed = window.confirm(
      "Publish this validated topology as the next immutable LunaSphere geography release? Publishing records the release, but the public Moon Map will not change unless that release is explicitly activated."
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
          body: JSON.stringify({ topology: workingTopology }),
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
        !hasCompatibleTopologyStructure(
          result.release.topology,
          baselineTopology
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

    const copiedTopology: LunaSphereTopology = {
      ...cloneTopology(releasePreview.topology),
      status: "draft",
      revision:
        Math.max(
          workingTopology.revision,
          releasePreview.topology.revision
        ) + 1,
    };
    const releaseNumber = releasePreview.releaseNumber;

    dispatchHistory({
      type: "replace",
      topology: copiedTopology,
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
      }
    );
  }

  function exportAllStates() {
    if (!validation.valid) {
      return;
    }

    downloadJson(
      `lunasphere-topology-draft-r${topology.revision}.json`,
      topology
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
    topologiesHaveSameContent(
      databaseDraft.topology,
      workingTopology
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
              ? `Database revision ${databaseDraft.topologyRevision}${
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
              disabled={!validation.valid}
              className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black enabled:hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Export Selected State
            </button>

            <button
              type="button"
              onClick={exportAllStates}
              disabled={!validation.valid}
              className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Export Topology Draft
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-violet-400/25 bg-violet-400/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-200">
                  Shared Database Workspace
                </p>
                <p className="mt-1 text-sm text-violet-50/75">
                  Save one cross-device state draft, publish immutable
                  releases, preview any release, and choose the state release
                  used by the public Moon Map. Nested city and town territory
                  persistence will be connected in a later controlled milestone.
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
                The open topology differs from the shared database draft.
                Save it to the database before publishing a release.
              </p>
            )}

            <div className="mt-4 grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-violet-50/80">
                <strong className="text-violet-100">Database draft:</strong>{" "}
                {databaseDraft
                  ? `Revision ${databaseDraft.topologyRevision}, saved ${formatDatabaseDate(
                      databaseDraft.savedAt
                    )}`
                  : "Not saved yet"}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-violet-50/80">
                <strong className="text-violet-100">Latest release:</strong>{" "}
                {latestRelease
                  ? `Release ${latestRelease.releaseNumber}, revision ${latestRelease.topologyRevision}, published ${formatDatabaseDate(
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
                            Revision {release.topologyRevision} · Published {formatDatabaseDate(
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
                resolvedTerritories.cities.map((city) => (
                  <Polygon
                    key={`territory-${city.id}`}
                    positions={city.boundary}
                    pathOptions={{
                      color: "#22d3ee",
                      weight: 2,
                      opacity: 0.95,
                      fillColor: "#0891b2",
                      fillOpacity: 0.22,
                    }}
                  >
                    <Popup>
                      <strong>{city.name}</strong>
                      <br />
                      City {city.territoryNumber} · {city.stateName}
                      <br />
                      Area {city.area.toFixed(1)}
                    </Popup>
                  </Polygon>
                ))}

              {resolvedTerritories &&
                (territoryDisplayMode === "town" ||
                  territoryDisplayMode === "all") &&
                resolvedTerritories.towns.map((town) => (
                  <Polygon
                    key={`territory-${town.id}`}
                    positions={town.boundary}
                    pathOptions={{
                      color: "#f59e0b",
                      weight: 1.4,
                      opacity: 0.9,
                      fillColor: "#d97706",
                      fillOpacity: 0.2,
                    }}
                  >
                    <Popup>
                      <strong>{town.name}</strong>
                      <br />
                      Town {town.territoryNumber} · {town.stateName}
                      <br />
                      Area {town.area.toFixed(1)}
                    </Popup>
                  </Polygon>
                ))}

              {selectedEdges.map((edge) => (
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

              {!isPreviewingRelease && edgeSegmentTargets.map((target) => (
                <Marker
                  key={target.key}
                  position={target.position}
                  icon={addVertexIcon}
                  eventHandlers={{
                    click: () => addControlPoint(target),
                  }}
                >
                  <Popup>Add a border control point</Popup>
                </Marker>
              ))}

              {selectedNodes.map((node) => (
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
                    click: () => setSelectedNodeId(node.id),
                    dragstart: () => {
                      dragBaselineRef.current =
                        cloneTopology(topology);
                      setSelectedNodeId(node.id);
                    },
                    drag: (event) => {
                      const nextPosition =
                        event.target.getLatLng();

                      dispatchHistory({
                        type: "preview",
                        update: (currentTopology) =>
                          moveTopologyNode(
                            currentTopology,
                            node.id,
                            [
                              nextPosition.lat,
                              nextPosition.lng,
                            ],
                            { incrementRevision: false }
                          ),
                      });
                    },
                    dragend: (event) => {
                      const baseline = dragBaselineRef.current;
                      const nextPosition =
                        event.target.getLatLng();

                      dispatchHistory({
                        type: "preview",
                        update: (currentTopology) =>
                          moveTopologyNode(
                            currentTopology,
                            node.id,
                            [
                              nextPosition.lat,
                              nextPosition.lng,
                            ],
                            { incrementRevision: false }
                          ),
                      });

                      if (baseline) {
                        dispatchHistory({
                          type: "commit-preview",
                          baseline,
                          nodeId: node.id,
                        });
                      }

                      dragBaselineRef.current = null;
                    },
                  }}
                />
              ))}
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
                  Revision
                </p>
                <p className="mt-1 text-xl font-black">
                  {topology.revision}
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
                  validation.valid
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-red-400/30 bg-red-400/10"
                }`}
              >
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  Validation
                </p>
                <p className="mt-1 text-xl font-black">
                  {validation.valid ? "Valid" : "Review"}
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
