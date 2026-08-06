"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorPartnerStatusControlsProps = {
  creatorPartnerId: string;
  creatorName: string;
  status: string;
};

type StatusAction =
  | "suspend"
  | "reactivate"
  | "terminate";

type StatusResponse = {
  error?: string;
  status?: string;
  alreadyUpdated?: boolean;
};

function actionLabel(action: StatusAction): string {
  if (action === "suspend") {
    return "Suspend";
  }

  if (action === "reactivate") {
    return "Reactivate";
  }

  return "Terminate";
}

export default function CreatorPartnerStatusControls({
  creatorPartnerId,
  creatorName,
  status,
}: CreatorPartnerStatusControlsProps) {
  const router = useRouter();

  const [selectedAction, setSelectedAction] =
    useState<StatusAction | null>(null);

  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  async function updateStatus() {
    if (!selectedAction || isSaving) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setErrorMessage(
        "Enter a documented reason for this status change."
      );
      return;
    }

    const label = actionLabel(selectedAction);

    const confirmationMessage =
      selectedAction === "terminate"
        ? `Terminate ${creatorName} as a Creator Partner? Terminated accounts cannot be reactivated through this control.`
        : `${label} ${creatorName}'s Creator Partner account?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/admin/api/creator-partner-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creatorPartnerId,
            action: selectedAction,
            reason: trimmedReason,
          }),
        }
      );

      const data =
        (await response.json()) as StatusResponse;

      if (!response.ok) {
        setErrorMessage(
          data.error ||
            "The Creator Partner status could not be updated."
        );
        return;
      }

      setSuccessMessage(
        data.alreadyUpdated
          ? `This Creator Partner was already ${data.status}.`
          : `Creator Partner status changed to ${data.status}.`
      );

      setSelectedAction(null);
      setReason("");
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to update Creator Partner status:",
        error
      );

      setErrorMessage(
        "The Creator Partner status could not be updated."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function beginAction(action: StatusAction) {
    setSelectedAction(action);
    setReason("");
    setErrorMessage("");
    setSuccessMessage("");
  }

  function cancelAction() {
    setSelectedAction(null);
    setReason("");
    setErrorMessage("");
  }

  if (status === "Terminated") {
    return (
      <div className="min-w-64">
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm font-semibold text-red-200">
          This Creator Partner account is permanently
          terminated. Existing referral, commission, and
          payout history remains preserved.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-64">
      {!selectedAction ? (
        <div className="flex flex-wrap gap-2">
          {status === "Active" && (
            <button
              type="button"
              onClick={() => beginAction("suspend")}
              className="rounded-lg border border-yellow-400 px-3 py-2 text-sm font-black text-yellow-300"
            >
              Suspend
            </button>
          )}

          {status === "Suspended" && (
            <button
              type="button"
              onClick={() => beginAction("reactivate")}
              className="rounded-lg border border-green-400 px-3 py-2 text-sm font-black text-green-300"
            >
              Reactivate
            </button>
          )}

          {(status === "Active" ||
            status === "Suspended") && (
            <button
              type="button"
              onClick={() => beginAction("terminate")}
              className="rounded-lg border border-red-400 px-3 py-2 text-sm font-black text-red-300"
            >
              Terminate
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p
            className={`font-semibold ${
              selectedAction === "terminate"
                ? "text-red-300"
                : selectedAction === "reactivate"
                  ? "text-green-300"
                  : "text-yellow-300"
            }`}
          >
            {actionLabel(selectedAction)} the Creator
            Partner account for {creatorName}.
          </p>

          <label className="block text-xs font-black uppercase text-gray-300">
            Status-change reason
          </label>

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            maxLength={1000}
            rows={4}
            disabled={isSaving}
            placeholder="Document why this account status is being changed."
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          />

          <p className="text-right text-xs text-gray-500">
            {reason.length}/1000
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={updateStatus}
              disabled={isSaving}
              className={`rounded-lg px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60 ${
                selectedAction === "terminate"
                  ? "bg-red-500 text-white"
                  : selectedAction === "reactivate"
                    ? "bg-green-500 text-black"
                    : "bg-yellow-400 text-black"
              }`}
            >
              {isSaving
                ? "Saving..."
                : `Confirm ${actionLabel(
                    selectedAction
                  )}`}
            </button>

            <button
              type="button"
              onClick={cancelAction}
              disabled={isSaving}
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