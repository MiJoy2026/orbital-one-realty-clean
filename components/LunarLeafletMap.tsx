"use client";

import { useEffect, useState } from "react";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  ImageOverlay,
  Polygon,
  Popup,
  Marker,
  ZoomControl,
  ScaleControl,
  useMap,
} from "react-leaflet";
import { CRS, divIcon } from "leaflet";
import { lunarMapRegions } from "@/lib/lunar-map-regions";

type SelectedProperty = {
  id: string;
  type: string;
  state: string;
  status: string;
  mapX?: number;
  mapY?: number;
};
function FlyToSelectedProperty({
  selectedProperty,
}: {
  selectedProperty?: SelectedProperty | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedProperty?.mapX && selectedProperty?.mapY) {
      map.flyTo([selectedProperty.mapY, selectedProperty.mapX], 2, {
        duration: 1.2,
      });
    }
  }, [map, selectedProperty]);

  return null;
}
export default function LunarLeafletMap({
  selectedProperty,
}: {
  selectedProperty?: SelectedProperty | null;
}) {
  const bounds = [
    [0, 0],
    [1000, 1000],
  ] as [[number, number], [number, number]];
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const selectedPropertyIcon = divIcon({
  className: "",
  html: `<div style="
    background:#facc15;
    color:#000;
    font-weight:900;
    padding:6px 10px;
    border-radius:999px;
    border:2px solid #000;
    box-shadow:0 0 18px rgba(250,204,21,0.9);
    white-space:nowrap;
  ">📍 ${selectedProperty?.id || "Property"}</div>`,
});
  return (
    <div className="mx-auto mt-10 w-full max-w-7xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-yellow-400/30 bg-black/70 px-5 py-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
            Lunar Atlas Viewer
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Zoom, drag, and select highlighted lunar states.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase text-gray-300">
          <span className="rounded-full border border-white/20 px-3 py-1">
            Drag to Pan
          </span>
          <span className="rounded-full border border-white/20 px-3 py-1">
            Scroll to Zoom
          </span>
          <span className="rounded-full border border-yellow-400/50 px-3 py-1 text-yellow-400">
            Click State
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="h-[850px] overflow-hidden rounded-3xl border border-yellow-400/40 bg-black shadow-2xl">
        <MapContainer
          key="orbital-one-lunar-map"
          crs={CRS.Simple}
          center={[500, 500]}
          zoom={0}
          minZoom={-2}
          maxZoom={3}
          zoomControl={false}
          wheelPxPerZoomLevel={80}
          maxBounds={bounds}
          maxBoundsViscosity={0.7}
          style={{
            height: "100%",
            width: "100%",
            background: "#000",
          }}
        >
          <ZoomControl position="topright" />
          <ScaleControl position="bottomleft" />
          <FlyToSelectedProperty selectedProperty={selectedProperty} />
          <ImageOverlay url="/atlas/moon-atlas-v2.jpg" bounds={bounds} />

          {lunarMapRegions.map((region) => (
            <div key={region.name}>
              <Polygon
                key={`${region.name}-polygon`}
                positions={region.positions}
                pathOptions={{
                  color: "#facc15",
                  weight: 1,
                  opacity: 0.35,
                  fillOpacity: 0.03,
                }}
                eventHandlers={{
                   click: () => {
                   setSelectedState(region.name);
                   },
                  mouseover: (event) => {
                    event.target.setStyle({
                      opacity: 1,
                      weight: 3,
                      fillOpacity: 0.28,
                    });
                  },
                  mouseout: (event) => {
                    event.target.setStyle({
                      opacity: 0.35,
                      weight: 1,
                      fillOpacity: 0.03,
                    });
                  },
                }}
              >
                <Popup>
                  <div style={{ minWidth: "180px" }}>
                    <strong>{region.name}</strong>
                    <br />
                    <span>Orbital One Lunar State</span>
                    <br />
                    <br />
                    <a href={`/states/${encodeURIComponent(region.name)}`}>
                      View State Properties
                    </a>
                  </div>
                </Popup>
              </Polygon>

              <Marker
                key={`${region.name}-label`}
                position={region.labelPosition}
                icon={divIcon({
                  className: "",
                  html: `<div style="
                    color:#facc15;
                    font-weight:900;
                    font-size:12px;
                    letter-spacing:0.06em;
                    text-transform:uppercase;
                    text-shadow:0 2px 10px #000, 0 0 8px #000;
                    text-align:center;
                    white-space:nowrap;
                    opacity:0.72;
                    pointer-events:none;
                  ">${region.name}</div>`,
                })}
              />
            </div>
          ))}
          {selectedProperty?.mapX && selectedProperty?.mapY && (
  <Marker
    position={[selectedProperty.mapY, selectedProperty.mapX]}
    icon={selectedPropertyIcon}
  >
    <Popup>
      <div style={{ minWidth: "180px" }}>
        <strong>{selectedProperty.id}</strong>
        <br />
        {selectedProperty.type}
        <br />
        {selectedProperty.state}
        <br />
        Status: {selectedProperty.status}
        <br />
        <br />
        <a href={`/explore/${selectedProperty.id}`}>
          View Property Details
        </a>
      </div>
    </Popup>
  </Marker>
)}
        </MapContainer>
        </div>

        <div className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
            State Information
          </p>

          {selectedState ? (
            <>
              <h2 className="mt-4 text-3xl font-black text-yellow-400">
                {selectedState}
              </h2>

              <p className="mt-4 text-gray-300">
                Orbital One Lunar State
              </p>

              <div className="mt-6 space-y-3">
                <p>🌕 3 Cities</p>
                <p>🏘 20 Towns</p>
                <p>🚀 Rural Acreage Available</p>
              </div>

              <a
                href={`/states/${encodeURIComponent(selectedState)}`}
                className="mt-8 inline-block rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
              >
                Browse Properties
              </a>
            </>
          ) : (
            <div className="mt-6 text-gray-400">
              Click a lunar state on the map to view information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}