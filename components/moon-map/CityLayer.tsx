"use client";

import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";

interface City {
  name: string;
  x: number;
  y: number;
}

interface CityLayerProps {
  showCities: boolean;
  zoomLevel: number;
  cities: City[];
}

export default function CityLayer({
  showCities,
  zoomLevel,
  cities,
}: CityLayerProps) {
  if (!showCities || zoomLevel < 0) {
    return null;
  }

  return (
    <>
      {cities.map((city) => (
        <Marker
          key={`city-${city.name}`}
          position={[city.y, city.x]}
          icon={divIcon({
            className: "",
            html: `<div style="
              color:#7dd3fc;
              font-weight:800;
              font-size:13px;
              text-transform:uppercase;
              text-shadow:0 0 8px #000;
              white-space:nowrap;
            ">🏙 ${city.name}</div>`,
          })}
        >
          <Popup>
            <div style={{ minWidth: "160px" }}>
              <strong>{city.name}</strong>
              <br />
              Lunar City
              <br />
              <br />
              <a href="/cities/${encodeURIComponent(city.name)}">
                View City
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}