"use client";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  ImageOverlay,
  Polygon,
  Popup,
  Marker,
} from "react-leaflet";
import { CRS, divIcon } from "leaflet";
import { lunarMapRegions } from "@/lib/lunar-map-regions";

export default function LunarLeafletMap() {
  const bounds = [
    [0, 0],
    [1000, 1000],
  ] as [[number, number], [number, number]];

  return (
    <div className="mx-auto mt-10 h-[800px] w-full max-w-6xl overflow-hidden rounded-3xl border border-yellow-400/30">
      <MapContainer
        key="orbital-one-lunar-map"
        crs={CRS.Simple}
        center={[500, 500]}
        zoom={0}
        minZoom={-1}
        maxZoom={1}
        style={{
          height: "100%",
          width: "100%",
          background: "#000",
        }}
      >
        <ImageOverlay url="/atlas/moon-atlas-v2.jpg" bounds={bounds} />

        {lunarMapRegions.map((region) => (
        <div key={region.name}>
            <Polygon
              key={`${region.name}-polygon`}
              positions={region.positions}
              pathOptions={{
                color: "#facc15",
                weight: 1,
                opacity: 0,
                fillOpacity: 0,
              }}
              eventHandlers={{
                mouseover: (event) => {
                  event.target.setStyle({
                    opacity: 1,
                    weight: 2,
                    fillOpacity: 0.25,
                  });
                },
                mouseout: (event) => {
                  event.target.setStyle({
                    opacity: 0,
                    weight: 1,
                    fillOpacity: 0,
                  });
                },
              }}
            >
              <Popup>
                <div>
                  <strong>{region.name}</strong>
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
              font-weight:800;
              font-size:10px;
              letter-spacing:0.04em;
              text-transform:uppercase;
              text-shadow:0 2px 8px #000;
              text-align:center;
              white-space:nowrap;
              opacity:0.85;
            ">${region.name}</div>`,
              })}
            />
        </div>
        ))}
      </MapContainer>
    </div>
  );
}