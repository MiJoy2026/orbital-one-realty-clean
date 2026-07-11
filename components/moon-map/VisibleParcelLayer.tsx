"use client";

import { useEffect, useMemo, useState } from "react";
import { useMap } from "react-leaflet";
import type { ParcelCell } from "@/lib/parcel-grid";
import ParcelLayer from "@/components/moon-map/ParcelLayer";

type VisibleParcelLayerProps = {
  parcels: ParcelCell[];
  parcelStatuses: Record<string, string>;
  selectedParcelKey?: string | null;
  onSelect: (parcel: ParcelCell) => void;
};

export default function VisibleParcelLayer({
  parcels,
  parcelStatuses,
  selectedParcelKey,
  onSelect,
}: VisibleParcelLayerProps) {
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

  const visibleParcels = useMemo(() => {
    const bounds = map.getBounds();

    return parcels.filter((parcel) => {
      const south = parcel.mapY;
      const north = parcel.mapY + parcel.height;
      const west = parcel.mapX;
      const east = parcel.mapX + parcel.width;

      return bounds.intersects([
        [south, west],
        [north, east],
      ]);
    });
  }, [map, parcels, viewportVersion]);

  return (
    <ParcelLayer
      parcels={visibleParcels}
      parcelStatuses={parcelStatuses}
      selectedParcelKey={selectedParcelKey}
      onSelect={onSelect}
    />
  );
}