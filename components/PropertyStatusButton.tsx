"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PropertyStatusButtonProps = {
  propertyId: string;
  status: "Available" | "Sold";
};

export default function PropertyStatusButton({
  propertyId,
  status,
}: PropertyStatusButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function updateStatus() {
    if (isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);
      setErrorMessage("");

      const response = await fetch("/admin/api/property-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          status,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(
          data.error || "The property status could not be updated."
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Unable to update property status:", error);
      setErrorMessage("The property status could not be updated.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={updateStatus}
        disabled={isUpdating}
        className={`rounded-lg px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
          status === "Sold"
            ? "bg-red-600 text-white"
            : "bg-green-500 text-black"
        }`}
      >
        {isUpdating ? "Updating…" : `Mark ${status}`}
      </button>

      {errorMessage && (
        <p className="mt-2 max-w-xs text-xs font-semibold text-red-300">
          {errorMessage}
        </p>
      )}
    </div>
  );
}