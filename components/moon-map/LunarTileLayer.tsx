"use client";

import { TileLayer } from "react-leaflet";

const lunarBounds = [
  [0, 0],
  [1000, 1000],
] as [[number, number], [number, number]];

export default function LunarTileLayer() {
  return (
    <TileLayer
  url="/atlas/lroc-tiles-v2/{z}/{x}/{y}.jpg?v=lroc-v2"
  bounds={lunarBounds}
  minZoom={0}
  maxZoom={7}
  minNativeZoom={0}
  maxNativeZoom={7}
  tileSize={256}
  noWrap={true}
  keepBuffer={2}
  updateWhenZooming={false}
  updateWhenIdle={true}
  updateInterval={150}
  attribution="Lunar imagery: NASA/GSFC/Arizona State University"
/>
  );
}