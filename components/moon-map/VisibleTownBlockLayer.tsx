"use client";

import { useEffect, useMemo, useState } from "react";
import { useMap } from "react-leaflet";

import TownBlockLayer from "@/components/moon-map/TownBlockLayer";
import type { TownBlockCell } from "@/lib/town-block-grid";

export default function VisibleTownBlockLayer({
  blocks,
  propertyStatuses,
  selectedBlockKey,
  onSelect,
}: {
  blocks: TownBlockCell[];
  propertyStatuses: Record<string, string>;
  selectedBlockKey?: string | null;
  onSelect: (block: TownBlockCell) => void;
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
    <TownBlockLayer
      blocks={visibleBlocks}
      propertyStatuses={propertyStatuses}
      selectedBlockKey={selectedBlockKey}
      onSelect={onSelect}
    />
  );
}
