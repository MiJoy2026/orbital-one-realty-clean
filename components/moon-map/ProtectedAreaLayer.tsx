"use client";

import { Fragment } from "react";

import { divIcon } from "leaflet";
import { Marker, Polygon } from "react-leaflet";

import type { PublicLunaSphereProtectedArea } from "@/lib/lunasphere-public-geography";

const CATEGORY_COLORS: Record<PublicLunaSphereProtectedArea["category"], string> = {
  "Historic Site": "#f43f5e",
  Landmark: "#a855f7",
  "Scientific Preserve": "#34d399",
  "Reserved Area": "#94a3b8",
};

export default function ProtectedAreaLayer({
  showProtectedAreas,
  zoomLevel,
  areas,
  selectedAreaId,
  onSelectArea,
}: {
  showProtectedAreas: boolean;
  zoomLevel: number;
  areas: PublicLunaSphereProtectedArea[];
  selectedAreaId: string | null;
  onSelectArea: (area: PublicLunaSphereProtectedArea) => void;
}) {
  if (!showProtectedAreas) {
    return null;
  }

  return (
    <>
      {areas
        .filter((area) => zoomLevel >= area.minZoom)
        .map((area) => {
          const isSelected = selectedAreaId === area.id;
          const color = CATEGORY_COLORS[area.category];

          return (
            <Fragment key={area.id}>
              <Polygon
                positions={area.boundary}
                pathOptions={{
                  color,
                  fillColor: color,
                  weight: isSelected ? 4 : 2,
                  opacity: isSelected ? 1 : 0.88,
                  fillOpacity: isSelected ? 0.36 : 0.2,
                  dashArray: area.category === "Reserved Area" ? "8 5" : undefined,
                }}
                eventHandlers={{
                  click: () => onSelectArea(area),
                  mouseover: (event) => {
                    event.target.setStyle({
                      opacity: 1,
                      weight: 4,
                      fillOpacity: 0.38,
                    });
                  },
                  mouseout: (event) => {
                    event.target.setStyle({
                      opacity: isSelected ? 1 : 0.88,
                      weight: isSelected ? 4 : 2,
                      fillOpacity: isSelected ? 0.36 : 0.2,
                    });
                  },
                }}
              />

              {zoomLevel >= Math.max(area.minZoom, 4) && (
                <Marker
                  position={area.center}
                  icon={divIcon({
                    className: "",
                    html: `<div style="
                      color:${color};
                      font-weight:900;
                      font-size:12px;
                      text-transform:uppercase;
                      text-shadow:0 0 8px #000,0 2px 10px #000;
                      white-space:nowrap;
                      pointer-events:none;
                    ">🛡 ${area.name}</div>`,
                  })}
                />
              )}
            </Fragment>
          );
        })}
    </>
  );
}
