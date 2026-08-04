"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorCommissionReviewButtonProps = {
  creatorPartnerId: string;
  monthKey: string;
};

type ReviewResponse = {
  error?: string;
  nextEligibleAt?: string;
  alreadyReviewed?: boolean;
  qualifyingSaleCount?: number;
  approvedRecordCount?: number;
  commissionRateBps?: number;
  approvedCommissionCents?: number;
};

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function CreatorCommissionReviewButton({
  creatorPartnerId,
  monthKey,
}: CreatorCommissionReviewButtonProps) {
  const router = useRouter();
  const [isReviewing, setIsReviewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function reviewMonth() {
    if (isReviewing) {
      return;
    }

    const confirmed = window.confirm(
      `Review and approve qualifying Creator Partner commissions for ${monthKey}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsReviewing(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/admin/api/creator-commission-review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creatorPartnerId,
            monthKey,
          }),
        }
      );

      const data = (await response.json()) as ReviewResponse;

      if (!response.ok) {
        const eligibilityMessage = data.nextEligibleAt
          ? ` Next eligible date: ${new Date(
              data.nextEligibleAt
            ).toLocaleDateString()}.`
          : "";

        setErrorMessage(
          `${
            data.error ||
            "The commission month could not be reviewed."
          }${eligibilityMessage}`
        );

        return;
      }

      const saleCount = data.qualifyingSaleCount || 0;
      const recordCount = data.approvedRecordCount || 0;
      const amount = formatMoney(
        data.approvedCommissionCents || 0
      );

      if (data.alreadyReviewed) {
        setSuccessMessage(
          `${monthKey} was already reviewed: ${saleCount} qualifying sales, ${recordCount} approved records, ${amount} commission.`
        );
      } else {
        const rate =
          typeof data.commissionRateBps === "number"
            ? `${(data.commissionRateBps / 100).toFixed(2)}%`
            : "the approved rate";

        setSuccessMessage(
          `${monthKey} approved at ${rate}: ${saleCount} qualifying sales, ${recordCount} records, ${amount} commission.`
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Unable to review Creator Partner commissions:",
        error
      );

      setErrorMessage(
        "The commission month could not be reviewed."
      );
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={reviewMonth}
        disabled={isReviewing}
        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isReviewing ? "Reviewing..." : "Review Month"}
      </button>

      {successMessage && (
        <p className="mt-3 max-w-xl text-sm font-semibold text-green-300">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="mt-3 max-w-xl text-sm font-semibold text-red-300">
          {errorMessage}
        </p>
      )}
    </div>
  );
}