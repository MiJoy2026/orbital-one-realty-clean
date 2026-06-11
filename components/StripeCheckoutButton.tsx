"use client";

import { useState } from "react";

export default function StripeCheckoutButton({
  propertyId,
  acres,
}: {
  propertyId: string;
  acres?: number;
}) {
  const [deedName, setdeedName] = useState("");

  async function handleCheckout() {
    if (!deedName.trim()) {
      alert("Please enter the name you want printed on the deed.");
      return;
    }

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        propertyId,
        deedName,
        acres,
      }),
    });

    const data = await response.json();

    if (data.url) {
     window.location.href = data.url;
    } else {
     alert(data.error || "Unable to start checkout.");
    }
  }

  return (
    <div className="mt-8">
      <label className="block text-left text-sm font-bold text-gray-300">
        Recipient Name for Deed
      </label>

      <input
        value={deedName}
        onChange={(event) => setdeedName(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
        placeholder="Example: Michael Murphy, Emily & Jacob, The Smith Family"
      />

      <button
        onClick={handleCheckout}
        className="mt-4 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
      >
        Continue to Payment
      </button>
    </div>
  );
}