"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorPayoutCancelButtonProps = {
  payoutId: string;
  creatorName: string;
  amountCents: number;
  commissionCount: number;
};

type CancellationResponse = {
  error?: string;
  alreadyCancelled?: boolean;
};

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function CreatorPayoutCancelButton({
  payoutId,
  creatorName,
  amountCents,
  commissionCount,
}: CreatorPayoutCancelButtonProps) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [isCancelling, setIsCancelling] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  async function cancelPayout() {
    if (isCancelling) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setErrorMessage(
        "Enter a reason before cancelling this payout."
      );
      return;
    }

    const confirmed = window.confirm(
      `Cancel the pending ${formatMoney(
        amountCents
      )} payout for ${creatorName}? This will release ${commissionCount} commission ${
        commissionCount === 1 ? "record" : "records"
      } back to Approved status.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsCancelling(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/admin/api/creator-payout-cancel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payoutId,
            cancellationReason: trimmedReason,
          }),
        }
      );

      const data =
        (await response.json()) as CancellationResponse;

      if (!response.ok) {
        setErrorMessage(
          data.error ||
            "The Creator Partner payout could not be cancelled."
        );
        return;
      }

      setSuccessMessage(
        data.alreadyCancelled
          ? "This payout was already cancelled."
          : "The payout was cancelled and its commissions were released back to Approved status."
      );

      setReason("");
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to cancel Creator Partner payout:",
        error
      );

      setErrorMessage(
        "The Creator Partner payout could not be cancelled."
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="min-w-72">
      {!showForm ? (
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          className="rounded-lg border border-red-400 px-4 py-2 text-sm font-black text-red-300"
        >
          Cancel Payout
        </button>
      ) : (
        <div className="space-y-3">
          <p className="font-semibold text-red-300">
            Cancel the pending payout of{" "}
            {formatMoney(amountCents)} for {creatorName}.
          </p>

          <label className="block text-xs font-black uppercase text-gray-300">
            Cancellation reason
          </label>

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            maxLength={1000}
            rows={4}
            disabled={isCancelling}
            placeholder="Explain why this pending payout is being cancelled."
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-red-400"
          />

          <p className="text-right text-xs text-gray-500">
            {reason.length}/1000
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cancelPayout}
              disabled={isCancelling}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCancelling
                ? "Cancelling..."
                : "Confirm Cancellation"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setReason("");
                setErrorMessage("");
              }}
              disabled={isCancelling}
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              Keep Payout
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <p className="mt-3 text-sm font-semibold text-green-300">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="mt-3 text-sm font-semibold text-red-300">
          {errorMessage}
        </p>
      )}
    </div>
  );
}