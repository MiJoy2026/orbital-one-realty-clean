"use client";

import { useState } from "react";

type Props = {
  orderId?: string;
  missingCount?: number;
};

type BackfillResult = {
  requestedOrderCount: number;
  existingSnapshotCount: number;
  createdSnapshotCount: number;
  failedSnapshotCount: number;
  failures: Array<{
    propertyId: string;
    reason: string;
  }>;
};

export default function PropertySnapshotAdminControls({
  orderId,
  missingCount = 0,
}: Props) {
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function generateSnapshots() {
    if (working) return;

    setWorking(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/admin/api/property-snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderId ? { orderId } : { limit: 100 }),
      });
      const data = (await response.json()) as {
        error?: string;
        result?: BackfillResult;
      };

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Snapshot generation failed.");
      }

      const result = data.result;
      const failureSummary = result.failures[0]
        ? ` First issue: ${result.failures[0].propertyId} — ${result.failures[0].reason}`
        : "";

      setMessage(
        `Created ${result.createdSnapshotCount}; already present ${result.existingSnapshotCount}; failed ${result.failedSnapshotCount}.${failureSummary}`
      );
      setIsError(result.failedSnapshotCount > 0);

      if (result.createdSnapshotCount > 0 && result.failedSnapshotCount === 0) {
        window.location.reload();
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Snapshot generation failed."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={generateSnapshots}
        disabled={working || (!orderId && missingCount === 0)}
        className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {working
          ? "Generating Property Images..."
          : orderId
            ? "Create Property Snapshot"
            : `Backfill Missing Images${missingCount ? ` (${missingCount})` : ""}`}
      </button>

      {message && (
        <p
          className={`mt-3 text-sm ${isError ? "text-red-300" : "text-green-300"}`}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
