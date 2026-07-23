"use client";

import { getNearbyLunarAttractions } from "@/lib/lunar-attractions";
import type { ParcelCell } from "@/lib/parcel-grid";
import ReservationCountdown from "@/components/moon-map/ReservationCountdown";

type ActiveReservation = {
  reservationId: string;
  parcelKey: string;
  expiresAt: string;
};

export default function PropertyInfoPanel({
  selectedParcel,
  selectedState,
  activeReservation,
  reservingParcel,
  zoomLevel,
  selectedParcelStatus,
  onReserve,
  onExpired,
  onCancelReservation,
}: {
  selectedParcel: ParcelCell | null;
  selectedState: string | null;
  activeReservation: ActiveReservation | null;
  reservingParcel: boolean;
  zoomLevel: number;
  selectedParcelStatus: string;
  onReserve: (parcel: ParcelCell) => void;
  onExpired: () => void;
  onCancelReservation: () => void;
}) {
  if (!selectedParcel) {
    return (
      <aside className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6 lg:h-full lg:overflow-y-auto">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
          Lunar Atlas
        </p>

        {selectedState ? (
          <>
            <h2 className="mt-4 text-3xl font-black text-yellow-400">
              {selectedState}
            </h2>

            {zoomLevel < 7 ? (
              <div className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-400/10 p-4">
                <p className="font-black text-blue-300">🔍 Zoom in further</p>
                <p className="mt-2 text-sm text-gray-300">
                  Individual properties become selectable at the deepest zoom
                  level.
                </p>
                <p className="mt-4 text-yellow-400">
                  Current Zoom Level: {zoomLevel}
                </p>
              </div>
            ) : (
              <p className="mt-6 font-bold text-green-400">
                🟢 Select any available property on the map.
              </p>
            )}
          </>
        ) : (
          <p className="mt-6 text-gray-400">
            Select a lunar state to begin exploring.
          </p>
        )}
      </aside>
    );
  }

  const reservationMatches =
    activeReservation?.parcelKey === selectedParcel.parcelKey;
  const parcelStatus = selectedParcelStatus || "Available";
  const canReserve = parcelStatus === "Available";
  const propertyType = selectedParcel.propertyType ?? "Rural Acre";
  const isCityBlock = propertyType === "City Block";
  const isTownBlock = propertyType === "Town Block";
  const propertyPrice =
    selectedParcel.price ??
    (isCityBlock ? 54.95 : isTownBlock ? 39.95 : 24.95);
  const sizeLabel =
    selectedParcel.sizeLabel ??
    (isCityBlock ? "1 City Block" : isTownBlock ? "1 Town Block" : "1 Acre");
  const propertyNoun = isCityBlock
    ? "City Block"
    : isTownBlock
      ? "Town Block"
      : "Rural Acre";

  const nearbyAttractions = getNearbyLunarAttractions(
    selectedParcel.centerX,
    selectedParcel.centerY,
    3
  );
  const nearestAttraction = nearbyAttractions[0];

  const terrainSummary =
    nearestAttraction?.type === "Lunar Mare"
      ? "Broad, relatively smooth basalt plains."
      : nearestAttraction?.type === "Crater"
        ? "Cratered terrain with nearby impact formations."
        : nearestAttraction?.type === "Mountain Range"
          ? "Elevated terrain near prominent lunar mountains."
          : nearestAttraction?.type === "Landing Site"
            ? "Historic lunar terrain near a human landing site."
            : "Mixed lunar terrain with nearby natural features.";

  const locationSummary = isCityBlock
    ? nearestAttraction
      ? `Located in ${selectedParcel.cityName}, within ${selectedParcel.stateName}, approximately ${nearestAttraction.distanceKilometers.toFixed(0)} km ${nearestAttraction.direction} of ${nearestAttraction.name}.`
      : `Located in ${selectedParcel.cityName}, within the lunar state of ${selectedParcel.stateName}.`
    : isTownBlock
      ? nearestAttraction
        ? `Located in ${selectedParcel.townName}, within ${selectedParcel.stateName}, approximately ${nearestAttraction.distanceKilometers.toFixed(0)} km ${nearestAttraction.direction} of ${nearestAttraction.name}.`
        : `Located in ${selectedParcel.townName}, within the lunar state of ${selectedParcel.stateName}.`
      : nearestAttraction
        ? `Located in ${selectedParcel.stateName}, approximately ${nearestAttraction.distanceKilometers.toFixed(0)} km ${nearestAttraction.direction} of ${nearestAttraction.name}.`
        : `Located within the lunar state of ${selectedParcel.stateName}.`;

  const landmarkProximityScore = nearestAttraction
    ? Math.max(
        1,
        Math.min(5, Math.round(5 - nearestAttraction.distanceKilometers / 500))
      )
    : 3;
  const landmarkStars =
    "★".repeat(landmarkProximityScore) +
    "☆".repeat(5 - landmarkProximityScore);

  const parcelHighlights: string[] = [];
  if (isCityBlock) {
    parcelHighlights.push(`Located in ${selectedParcel.cityName}`);
    parcelHighlights.push("Premium City Property");
  }
  if (isTownBlock) {
    parcelHighlights.push(`Located in ${selectedParcel.townName}`);
    parcelHighlights.push("Community Town Property");
  }
  if (nearestAttraction) {
    parcelHighlights.push(`Near ${nearestAttraction.name}`);
  }
  if (nearestAttraction?.type === "Landing Site") {
    parcelHighlights.push("Historic Landing Region");
  }
  if (nearestAttraction?.type === "Lunar Mare") {
    parcelHighlights.push("Smooth Mare Terrain");
  }
  if (nearestAttraction?.type === "Mountain Range") {
    parcelHighlights.push("Mountainous Region");
  }
  if (nearestAttraction?.type === "Crater") {
    parcelHighlights.push("Prominent Crater Views");
  }
  if (landmarkProximityScore >= 4) {
    parcelHighlights.push("Excellent Landmark Access");
  }
  parcelHighlights.push("Complimentary HOA Membership");

  const locationName = isCityBlock
    ? selectedParcel.cityName
    : isTownBlock
      ? selectedParcel.townName
      : selectedParcel.stateName;

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-yellow-400/30 bg-black/85 shadow-2xl lg:h-full">
      <header className="shrink-0 border-b border-white/10 bg-black/95 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
              Selected {propertyNoun}
            </p>
            <h2 className="mt-2 break-all text-xl font-black text-white">
              {selectedParcel.parcelKey}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {locationName} · {selectedParcel.stateName}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${
              parcelStatus === "Sold"
                ? "border-red-400/50 bg-red-400/10 text-red-300"
                : parcelStatus === "Reserved"
                  ? "border-blue-400/50 bg-blue-400/10 text-blue-300"
                  : "border-green-400/50 bg-green-400/10 text-green-300"
            }`}
          >
            {parcelStatus}
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Property Type
            </p>
            <p className="mt-2 font-black text-white">{propertyType}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Size
            </p>
            <p className="mt-2 font-black text-white">{sizeLabel}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
            Location Summary
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-200">
            {locationSummary}
          </p>
        </section>

        <section>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            Highlights
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {parcelHighlights.slice(0, 5).map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-100"
              >
                {highlight}
              </span>
            ))}
          </div>
        </section>

        <details className="group rounded-2xl border border-white/10 bg-white/5">
          <summary className="cursor-pointer list-none px-4 py-4 font-black text-white">
            <span className="flex items-center justify-between gap-3">
              Property and terrain details
              <span className="text-yellow-400 transition group-open:rotate-180">⌄</span>
            </span>
          </summary>
          <div className="space-y-4 border-t border-white/10 px-4 py-4 text-sm text-gray-300">
            <div className="grid gap-2">
              <p><span className="font-bold text-gray-500">State:</span> {selectedParcel.stateName}</p>
              {isCityBlock && selectedParcel.cityName && (
                <p><span className="font-bold text-gray-500">City:</span> {selectedParcel.cityName}</p>
              )}
              {isTownBlock && selectedParcel.townName && (
                <p><span className="font-bold text-gray-500">Town:</span> {selectedParcel.townName}</p>
              )}
              <p><span className="font-bold text-gray-500">Terrain:</span> {terrainSummary}</p>
              <p>
                <span className="font-bold text-gray-500">Landmark proximity:</span>{" "}
                <span className="tracking-widest text-yellow-400">{landmarkStars}</span>
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p>📜 Personalized Novelty Lunar Deed</p>
              <p className="mt-2">🏛 Complimentary HOA Membership</p>
              <p className="mt-2">🌕 Permanent Orbital One Registry Record</p>
            </div>
          </div>
        </details>

        {nearbyAttractions.length > 0 && (
          <details className="group rounded-2xl border border-blue-400/20 bg-blue-400/5">
            <summary className="cursor-pointer list-none px-4 py-4 font-black text-blue-200">
              <span className="flex items-center justify-between gap-3">
                Nearby lunar attractions
                <span className="transition group-open:rotate-180">⌄</span>
              </span>
            </summary>
            <div className="space-y-3 border-t border-blue-400/20 px-4 py-4">
              {nearbyAttractions.map((attraction) => (
                <a
                  key={attraction.id}
                  href={`/attractions/${attraction.id}`}
                  className="block rounded-xl border border-white/10 bg-black/30 p-3 transition hover:border-blue-300"
                >
                  <p className="font-black text-white">{attraction.name}</p>
                  <p className="mt-1 text-xs uppercase text-gray-500">
                    {attraction.type}
                  </p>
                  <p className="mt-2 text-sm text-blue-300">
                    Approximately {attraction.distanceKilometers.toFixed(0)} km{" "}
                    {attraction.direction}
                  </p>
                </a>
              ))}
            </div>
          </details>
        )}
      </div>

      <footer className="shrink-0 border-t border-yellow-400/25 bg-zinc-950 px-5 py-4 shadow-[0_-14px_30px_rgba(0,0,0,0.65)]">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Purchase Price
            </p>
            <p className="mt-1 text-3xl font-black text-yellow-400">
              ${propertyPrice.toFixed(2)}
            </p>
          </div>
          <p className="text-right text-xs text-gray-500">
            Includes deed and HOA membership
          </p>
        </div>

        {reservationMatches && activeReservation ? (
          <div className="rounded-2xl border border-yellow-400/50 bg-yellow-400/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
                Reserved
              </p>
              <ReservationCountdown
                expiresAt={activeReservation.expiresAt}
                onExpired={onExpired}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href="/cart"
                className="rounded-xl bg-yellow-400 px-3 py-3 text-center text-sm font-black text-black"
              >
                View Cart
              </a>
              <button
                type="button"
                onClick={onCancelReservation}
                className="rounded-xl border border-red-500 px-3 py-3 text-sm font-black text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={reservingParcel || !canReserve}
            onClick={() => onReserve(selectedParcel)}
            className="w-full rounded-xl bg-yellow-400 px-5 py-4 text-base font-black text-black shadow-lg shadow-yellow-400/10 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          >
            {reservingParcel
              ? "Reserving Property..."
              : parcelStatus === "Sold"
                ? "Property Sold"
                : parcelStatus === "Reserved"
                  ? "Property Reserved"
                  : `Reserve This ${propertyType}`}
          </button>
        )}
      </footer>
    </aside>
  );
}
