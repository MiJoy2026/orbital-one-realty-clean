"use client";

import { useRouter } from "next/navigation";

type PropertyStatusButtonProps = {
  propertyId: string;
  status: "Available" | "Sold";
};

export default function PropertyStatusButton({
  propertyId,
  status,
}: PropertyStatusButtonProps) {
  const router = useRouter();

  async function updateStatus() {
    await fetch("/api/update-property-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        propertyId,
        status,
      }),
    });

    router.refresh();
  }

  return (
    <button
      onClick={updateStatus}
      className={`rounded-lg px-3 py-2 text-sm font-bold ${
        status === "Sold"
          ? "bg-red-600 text-white"
          : "bg-green-500 text-black"
      }`}
    >
      Mark {status}
    </button>
  );
}