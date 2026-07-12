"use client";

import { TileLayer } from "react-leaflet";

const lunarBounds = [
  [0, 0],
  [1000, 1000],
] as [[number, number], [number, number]];

export default function LunarTileLayer() {
  return (
    <TileLayer
      url="/atlas/lroc-tiles/{z}/{x}/{y}.jpg?v=lroc-1"
      bounds={lunarBounds}
      minZoom={0}
      maxZoom={7}
      minNativeZoom={0}
      maxNativeZoom={5}
      tileSize={256}
      noWrap={true}
      keepBuffer={3}
      updateWhenZooming={false}
      updateWhenIdle={true}
      attribution="Lunar imagery: NASA/GSFC/Arizona State University"
    />
  );
}