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
              color,
              fillColor: color,
              weight: isSelected ? 4 : 1,
              opacity: 1,
              fillOpacity: isSelected ? 0.55 : 0.18,
            }}
            eventHandlers={{
             click: () => {
             if (!parcel.selectable) {
             return;
             }

               onSelect(parcel);
              },
            }}
          >
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
                {parcel.selectable ? (
                  "Click this parcel to view its details."
                ) : (
                  <>
                     Zoom in further to select individual rural acres.
                   <br />
                  <strong>Current level:</strong> Preview Grid
                 </>
                )}
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}