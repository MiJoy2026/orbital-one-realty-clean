"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, ImageOverlay, Rectangle, Popup } from "react-leaflet";
import { CRS } from "leaflet";

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
        <ImageOverlay
          url="/atlas/moon-atlas-v2.jpg"
          bounds={bounds}
        />
        <Rectangle
          bounds={[
           [555, 470],
           [690, 615],
        ]}
          pathOptions={{
           color: "#facc15",
           weight: 2,
           fillOpacity: 0.15,
        }}
      >
          <Popup>
         <div>
         <strong>Mare Serenitatis</strong>
         <br />
         <a href="/states/Mare%20Serenitatis">View State Properties</a>
        </div>
        </Popup>
        </Rectangle>

        <Rectangle
         bounds={[
         [520, 610],
         [665, 760],
        ]}
          pathOptions={{
         color: "#facc15",
         weight: 2,
         fillOpacity: 0.15,
        }}
>
         <Popup>
        <div>
        <strong>Mare Tranquillitatis</strong>
        <br />
         <a href="/states/Mare%20Tranquillitatis">View State Properties</a>
       </div>
       </Popup>
       </Rectangle>
      </MapContainer>
    </div>
  );
}