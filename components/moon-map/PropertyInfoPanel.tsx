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
  <div className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6">
    <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
      Lunar Atlas
    </p>

    {selectedState ? (
      <>
        <h2 className="mt-4 text-3xl font-black text-yellow-400">
          {selectedState}
        </h2>

        {zoomLevel < 7 ? (
          <>
            <p className="mt-6 text-gray-300">
              You are exploring this lunar region.
            </p>

            <div className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-400/10 p-4">
              <p className="font-black text-blue-300">
                🔍 Zoom in further
              </p>

              <p className="mt-2 text-sm text-gray-300">
                Individual rural acres become available at the deepest zoom
                level.
              </p>

              <p className="mt-4 text-yellow-400">
                Current Zoom Level: {zoomLevel}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="mt-6 text-green-400 font-bold">
              🟢 Individual rural acres are now available.
            </p>

            <p className="mt-4 text-gray-300">
              Click any green parcel to view its details.
            </p>
          </>
        )}
      </>
    ) : (
      <>
        <p className="mt-6 text-gray-300">
          Welcome to the Orbital One Lunar Atlas.
        </p>

        <p className="mt-4 text-gray-400">
          Select one of the lunar states to begin exploring.
        </p>
      </>
    )}
  </div>
);
  }

  const reservationMatches =
    activeReservation?.parcelKey === selectedParcel.parcelKey;

  const parcelStatus = selectedParcelStatus || "Available";
  const canReserve = parcelStatus === "Available";
  const propertyType = selectedParcel.propertyType ?? "Rural Acre";
  const isCityBlock = propertyType === "City Block";
  const propertyPrice = selectedParcel.price ?? (isCityBlock ? 54.95 : 24.95);
  const sizeLabel = selectedParcel.sizeLabel ?? (isCityBlock ? "1 City Block" : "1 Acre");
  const propertyNoun = isCityBlock ? "City Block" : "Lunar Parcel";

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
    ? `Located in ${selectedParcel.cityName}, within ${selectedParcel.stateName}, approximately ${nearestAttraction.distanceKilometers.toFixed(
        0
      )} km ${nearestAttraction.direction} of ${nearestAttraction.name}.`
    : `Located in ${selectedParcel.cityName}, within the lunar state of ${selectedParcel.stateName}.`
  : nearestAttraction
    ? `Located in ${selectedParcel.stateName}, approximately ${nearestAttraction.distanceKilometers.toFixed(
        0
      )} km ${nearestAttraction.direction} of ${nearestAttraction.name}.`
    : `Located within the lunar state of ${selectedParcel.stateName}.`;

const landmarkProximityScore = nearestAttraction
  ? Math.max(
      1,
      Math.min(
        5,
        Math.round(5 - nearestAttraction.distanceKilometers / 500)
      )
    )
  : 3;

const landmarkStars =
  "★".repeat(landmarkProximityScore) +
  "☆".repeat(5 - landmarkProximityScore);

const parcelHighlights: string[] = [];

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

if (nearestAttraction?.state === selectedParcel.stateName) {
  parcelHighlights.push("Local State Landmark");
}

if (isCityBlock) {
  parcelHighlights.unshift(`Located in ${selectedParcel.cityName}`);
  parcelHighlights.push("Premium City Property");
}

parcelHighlights.push("Complimentary HOA Membership");

