"use client";

import { useEffect, useMemo, useState } from "react";
import { useMap } from "react-leaflet";

import CityBlockLayer from "@/components/moon-map/CityBlockLayer";
import type { CityBlockCell } from "@/lib/city-block-grid";

export default function VisibleCityBlockLayer({
  blocks,
  propertyStatuses,
  selectedBlockKey,
  onSelect,
}: {
  blocks: CityBlockCell[];
  propertyStatuses: Record<string, string>;
  selectedBlockKey?: string | null;
  onSelect: (block: CityBlockCell) => void;
}) {
  const map = useMap();
  const [viewportVersion, setViewportVersion] = useState(0);

  useEffect(() => {
    const updateViewport = () => {
      setViewportVersion((current) => current + 1);
    };

    map.on("moveend", updateViewport);
    map.on("zoomend", updateViewport);

    return () => {
      map.off("moveend", updateViewport);
      map.off("zoomend", updateViewport);
    };
  }, [map]);

  const visibleBlocks = useMemo(() => {
    const bounds = map.getBounds();

    return blocks.filter((block) =>
      bounds.intersects([
        [block.mapY, block.mapX],
        [block.mapY + block.height, block.mapX + block.width],
      ])
    );
  }, [blocks, map, viewportVersion]);

  return (
    <CityBlockLayer
      blocks={visibleBlocks}
      propertyStatuses={propertyStatuses}
      selectedBlockKey={selectedBlockKey}
      onSelect={onSelect}
    />
  );
}
