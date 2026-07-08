"use client";

import { Polygon, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { lunarMapRegions } from "@/lib/lunar-map-regions";

export default function StateLayer({
  showStates,
  selectedState,
  onSelectState,
}: {
  showStates: boolean;
  selectedState: string | null;
  onSelectState: (stateName: string) => void;
}) {
  if (!showStates) {
    return null;
  }

  return (
    <>
      {lunarMapRegions.map((region) => (
        <div key={region.name}>
          <Polygon
            positions={region.positions}
            pathOptions={{
              color: "#facc15",
              weight: selectedState === region.name ? 3 : 1,
              opacity: selectedState === region.name ? 1 : 0.35,
              fillOpacity: selectedState === region.name ? 0.16 : 0.03,
            }}
            eventHandlers={{
              click: () => onSelectState(region.name),
              mouseover: (event) => {
                event.target.setStyle({
                  opacity: 1,
                  weight: 4,
                  fillOpacity: 0.3,
                });
              },
              mouseout: (event) => {
                event.target.setStyle({
                  opacity: selectedState === region.name ? 1 : 0.35,
                  weight: selectedState === region.name ? 3 : 1,
                  fillOpacity: selectedState === region.name ? 0.16 : 0.03,
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
    </>
  );
}