"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorCommissionAdjustmentControlsProps = {
  commissionId: string;
  baseCommissionCents: number;
  currentAdjustmentCents: number;
  currentAdjustmentReason?: string | null;
  adjustedAt?: string | null;
};

type AdjustmentResponse = {
  error?: string;
  baseCommissionCents?: number;
  requestedAdjustmentCents?: number;
  finalCommissionCents?: number;
};

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

function parseDollarAmountToCents(
  value: string
): number | null {
  const trimmedValue = value.trim();

  if (!/^-?\d+(?:\.\d{1,2})?$/.test(trimmedValue)) {
    return null;
  }

  const isNegative = trimmedValue.startsWith("-");
  const unsignedValue = isNegative
    ? trimmedValue.slice(1)
    : trimmedValue;

  const [dollarText, centText = ""] =
    unsignedValue.split(".");

  const dollars = Number.parseInt(dollarText, 10);
  const cents = Number.parseInt(
    centText.padEnd(2, "0") || "0",
    10
  );

  const totalCents = dollars * 100 + cents;
  const signedCents = isNegative
    ? -totalCents
    : totalCents;

  return Number.isSafeInteger(signedCents)
    ? signedCents
    : null;
}

export default function CreatorCommissionAdjustmentControls({
  commissionId,
  baseCommissionCents,
  currentAdjustmentCents,
  currentAdjustmentReason,
  adjustedAt,
}: CreatorCommissionAdjustmentControlsProps) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [adjustmentValue, setAdjustmentValue] =
    useState(
      centsToInputValue(currentAdjustmentCents)
    );
  const [reason, setReason] = useState(
    currentAdjustmentReason || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const currentFinalCommissionCents =
    baseCommissionCents + currentAdjustmentCents;

  async function saveAdjustment() {
    if (isSaving) {
      return;
    }

    const adjustmentCents =
      parseDollarAmountToCents(adjustmentValue);

    const trimmedReason = reason.trim();

    if (adjustmentCents === null) {
      setErrorMessage(
        "Enter a valid dollar adjustment with no more than two decimal places."
      );
      return;
    }

    if (!trimmedReason) {
      setErrorMessage(
        "Enter a documented reason for this adjustment."
      );
      return;
    }

    if (
      baseCommissionCents + adjustmentCents <
      0
    ) {
      setErrorMessage(
        "The adjustment cannot reduce the final commission below $0.00."
      );
      return;
    }

    const confirmed = window.confirm(
      `Save an adjustment of ${formatMoney(
        adjustmentCents
      )}? The final commission will be ${formatMoney(
        baseCommissionCents + adjustmentCents
      )}.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/admin/api/creator-commission-adjustment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commissionId,
            adjustmentCents,
            adjustmentReason: trimmedReason,
          }),
        }
      );

      const data =
        (await response.json()) as AdjustmentResponse;

      if (!response.ok) {
        const negativeTotalDetails =
          typeof data.baseCommissionCents ===
            "number" &&
          typeof data.requestedAdjustmentCents ===
            "number"
            ? ` Base commission: ${formatMoney(
                data.baseCommissionCents
              )}. Requested adjustment: ${formatMoney(
                data.requestedAdjustmentCents
              )}.`
            : "";

        setErrorMessage(
          `${
            data.error ||
            "The commission adjustment could not be saved."
          }${negativeTotalDetails}`
        );

        return;
      }

      setSuccessMessage(
        `Adjustment saved. Final commission: ${formatMoney(
          data.finalCommissionCents ||
            baseCommissionCents +
              adjustmentCents
        )}.`
      );

      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to save Creator commission adjustment:",
        error
      );

      setErrorMessage(
        "The commission adjustment could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-w-64">
      <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
        <p>
          <span className="font-black text-gray-300">
            Base:
          </span>{" "}
          {formatMoney(baseCommissionCents)}
        </p>

        <p className="mt-1">
          <span className="font-black text-gray-300">
            Adjustment:
          </span>{" "}
          {formatMoney(currentAdjustmentCents)}
        </p>

        <p className="mt-1">
          <span className="font-black text-gray-300">
            Final:
          </span>{" "}
          {formatMoney(currentFinalCommissionCents)}
        </p>

        {currentAdjustmentReason && (
          <p className="mt-3 text-gray-400">
            <span className="font-black text-gray-300">
              Reason:
            </span>{" "}
            {currentAdjustmentReason}
          </p>
        )}

        {adjustedAt && (
          <p className="mt-2 text-xs text-gray-500">
            Last adjusted{" "}
            {new Date(adjustedAt).toLocaleString()}
          </p>
        )}
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => {
            setAdjustmentValue(
              centsToInputValue(
                currentAdjustmentCents
              )
            );
            setReason(
              currentAdjustmentReason || ""
            );
            setShowForm(true);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          className="mt-3 rounded-lg border border-yellow-400 px-3 py-2 text-sm font-black text-yellow-300"
        >
          Adjust Commission
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-gray-300">
              Adjustment amount
            </label>

            <input
              type="text"
              inputMode="decimal"
              value={adjustmentValue}
              onChange={(event) =>
                setAdjustmentValue(
                  event.target.value
                )
              }
              maxLength={15}
              disabled={isSaving}
              placeholder="Example: 5.00 or -2.50"
              className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
            />

            <p className="mt-1 text-xs text-gray-500">
              Use a negative number to reduce the
              commission.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-300">
              Adjustment reason
            </label>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              maxLength={1000}
              rows={4}
              disabled={isSaving}
              placeholder="Document why this commission is being adjusted."
              className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {reason.length}/1000
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveAdjustment}
              disabled={isSaving}
              className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : "Save Adjustment"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setAdjustmentValue(
                  centsToInputValue(
                    currentAdjustmentCents
                  )
                );
                setReason(
                  currentAdjustmentReason || ""
                );
                setErrorMessage("");
              }}
              disabled={isSaving}
              className="rounded-lg border border-white/30 px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
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