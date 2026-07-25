"use client";

import { useState } from "react";

type LunaScapeShareActionsProps = {
  imagePath: string;
  propertyId: string;
};

export default function LunaScapeShareActions({
  imagePath,
  propertyId,
}: LunaScapeShareActionsProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">(
    "idle"
  );

  function fullImageUrl(): string {
    return new URL(imagePath, window.location.origin).toString();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullImageUrl());
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  async function sharePostcard() {
    const url = fullImageUrl();

    try {
      if (navigator.share) {
        await navigator.share({
          title: `My LunaScape Property — ${propertyId}`,
          text: `Take a look at my LunaScape property postcard from Orbital One Realty: ${propertyId}`,
          url,
        });
        setStatus("shared");
        return;
      }

      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setStatus("error");
    }
  }

  const message =
    status === "copied"
      ? "Postcard link copied"
      : status === "shared"
      ? "Share menu opened"
      : status === "error"
      ? "Unable to share on this device"
      : "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={sharePostcard}
        className="rounded-xl border border-yellow-400/70 px-4 py-2 text-sm font-black text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
      >
        Share Postcard
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-xl border border-white/25 px-4 py-2 text-sm font-black text-white transition hover:border-white/60"
      >
        Copy Link
      </button>
      {message && (
        <span
          className={`text-xs font-bold ${
            status === "error" ? "text-red-300" : "text-green-300"
          }`}
          aria-live="polite"
        >
          {message}
        </span>
      )}
    </div>
  );
}
