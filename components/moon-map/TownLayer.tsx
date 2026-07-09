"use client";

import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";

interface Town {
  name: string;
  x: number;
  y: number;
}

export default function TownLayer({
  showTowns,
  zoomLevel,
  towns,
}: {
  showTowns: boolean;
  zoomLevel: number;
  towns: Town[];
}) {
  if (!showTowns || zoomLevel < 0) {
    return null;
  }

  return (
    <>
      {towns.map((town) => (
        <Marker
          key={`town-${town.name}`}
          position={[town.y, town.x]}
          icon={divIcon({
            className: "",
            html: `<div style="
              color:#fde68a;
              font-weight:800;
              font-size:11px;
              text-transform:uppercase;
              text-shadow:0 0 8px #000;
              white-space:nowrap;
            ">🏘 ${town.name}</div>`,
          })}
        >
          <Popup>
            <div style={{ minWidth: "160px" }}>
              <strong>{town.name}</strong>
              <br />
              Lunar Town
              <br />
              <br />
              <a href="/towns/${encodeURIComponent(town.name)}">
                View Town
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}