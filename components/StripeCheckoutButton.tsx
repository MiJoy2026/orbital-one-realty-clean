"use client";

export default function StripeCheckoutButton({
  propertyId,
}: {
  propertyId: string;
}) {
  async function handleCheckout() {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ propertyId }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Unable to start checkout.");
    }
  }

  return (
    <button
      onClick={handleCheckout}
      className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
    >
      Continue to Payment
    </button>
  );
}