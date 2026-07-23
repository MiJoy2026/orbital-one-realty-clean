"use client";

import { divIcon } from "leaflet";
import { Marker, Polygon } from "react-leaflet";

import type { PublicLunaSphereSettlement } from "@/lib/lunasphere-public-geography";

export default function TownLayer({
  showTowns,
  zoomLevel,
  towns,
  selectedTownId,
  onSelectTown,
}: {
  showTowns: boolean;
  zoomLevel: number;
  towns: PublicLunaSphereSettlement[];
  selectedTownId: string | null;
  onSelectTown: (town: PublicLunaSphereSettlement) => void;
}) {
  if (!showTowns || zoomLevel < 5) {
    return null;
  }

  return (
    <>
      {towns.map((town) => {
        const isSelected = selectedTownId === town.id;

        return (
          <div key={town.id}>
            <Polygon
              positions={town.boundary}
              pathOptions={{
                color: "#fbbf24",
                fillColor: "#d97706",
                weight: isSelected ? 3 : 1.5,
                opacity: isSelected ? 1 : 0.76,
                fillOpacity: isSelected ? 0.3 : 0.11,
              }}
              eventHandlers={{
                click: () => onSelectTown(town),
                mouseover: (event) => {
                  event.target.setStyle({
                    opacity: 1,
                    weight: 3,
                    fillOpacity: 0.3,
                  });
                },
                mouseout: (event) => {
                  event.target.setStyle({
                    opacity: isSelected ? 1 : 0.76,
                    weight: isSelected ? 3 : 1.5,
                    fillOpacity: isSelected ? 0.3 : 0.11,
                  });
                },
              }}
            />

            <Marker
              position={town.center}
              icon={divIcon({
                className: "",
                html: `<div style="
                  color:#fde68a;
                  font-weight:900;
                  font-size:11px;
                  text-transform:uppercase;
                  text-shadow:0 0 8px #000, 0 2px 10px #000;
                  white-space:nowrap;
                  pointer-events:none;
                ">🏘 ${town.name}</div>`,
              })}
            />
          </div>
        );
      })}
    </>
  );
}
