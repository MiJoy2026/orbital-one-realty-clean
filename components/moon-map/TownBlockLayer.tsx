"use client";

import { Polygon, Popup } from "react-leaflet";

import type { TownBlockCell } from "@/lib/town-block-grid";

type PropertyStatus = "Available" | "Reserved" | "Sold";

export default function TownBlockLayer({
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
  return (
    <>
      {blocks.map((block) => {
        const status =
          (propertyStatuses[block.parcelKey] as PropertyStatus) ||
          "Available";
        const isSelected = selectedBlockKey === block.parcelKey;
        const color = isSelected
          ? "#facc15"
          : status === "Sold"
            ? "#dc2626"
            : status === "Reserved"
              ? "#3b82f6"
              : "#22c55e";

        return (
          <Polygon
            key={`${block.parcelKey}-${isSelected ? "selected" : "normal"}`}
            positions={block.positions}
            pathOptions={{
              color: block.selectable ? color : "#fbbf24",
              fillColor: block.selectable ? color : "#d97706",
              weight: isSelected ? 4 : block.selectable ? 1.4 : 0.8,
              opacity: block.selectable ? 1 : 0.65,
              fillOpacity: isSelected
                ? 0.58
                : block.selectable
                  ? 0.24
                  : 0.08,
            }}
            eventHandlers={{
              click: () => {
                if (block.selectable) {
                  onSelect(block);
                }
              },
            }}
          >
            {block.selectable && (
              <Popup>
                <div style={{ minWidth: 210 }}>
                  <strong>{block.parcelKey}</strong>

                  {isSelected && (
                    <>
                      <br />
                      <span
                        style={{
                          color: "#ca8a04",
                          fontWeight: 900,
                        }}
                      >
                        ⭐ Selected Town Block
                      </span>
                    </>
                  )}

                  <br />
                  {block.townName} · {block.stateName}
                  <br />
                  Status: {status}
                  <br />
                  Price: $39.95
                  <br />
                  <br />
                  Click this block to view its details.
                </div>
              </Popup>
            )}
          </Polygon>
        );
      })}
    </>
  );
}
