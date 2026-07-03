"use client";

import { useState } from "react";

export default function ClaimHoaForm() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [deedName, setDeedName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("Checking membership...");

    const response = await fetch("/api/claim-hoa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ certificateNumber, deedName, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Unable to claim membership.");
      return;
    }

    setMessage(
      `Membership activated! Property ${data.propertyId} is now linked to this HOA claim.`
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
      <input
        value={certificateNumber}
        onChange={(event) => setCertificateNumber(event.target.value)}
        required
        className="rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
        placeholder="Certificate Number"
      />

      <input
        value={deedName}
        onChange={(event) => setDeedName(event.target.value)}
        required
        className="rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
        placeholder="Name Printed on Deed"
      />

      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        required
        className="rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
        placeholder="Email address"
      />

      <button
        type="submit"
        className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
      >
        Activate Membership
      </button>

      {message && <p className="text-sm font-bold text-yellow-400">{message}</p>}
    </form>
  );
}