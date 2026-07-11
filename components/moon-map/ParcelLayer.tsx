"use client";

import type { ParcelCell } from "@/lib/parcel-grid";
import { Polygon, Popup } from "react-leaflet";

type ParcelStatus = "Available" | "Reserved" | "Sold";

interface ParcelLayerProps {
  parcels: ParcelCell[];
  parcelStatuses: Record<string, string>;
  selectedParcelKey?: string | null;
  onSelect: (parcel: ParcelCell) => void;
}

export default function ParcelLayer({
  parcels,
  parcelStatuses,
  selectedParcelKey,
  onSelect,
}: ParcelLayerProps) {
  return (
    <>
      {parcels.map((parcel) => {
        const status =
          (parcelStatuses[parcel.parcelKey] as ParcelStatus) || "Available";

        const isSelected = selectedParcelKey === parcel.parcelKey;

        const color = isSelected
          ? "#facc15"
          : status === "Sold"
            ? "#dc2626"
            : status === "Reserved"
              ? "#3b82f6"
              : "#22c55e";

        return (
          <Polygon
            key={`${parcel.parcelKey}-${isSelected ? "selected" : "normal"}`}
            positions={[
              [parcel.mapY, parcel.mapX],
              [parcel.mapY, parcel.mapX + parcel.width],
              [parcel.mapY + parcel.height, parcel.mapX + parcel.width],
              [parcel.mapY + parcel.height, parcel.mapX],
            ]}
            pathOptions={{
               color: parcel.selectable ? color : "#94a3b8",
               fillColor: parcel.selectable ? color : "#64748b",
               weight: isSelected ? 4 : parcel.selectable ? 1 : 0.6,
               opacity: parcel.selectable ? 1 : 0.45,
               fillOpacity: isSelected ? 0.55 : parcel.selectable ? 0.18 : 0.05,
            }}
            eventHandlers={{
                click: () => {
                if (parcel.selectable) {
                onSelect(parcel);
               }
              },
            }}
          >
            {parcel.selectable && (
  <Popup>
    <div style={{ minWidth: 190 }}>
      <strong>{parcel.parcelKey}</strong>

      {isSelected && (
        <>
          <br />
          <span
            style={{
              color: "#ca8a04",
              fontWeight: 900,
            }}
          >
            ⭐ Selected Parcel
          </span>
        </>
      )}

      <br />
      {parcel.stateName} Rural Parcel
      <br />
      Status: {status}
      <br />
      <br />
      Click this parcel to view its details.
    </div>
  </Popup>
)}
          </Polygon>
        );
      })}
    </>
  );
}