"use client";

import {
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
  const topology = history.present;

  const dragBaselineRef = useRef<LunaSphereTopology | null>(
    null
  );
  const autosaveTokenRef = useRef(0);
  const [selectedState, setSelectedState] = useState(
    baselineTopology.states[0]?.name ?? ""
  );
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
  const summary = useMemo(
    () => createTopologySummary(topology),
    [topology]
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
        topology
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
  }, [draftReady, topology]);

  useEffect(() => {
    function handleKeyboardShortcut(event: KeyboardEvent) {
      if (isTextEntryElement(event.target)) {
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
  }, [removableNodeEdge, selectedNodeId]);

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
      topology
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

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 rounded-3xl border border-yellow-400/30 bg-zinc-950 p-6">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
            LunaSphere Studio
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Shared State Geography Editor
          </h1>

          <p className="mt-2 max-w-4xl text-sm text-zinc-400">
            Every border is stored once. Dragging a white handle
            updates all states that share it. Drafts save locally,
            and each drag is one undoable action. Moon-perimeter
            handles remain locked to the circular saleable boundary.
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

            <button
              type="button"
              onClick={undo}
              disabled={history.past.length === 0}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Undo
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={history.future.length === 0}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Redo
            </button>

            <button
              type="button"
              onClick={saveDraftNow}
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
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/10"
            >
              Reset State
            </button>

            <button
              type="button"
              onClick={resetAllStates}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold hover:bg-white/10"
            >
              Reset All
            </button>

            <button
              type="button"
              onClick={reloadSavedDraft}
              disabled={!lastSavedAt}
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

              {edgeSegmentTargets.map((target) => (
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
                  draggable
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
              Editing
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
              <p>
                Drag a white handle to reshape the selected state.
                Shared neighbors move with the same border.
              </p>

              <p>
                Click a green plus handle to add an editable point.
                Press Ctrl+Z/Ctrl+Y to undo or redo.
              </p>

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
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 hover:bg-yellow-100/10"
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
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 hover:bg-yellow-100/10"
                      aria-label="Nudge selected handle left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        nudgeSelectedNode(NUDGE_DISTANCE, 0)
                      }
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 hover:bg-yellow-100/10"
                      aria-label="Nudge selected handle down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        nudgeSelectedNode(0, NUDGE_DISTANCE)
                      }
                      className="rounded-lg border border-yellow-100/30 px-2 py-2 hover:bg-yellow-100/10"
                      aria-label="Nudge selected handle right"
                    >
                      →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={removeSelectedControlPoint}
                    disabled={!removableNodeEdge}
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
                Drafts are saved only in this browser. The public Moon
                Map, parcels, reservations, checkout, and customer
                records remain unchanged.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
