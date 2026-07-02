"use client";

import { useState } from "react";

export default function StripeCheckoutButton({
  propertyId,
  acres,
  passportSelected,
}: {
  propertyId: string;
  acres?: number;
  passportSelected?: boolean;
}) {
  const [isGift, setIsGift] = useState(false);
  const [deedName, setDeedName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  async function handleCheckout() {
    if (!deedName.trim()) {
      alert(
        isGift
          ? "Please enter the gift recipient name for the deed."
          : "Please enter the name you want printed on the deed."
      );
      return;
        if (isGift && !recipientEmail.trim()) {
        alert("Please enter the gift recipient email address.");
        return;
      }
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
        isGift,
        recipientEmail,
        giftMessage,
        passportSelected,
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
    <div className="mt-8 rounded-2xl border border-white/20 bg-white/5 p-5">
      <label className="flex items-center gap-3 font-bold text-gray-300">
        <input
          type="checkbox"
          checked={isGift}
          onChange={() => setIsGift(!isGift)}
        />
        Is this a gift?
      </label>

      <label className="mt-5 block text-left text-sm font-bold text-gray-300">
        {isGift ? "Gift Recipient Name for Deed" : "Name for Deed"}
      </label>

      <input
        value={deedName}
        onChange={(event) => setDeedName(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
        placeholder={
          isGift
            ? "Example: Emily Murphy"
            : "Example: Michael Murphy, Emily & Jacob, The Smith Family"
        }
      />
      {isGift && (
  <>
    <label className="mt-5 block text-left text-sm font-bold text-gray-300">
      Gift Recipient Email
    </label>

    <input
      value={recipientEmail}
      onChange={(event) => setRecipientEmail(event.target.value)}
      className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
      placeholder="recipient@example.com"
    />

    <label className="mt-5 block text-left text-sm font-bold text-gray-300">
      Gift Message Optional
    </label>

    <textarea
      value={giftMessage}
      onChange={(event) => setGiftMessage(event.target.value)}
      className="mt-2 min-h-28 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
      placeholder="Write a short gift message..."
    />
  </>
)}

      <button
        onClick={handleCheckout}
        className="mt-6 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
      >
        Continue to Payment
      </button>
    </div>
  );
}