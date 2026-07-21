"use client";

import { useMemo, useState } from "react";
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
  cloneTopology,
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

export default function LunaSphereDesigner() {
  const [topology, setTopology] = useState(() =>
    cloneTopology(baselineTopology)
  );
  const [selectedState, setSelectedState] = useState(
    baselineTopology.states[0]?.name ?? ""
  );
  const [selectedNodeId, setSelectedNodeId] = useState<
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

          return [
            {
              key: `${edge.id}-segment-${index}`,
              edgeId: edge.id,
              segmentIndex: index,
              position: [
                (startNode.coordinate[0] +
                  endNode.coordinate[0]) /
                  2,
                (startNode.coordinate[1] +
                  endNode.coordinate[1]) /
                  2,
              ],
            },
          ];
        })
      ),
    [nodeById, selectedEdges]
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

  function selectState(stateName: string) {
    setSelectedState(stateName);
    setSelectedNodeId(null);
  }

  function updateNode(
    nodeId: string,
    nextPosition: [number, number]
  ) {
    setTopology((currentTopology) =>
      moveTopologyNode(
        currentTopology,
        nodeId,
        nextPosition
      )
    );
  }

  function addControlPoint(target: EdgeSegmentTarget) {
    setTopology((currentTopology) =>
      insertTopologyEdgeNode(
        currentTopology,
        target.edgeId,
        target.segmentIndex,
        target.position
      )
    );
    setSelectedNodeId(null);
  }

  function removeSelectedControlPoint() {
    if (!selectedNodeId || !removableNodeEdge) {
      return;
    }

    setTopology((currentTopology) =>
      removeTopologyEdgeNode(
        currentTopology,
        removableNodeEdge.id,
        selectedNodeId
      )
    );
    setSelectedNodeId(null);
  }

  function resetSelectedState() {
    setTopology((currentTopology) =>
      restoreTopologyState(
        currentTopology,
        baselineTopology,
        selectedState
      )
    );
    setSelectedNodeId(null);
  }

  function resetAllStates() {
    setTopology(cloneTopology(baselineTopology));
    setSelectedNodeId(null);
  }

  function exportSelectedState() {
    if (!selectedRegion || !selectedTopologyState) {
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
    downloadJson(
      `lunasphere-topology-draft-r${topology.revision}.json`,
      topology
    );
  }

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
            updates all states that share it. Click a green plus
            handle to add natural border detail. Changes remain a
            browser-session draft until exported.
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
              onClick={exportSelectedState}
              className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black hover:bg-yellow-300"
            >
              Export Selected State
            </button>

            <button
              type="button"
              onClick={exportAllStates}
              className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black hover:bg-zinc-200"
            >
              Export Topology Draft
            </button>
          </div>
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
                    dragstart: () =>
                      setSelectedNodeId(node.id),
                    drag: (event) => {
                      const marker = event.target;
                      const nextPosition = marker.getLatLng();

                      updateNode(node.id, [
                        nextPosition.lat,
                        nextPosition.lng,
                      ]);
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
                  Shared borders
                </p>
                <p className="mt-1 text-xl font-black">
                  {
                    selectedEdges.filter(
                      (edge) =>
                        edge.kind === "shared-state-border"
                    ).length
                  }
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
                Click a green plus handle to add an editable point
                between two existing border points.
              </p>

              <p>
                Select a yellow handle to inspect it. Only interior
                control points can be removed; junctions stay locked.
              </p>

              {selectedNodeId && (
                <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3">
                  <p className="font-bold text-yellow-100">
                    Selected handle
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-yellow-50/80">
                    {selectedNodeId}
                  </p>

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
              </div>

              {!validation.valid && (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-red-400/20 bg-black p-3 text-xs text-red-100">
                  {validation.errors.slice(0, 8).map((issue) => (
                    <p key={`${issue.code}-${issue.entityId ?? issue.message}`}>
                      <strong>{issue.code}:</strong> {issue.message}
                    </p>
                  ))}
                </div>
              )}

              <p className="rounded-xl border border-sky-400/30 bg-sky-400/10 p-3 text-sky-100">
                Draft mode is isolated from the public Moon Map,
                parcels, reservations, checkout, and customer records.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
