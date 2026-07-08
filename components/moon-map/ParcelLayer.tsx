"use client";

import { Polygon, Popup } from "react-leaflet";
import { ParcelCell } from "@/lib/parcel-grid";

type ParcelStatus = "Available" | "Reserved" | "Sold";

interface ParcelLayerProps {
  parcels: ParcelCell[];
  parcelStatuses: Record<string, string>;
  onReserve: (parcel: ParcelCell) => void;
}

export default function ParcelLayer({
  parcels,
  parcelStatuses,
  onReserve,
}: ParcelLayerProps) {
  return (
    <>
      {parcels.map((parcel) => {
        const status =
          (parcelStatuses[parcel.parcelKey] as ParcelStatus) ?? "Available";

        const color =
          status === "Sold"
            ? "#dc2626"
            : status === "Reserved"
              ? "#3b82f6"
              : "#22c55e";

        return (
          <Polygon
            key={parcel.parcelKey}
            positions={[
              [parcel.mapY, parcel.mapX],
              [parcel.mapY, parcel.mapX + parcel.width],
              [parcel.mapY + parcel.height, parcel.mapX + parcel.width],
              [parcel.mapY + parcel.height, parcel.mapX],
            ]}
            pathOptions={{
              color,
              fillColor: color,
              weight: 1,
              opacity: 0.9,
              fillOpacity: 0.18,
            }}
            eventHandlers={{
              click: () => {
                if (status === "Available") {
                  onReserve(parcel);
                }
              },
            }}
          >
            <Popup>
              <div style={{ minWidth: 190 }}>
                <strong>{parcel.parcelKey}</strong>
                <br />
                {parcel.stateName} Rural Parcel
                <br />
                Status: {status}
                <br />
                <br />
                {status === "Available"
                  ? "Click to reserve this parcel."
                  : `This parcel is currently ${status.toLowerCase()}.`}
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}