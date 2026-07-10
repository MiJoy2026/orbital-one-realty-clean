"use client";

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
  onReserve,
  onExpired,
}: {
  selectedParcel: ParcelCell | null;
  selectedState: string | null;
  activeReservation: ActiveReservation | null;
  reservingParcel: boolean;
  onReserve: (parcel: ParcelCell) => void;
  onExpired: () => void;
}) {
  if (!selectedParcel) {
    return (
      <div className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
          Parcel Information
        </p>

        <div className="mt-6 text-gray-400">
          {selectedState
            ? "Click a green parcel to view its details."
            : "Select a lunar state, then choose a rural parcel."}
        </div>
      </div>
    );
  }

  const reservationMatches =
    activeReservation?.parcelKey === selectedParcel.parcelKey;

  return (
    <div className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
        Lunar Parcel
      </p>

      <h2 className="mt-4 break-words text-3xl font-black text-yellow-400">
        {selectedParcel.parcelKey}
      </h2>

      <div className="mt-6 space-y-3 text-gray-300">
        <p>
          <span className="font-bold text-gray-400">State:</span>{" "}
          {selectedParcel.stateName}
        </p>

        <p>
          <span className="font-bold text-gray-400">Property Type:</span>{" "}
          Rural Acre
        </p>

        <p>
          <span className="font-bold text-gray-400">Acreage:</span> 1 Acre
        </p>

        <p>
          <span className="font-bold text-gray-400">Price:</span>{" "}
          <span className="font-black text-yellow-400">$24.95</span>
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
        <p>📜 Personalized Novelty Lunar Deed</p>
        <p className="mt-2">🏛 Complimentary HOA Membership</p>
        <p className="mt-2">🌕 Permanent Orbital One Registry Record</p>
      </div>

      {reservationMatches && activeReservation ? (
        <div className="mt-6 rounded-2xl border border-yellow-400 bg-yellow-400/10 p-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
            Parcel Reserved
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
        </div>
      ) : (
        <button
          type="button"
          disabled={reservingParcel}
          onClick={() => onReserve(selectedParcel)}
          className="mt-6 w-full rounded-xl bg-yellow-400 px-5 py-3 font-black text-black disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
        >
          {reservingParcel ? "Reserving Parcel..." : "Reserve This Parcel"}
        </button>
      )}
    </div>
  );
}