const whyThisParcel =
  parcelHighlights.length > 0
    ? `${parcelHighlights.slice(0, 3).join(", ")}.`
    : isCityBlock
      ? `A premium block within ${selectedParcel.cityName}.`
      : "A distinctive lunar parcel within the Orbital One atlas.";

  return (
    <div className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
        {propertyNoun}
      </p>

      <h2 className="mt-4 break-words text-3xl font-black text-yellow-400">
        {selectedParcel.parcelKey}
      </h2>

      <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
          Location Summary
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-300">
         {locationSummary}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
          Landmark Proximity
        </p>

        <p className="mt-3 text-2xl tracking-widest text-yellow-400">
          {landmarkStars}
        </p>

        <p className="mt-2 text-sm text-gray-300">
           {landmarkProximityScore >= 4
           ? "Excellent access to notable lunar landmarks."
           : landmarkProximityScore === 3
           ? "Good proximity to mapped lunar features."
           : "A quieter location farther from major mapped landmarks."}
        </p>

        <p className="mt-3 text-xs text-gray-500">
           This is an Orbital One novelty location rating based on approximate mapped
           distances.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
          Property Highlights
        </p>

        <div className="mt-4 space-y-2">
          {parcelHighlights.map((highlight) => (
          <div
            key={highlight}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
          >
           ⭐ {highlight}
          </div>
         ))}
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-purple-400/30 bg-purple-400/10 p-4">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">
          Why This Property?
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-300">
          {whyThisParcel}
        </p>

        <p className="mt-3 text-xs text-gray-500">
           Highlights are based on approximate atlas location and nearby mapped
           lunar features.
        </p>
      </div>

      <div className="mt-6 space-y-3 text-gray-300">
        <p>
          <span className="font-bold text-gray-400">State:</span>{" "}
          {selectedParcel.stateName}
        </p>

        <p>
          <span className="font-bold text-gray-400">Property Type:</span>{" "}
          {propertyType}
        </p>

        {isCityBlock && selectedParcel.cityName && (
          <p>
            <span className="font-bold text-gray-400">City:</span>{" "}
            {selectedParcel.cityName}
          </p>
        )}

        <p>
          <span className="font-bold text-gray-400">Size:</span>{" "}
          {sizeLabel}
        </p>

        <p>
          <span className="font-bold text-gray-400">Price:</span>{" "}
          <span className="font-black text-yellow-400">
            ${propertyPrice.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
  <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
    Terrain Overview
  </p>

  <p className="mt-3 text-sm text-gray-300">{terrainSummary}</p>

  {nearestAttraction && (
    <p className="mt-3 text-xs text-gray-500">
      Based on nearby mapped feature: {nearestAttraction.name}
    </p>
  )}
</div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
        <p>📜 Personalized Novelty Lunar Deed</p>
        <p className="mt-2">🏛 Complimentary HOA Membership</p>
        <p className="mt-2">🌕 Permanent Orbital One Registry Record</p>
      </div>
      <div className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-400/10 p-4">
  <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
    Nearby Lunar Attractions
  </p>

  <div className="mt-4 space-y-3">
    {nearbyAttractions.map((attraction) => (
      <a
        key={attraction.id}
        href={`/attractions/${attraction.id}`}
        className="block rounded-xl border border-white/10 bg-black/30 p-3 transition hover:border-blue-300"
      >
        <p className="font-black text-white">{attraction.name}</p>

        <p className="mt-1 text-xs uppercase text-gray-400">
          {attraction.type}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          {attraction.state === selectedParcel.stateName
            ? `Located within ${selectedParcel.stateName}`
            : `Located in ${attraction.state}`}
        </p>

        <p className="mt-2 text-sm text-blue-300">
            Approximately {attraction.distanceKilometers.toFixed(0)} km{" "}
          {attraction.direction}
        </p>

        <p className="mt-4 text-xs text-gray-500">
           Distances are approximate and will be refined as lunar coordinates are
           calibrated to the LROC imagery.
        </p>
      </a>
    ))}
  </div>
</div>

      {reservationMatches && activeReservation ? (
        <div className="mt-6 rounded-2xl border border-yellow-400 bg-yellow-400/10 p-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
            Property Reserved
          </p>

          <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
            Reservation Expires In
          </p>

          <ReservationCountdown
            expiresAt={activeReservation.expiresAt}
            onExpired={onExpired}
          />

          <a
            href={`/cart?reservationId=${activeReservation.reservationId}`}
            className="mt-5 block rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black"
          >
            Continue to Checkout
          </a>
          <button
           type="button"
           onClick={onCancelReservation}
           className="mt-3 w-full rounded-xl border border-red-500 px-5 py-3 font-black text-red-400 transition hover:bg-red-500 hover:text-white"
          >
           Cancel Reservation
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={reservingParcel || !canReserve}
          onClick={() => onReserve(selectedParcel)}
          className="mt-6 w-full rounded-xl bg-yellow-400 px-5 py-3 font-black text-black disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
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
    </div>
  );
}