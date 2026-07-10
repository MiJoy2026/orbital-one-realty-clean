"use client";

import { useEffect, useState } from "react";

export default function ReservationCountdown({
  expiresAt,
  onExpired,
}: {
  expiresAt: string;
  onExpired?: () => void;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    function updateTimer() {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );

      setRemainingSeconds(remaining);
       if (remaining === 0) {
       onExpired?.();
      }
    }

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <p className="mt-3 text-3xl font-black text-yellow-400">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </p>
  );
}