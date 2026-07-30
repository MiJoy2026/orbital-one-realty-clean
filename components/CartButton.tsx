"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  CART_RESERVATION_COOKIE,
  parseReservationCookie,
} from "@/lib/cart-reservations";

function getReservationCount(): number {
  const cookiePrefix = `${CART_RESERVATION_COOKIE}=`;
  const cookieValue = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(cookiePrefix))
    ?.slice(cookiePrefix.length);

  return parseReservationCookie(cookieValue).length;
}

export default function CartButton() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const updateItemCount = () => {
      setItemCount(getReservationCount());
    };

    updateItemCount();

    window.addEventListener("orbital-cart-updated", updateItemCount);
    window.addEventListener("focus", updateItemCount);
    window.addEventListener("pageshow", updateItemCount);

    return () => {
      window.removeEventListener("orbital-cart-updated", updateItemCount);
      window.removeEventListener("focus", updateItemCount);
      window.removeEventListener("pageshow", updateItemCount);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 transition hover:bg-white/10"
    >
      <span className="text-xl" aria-hidden="true">
        {"\u{1F6D2}"}
      </span>

      <span>Cart</span>

      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}