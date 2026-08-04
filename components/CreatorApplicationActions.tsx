"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorApplicationActionsProps = {
  applicationId: string;
  currentStatus: string;
  hasPartner: boolean;
  initialReviewNotes?: string | null;
};

type ActionResponse = {
  error?: string;
  action?: string;
  partner?: {
    trackingCode: string;
  } | null;
};

export default function CreatorApplicationActions({
  applicationId,
  currentStatus,
  hasPartner,
  initialReviewNotes,
}: CreatorApplicationActionsProps) {
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState(initialReviewNotes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isApproved = currentStatus === "Approved" || hasPartner;
  const isRejected = currentStatus === "Rejected";

  async function updateApplication(action: "approve" | "reject") {
    if (isUpdating) {
      return;
    }

    const confirmed = window.confirm(
      action === "approve"
        ? "Approve this creator application and generate an active tracking code?"
        : "Reject this creator application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsUpdating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/admin/api/creator-application-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,
            action,
            reviewNotes,
          }),
        }
      );

      const data = (await response.json()) as ActionResponse;

      if (!response.ok) {
        setErrorMessage(
          data.error || "The creator application could not be updated."
        );
        return;
      }

      if (action === "approve") {
        setSuccessMessage(
          data.partner?.trackingCode
            ? `Approved. Tracking code: ${data.partner.trackingCode}`
            : "Creator application approved."
        );
      } else {
        setSuccessMessage("Creator application rejected.");
      }

      router.refresh();
    } catch (error) {
      console.error("Unable to update creator application:", error);
      setErrorMessage("The creator application could not be updated.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">
          Review notes
        </span>

        <textarea
          value={reviewNotes}
          onChange={(event) => setReviewNotes(event.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Optional private review notes"
          className="mt-2 w-full rounded-xl border border-white/20 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateApplication("approve")}
          disabled={isUpdating || isApproved}
          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : isApproved ? "Approved" : "Approve"}
        </button>

        <button
          type="button"
          onClick={() => updateApplication("reject")}
          disabled={isUpdating || isApproved || isRejected}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : isRejected ? "Rejected" : "Reject"}
        </button>
      </div>

      {successMessage && (
        <p className="text-sm font-semibold text-green-300">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="text-sm font-semibold text-red-300">
          {errorMessage}
        </p>
      )}
    </div>
  );
}