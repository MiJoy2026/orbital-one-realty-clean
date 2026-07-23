"use client";

import { divIcon } from "leaflet";
import { Marker, Polygon } from "react-leaflet";

import type { PublicLunaSphereSettlement } from "@/lib/lunasphere-public-geography";

export default function CityLayer({
  showCities,
  zoomLevel,
  cities,
  selectedCityId,
  onSelectCity,
}: {
  showCities: boolean;
  zoomLevel: number;
  cities: PublicLunaSphereSettlement[];
  selectedCityId: string | null;
  onSelectCity: (city: PublicLunaSphereSettlement) => void;
}) {
  if (!showCities || zoomLevel < 3) {
    return null;
  }

  return (
    <>
      {cities.map((city) => {
        const isSelected = selectedCityId === city.id;

        return (
          <div key={city.id}>
            <Polygon
              positions={city.boundary}
              pathOptions={{
                color: "#22d3ee",
                fillColor: "#0891b2",
                weight: isSelected ? 4 : 2,
                opacity: isSelected ? 1 : 0.78,
                fillOpacity: isSelected ? 0.28 : 0.12,
              }}
              eventHandlers={{
                click: () => onSelectCity(city),
                mouseover: (event) => {
                  event.target.setStyle({
                    opacity: 1,
                    weight: 4,
                    fillOpacity: 0.3,
                  });
                },
                mouseout: (event) => {
                  event.target.setStyle({
                    opacity: isSelected ? 1 : 0.78,
                    weight: isSelected ? 4 : 2,
                    fillOpacity: isSelected ? 0.28 : 0.12,
                  });
                },
              }}
            />

            <Marker
              position={city.center}
              icon={divIcon({
                className: "",
                html: `<div style="
                  color:#7dd3fc;
                  font-weight:900;
                  font-size:13px;
                  text-transform:uppercase;
                  text-shadow:0 0 8px #000, 0 2px 10px #000;
                  white-space:nowrap;
                  pointer-events:none;
                ">🏙 ${city.name}</div>`,
              })}
            />
          </div>
        );
      })}
    </>
  );
}
