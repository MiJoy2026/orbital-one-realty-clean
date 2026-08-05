"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorCommissionStatusControlsProps = {
  commissionId: string;
  status: string;
  denialReason?: string | null;
};

type StatusResponse = {
  error?: string;
};

export default function CreatorCommissionStatusControls({
  commissionId,
  status,
  denialReason,
}: CreatorCommissionStatusControlsProps) {
  const router = useRouter();

  const [showReasonForm, setShowReasonForm] = useState(false);
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function updateStatus(
    action: "deny" | "restore"
  ) {
    if (isSaving) {
      return;
    }

    const trimmedReason = reason.trim();

    if (action === "deny" && !trimmedReason) {
      setErrorMessage(
        "Enter a reason before excluding this commission."
      );
      return;
    }

    if (
      action === "restore" &&
      !window.confirm(
        "Restore this commission to Pending status?"
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/admin/api/creator-commission-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commissionId,
            action,
            denialReason:
              action === "deny" ? trimmedReason : "",
          }),
        }
      );

      const data = (await response.json()) as StatusResponse;

      if (!response.ok) {
        setErrorMessage(
          data.error ||
            "The commission status could not be updated."
        );
        return;
      }

      if (action === "deny") {
        setSuccessMessage(
          "The commission was excluded from approval."
        );
        setShowReasonForm(false);
        setReason("");
      } else {
        setSuccessMessage(
          "The commission was restored to Pending status."
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Unable to update Creator commission status:",
        error
      );

      setErrorMessage(
        "The commission status could not be updated."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "Pending") {
    return (
      <div className="min-w-56">
        {!showReasonForm ? (
          <button
            type="button"
            onClick={() => {
              setShowReasonForm(true);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="rounded-lg border border-red-400 px-3 py-2 text-sm font-black text-red-300"
          >
            Exclude
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase text-gray-300">
              Exclusion reason
            </label>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              maxLength={500}
              rows={4}
              disabled={isSaving}
              placeholder="Refund, chargeback, cancellation, test order, fraud, or another non-qualifying transaction."
              className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-red-400"
            />

            <p className="text-right text-xs text-gray-500">
              {reason.length}/500
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateStatus("deny")}
                disabled={isSaving}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Excluding..."
                  : "Confirm Exclusion"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowReasonForm(false);
                  setReason("");
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

  if (status === "Denied") {
    return (
      <div className="min-w-56">
        {denialReason && (
          <p className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            <span className="font-black">Reason:</span>{" "}
            {denialReason}
          </p>
        )}

        <button
          type="button"
          onClick={() => updateStatus("restore")}
          disabled={isSaving}
          className="rounded-lg border border-green-400 px-3 py-2 text-sm font-black text-green-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Restoring..." : "Restore to Pending"}
        </button>

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

  return null;
}