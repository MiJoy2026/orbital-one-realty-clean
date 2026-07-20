"use client";

import { useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  ScaleControl,
  ZoomControl,
} from "react-leaflet";
import { CRS, divIcon, Transformation } from "leaflet";
import "leaflet/dist/leaflet.css";

import LunarTileLayer from "@/components/moon-map/LunarTileLayer";
import {
  lunarMapRegions,
  type LunarMapRegion,
} from "@/lib/lunar-map-regions";

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

function cloneRegions(regions: LunarMapRegion[]): LunarMapRegion[] {
  return regions.map((region) => ({
    ...region,
    labelPosition: [...region.labelPosition] as [number, number],
    positions: region.positions.map(
      ([y, x]) => [y, x] as [number, number]
    ),
  }));
}

export default function LunaSphereDesigner() {
  const [regions, setRegions] = useState<LunarMapRegion[]>(() =>
    cloneRegions(lunarMapRegions)
  );

  const [selectedState, setSelectedState] = useState(
    lunarMapRegions[0]?.name ?? ""
  );

  const selectedRegion = useMemo(
    () => regions.find((region) => region.name === selectedState) ?? null,
    [regions, selectedState]
  );

  function updateVertex(
  stateName: string,
  vertexIndex: number,
  nextPosition: [number, number]
) {
  setRegions((currentRegions) => {
    const selectedRegion = currentRegions.find(
      (region) => region.name === stateName
    );

    if (!selectedRegion) {
      return currentRegions;
    }

    const originalPosition = selectedRegion.positions[vertexIndex];

    if (!originalPosition) {
      return currentRegions;
    }

    const [originalY, originalX] = originalPosition;
    const tolerance = 0.01;

    return currentRegions.map((region) => ({
      ...region,
      positions: region.positions.map(([y, x]) => {
        const isSharedVertex =
          Math.abs(y - originalY) < tolerance &&
          Math.abs(x - originalX) < tolerance;

        return isSharedVertex
          ? ([nextPosition[0], nextPosition[1]] as [number, number])
          : ([y, x] as [number, number]);
      }),
    }));
  });
}

  function resetSelectedState() {
    const originalRegion = lunarMapRegions.find(
      (region) => region.name === selectedState
    );

    if (!originalRegion) {
      return;
    }

    setRegions((currentRegions) =>
      currentRegions.map((region) =>
        region.name === selectedState
          ? {
              ...originalRegion,
              labelPosition: [
                ...originalRegion.labelPosition,
              ] as [number, number],
              positions: originalRegion.positions.map(
                ([y, x]) => [y, x] as [number, number]
              ),
            }
          : region
      )
    );
  }

  function resetAllStates() {
    setRegions(cloneRegions(lunarMapRegions));
  }

  function exportSelectedState() {
    if (!selectedRegion) {
      return;
    }

    const exportData = {
      name: selectedRegion.name,
      labelPosition: selectedRegion.labelPosition,
      positions: selectedRegion.positions.map(([y, x]) => [
        Number(y.toFixed(2)),
        Number(x.toFixed(2)),
      ]),
    };

    const fileContents = JSON.stringify(exportData, null, 2);
    const blob = new Blob([fileContents], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `${selectedRegion.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-region.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
  }

  function exportAllStates() {
    const exportData = regions.map((region) => ({
      name: region.name,
      labelPosition: region.labelPosition,
      positions: region.positions.map(([y, x]) => [
        Number(y.toFixed(2)),
        Number(x.toFixed(2)),
      ]),
    }));

    const fileContents = JSON.stringify(exportData, null, 2);
    const blob = new Blob([fileContents], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "lunasphere-state-regions.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 rounded-3xl border border-yellow-400/30 bg-zinc-950 p-6">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
            LunaSphere Designer
          </p>

          <h1 className="mt-2 text-3xl font-black">
            State Geography Editor
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Select a state and drag its white border handles. Changes
            remain inside this browser session until you export them.
          </p>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="min-w-64">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Selected state
              </span>

              <select
                value={selectedState}
                onChange={(event) =>
                  setSelectedState(event.target.value)
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
              Export All States
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
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
                const isSelected = region.name === selectedState;

                return (
                  <Polygon
                    key={region.name}
                    positions={region.positions}
                    pathOptions={{
                      color: isSelected ? "#facc15" : "#ffffff",
                      weight: isSelected ? 3 : 1,
                      opacity: isSelected ? 1 : 0.18,
                      fillColor: "#facc15",
                      fillOpacity: isSelected ? 0.13 : 0.01,
                    }}
                    eventHandlers={{
                      click: () => setSelectedState(region.name),
                    }}
                  >
                    <Popup>{region.name}</Popup>
                  </Polygon>
                );
              })}

              {selectedRegion?.positions.map((position, index) => (
                <Marker
                  key={`${selectedRegion.name}-vertex-${index}`}
                  position={position}
                  icon={vertexIcon}
                  draggable
                  eventHandlers={{
                    drag: (event) => {
                      const marker = event.target;
                      const nextPosition = marker.getLatLng();

                      updateVertex(selectedRegion.name, index, [
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

            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              <p>
                <strong className="text-white">Vertices:</strong>{" "}
                {selectedRegion?.positions.length ?? 0}
              </p>

              <p>
                Drag a white handle to reshape the selected state.
              </p>

              <p>
                Click another state directly on the map to select it.
              </p>

              <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
                In this first version, moving one state border does not
                yet move the neighboring state’s matching border.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}