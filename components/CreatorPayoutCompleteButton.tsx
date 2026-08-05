"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorPayoutCompleteButtonProps = {
  payoutId: string;
  creatorName: string;
  amountCents: number;
  commissionCount: number;
};

type CompletionResponse = {
  error?: string;
  recordedAmountCents?: number;
  calculatedAmountCents?: number;
  paidAt?: string;
};

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function CreatorPayoutCompleteButton({
  payoutId,
  creatorName,
  amountCents,
  commissionCount,
}: CreatorPayoutCompleteButtonProps) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isCompleting, setIsCompleting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  async function completePayout() {
    if (isCompleting) {
      return;
    }

    const trimmedMethod = method.trim();
    const trimmedReference = reference.trim();

    if (!trimmedMethod) {
      setErrorMessage("Enter the payment method.");
      return;
    }

    if (!trimmedReference) {
      setErrorMessage(
        "Enter the payment confirmation or transaction reference."
      );
      return;
    }

    const confirmed = window.confirm(
      `Confirm that ${formatMoney(
        amountCents
      )} was paid to ${creatorName}? This will mark the payout and ${commissionCount} included commission ${
        commissionCount === 1 ? "record" : "records"
      } as Paid.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsCompleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/admin/api/creator-payout-complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payoutId,
            method: trimmedMethod,
            reference: trimmedReference,
            notes: notes.trim(),
          }),
        }
      );

      const data =
        (await response.json()) as CompletionResponse;

      if (!response.ok) {
        const mismatchDetails =
          typeof data.recordedAmountCents ===
            "number" &&
          typeof data.calculatedAmountCents ===
            "number"
            ? ` Recorded payout: ${formatMoney(
                data.recordedAmountCents
              )}. Included commissions: ${formatMoney(
                data.calculatedAmountCents
              )}.`
            : "";

        setErrorMessage(
          `${
            data.error ||
            "The Creator Partner payout could not be completed."
          }${mismatchDetails}`
        );

        return;
      }

      setSuccessMessage(
        `The ${formatMoney(
          amountCents
        )} payout was marked as paid successfully.`
      );

      setMethod("");
      setReference("");
      setNotes("");
      setShowForm(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Unable to complete Creator Partner payout:",
        error
      );

      setErrorMessage(
        "The Creator Partner payout could not be completed."
      );
    } finally {
      setIsCompleting(false);
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
          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-black text-black"
        >
          Record Payment
        </button>
      ) : (
        <div className="space-y-4">
          <p className="font-semibold text-green-300">
            Record payment of {formatMoney(amountCents)}{" "}
            to {creatorName}.
          </p>

          <div>
            <label className="block text-xs font-black uppercase text-gray-300">
              Payment method
            </label>

            <input
              type="text"
              value={method}
              onChange={(event) =>
                setMethod(event.target.value)
              }
              maxLength={100}
              disabled={isCompleting}
              placeholder="PayPal, bank transfer, check, etc."
              className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-green-400"
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {method.length}/100
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-300">
              Transaction reference
            </label>

            <input
              type="text"
              value={reference}
              onChange={(event) =>
                setReference(event.target.value)
              }
              maxLength={250}
              disabled={isCompleting}
              placeholder="Confirmation number, transaction ID, or check number."
              className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-green-400"
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {reference.length}/250
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-300">
              Optional completion notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              maxLength={1000}
              rows={4}
              disabled={isCompleting}
              placeholder="Optional internal notes about the completed payment."
              className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-green-400"
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {notes.length}/1000
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={completePayout}
              disabled={isCompleting}
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCompleting
                ? "Completing..."
                : "Confirm Payment"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setMethod("");
                setReference("");
                setNotes("");
                setErrorMessage("");
              }}
              disabled={isCompleting}
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