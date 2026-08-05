"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorPayoutCreateButtonProps = {
  creatorPartnerId: string;
  creatorName: string;
  availableBalanceCents: number;
  payoutThresholdCents: number;
  commissionCount: number;
};

type PayoutResponse = {
  error?: string;
  availableBalanceCents?: number;
  payoutThresholdCents?: number;
  commissionCount?: number;
  payout?: {
    id: string;
    amountCents: number;
    periodStart: string;
    periodEnd: string;
    status: string;
  };
};

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function CreatorPayoutCreateButton({
  creatorPartnerId,
  creatorName,
  availableBalanceCents,
  payoutThresholdCents,
  commissionCount,
}: CreatorPayoutCreateButtonProps) {
  const router = useRouter();

  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const thresholdReached =
    availableBalanceCents >= payoutThresholdCents;

  async function createPayout() {
    if (isCreating || !thresholdReached) {
      return;
    }

    const confirmed = window.confirm(
      `Create a pending payout of ${formatMoney(
        availableBalanceCents
      )} for ${creatorName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/admin/api/creator-payout-create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creatorPartnerId,
            notes: notes.trim(),
          }),
        }
      );

      const data = (await response.json()) as PayoutResponse;

      if (!response.ok) {
        const balanceDetails =
          typeof data.availableBalanceCents === "number" &&
          typeof data.payoutThresholdCents === "number"
            ? ` Available balance: ${formatMoney(
                data.availableBalanceCents
              )}. Required threshold: ${formatMoney(
                data.payoutThresholdCents
              )}.`
            : "";

        setErrorMessage(
          `${
            data.error ||
            "The Creator Partner payout could not be created."
          }${balanceDetails}`
        );

        return;
      }

      const payoutAmount = formatMoney(
        data.payout?.amountCents || availableBalanceCents
      );

      setSuccessMessage(
        `Pending payout created successfully for ${payoutAmount}.`
      );

      setNotes("");
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to create Creator Partner payout:",
        error
      );

      setErrorMessage(
        "The Creator Partner payout could not be created."
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (!thresholdReached) {
    return (
      <div>
        <p className="font-semibold text-yellow-300">
          Balance will carry forward until it reaches{" "}
          {formatMoney(payoutThresholdCents)}.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Current approved unpaid balance:{" "}
          {formatMoney(availableBalanceCents)} from{" "}
          {commissionCount} commission{" "}
          {commissionCount === 1 ? "record" : "records"}.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-64">
      {!showForm ? (
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-black text-black"
        >
          Create Pending Payout
        </button>
      ) : (
        <div className="space-y-3">
          <p className="font-semibold text-green-300">
            Create a payout for{" "}
            {formatMoney(availableBalanceCents)} from{" "}
            {commissionCount} commission{" "}
            {commissionCount === 1 ? "record" : "records"}.
          </p>

          <label className="block text-xs font-black uppercase text-gray-300">
            Optional payout notes
          </label>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            maxLength={1000}
            rows={4}
            disabled={isCreating}
            placeholder="Optional internal notes about this payout."
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-green-400"
          />

          <p className="text-right text-xs text-gray-500">
            {notes.length}/1000
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={createPayout}
              disabled={isCreating}
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating
                ? "Creating..."
                : "Confirm Payout Creation"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNotes("");
                setErrorMessage("");
              }}
              disabled={isCreating}
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              Cancel
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