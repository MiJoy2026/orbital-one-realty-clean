"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  CART_RESERVATION_COOKIE,
  parseReservationCookie,
} from "../lib/cart-reservations";

function readCartCount(): number {
  if (typeof document === "undefined") {
    return 0;
  }

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CART_RESERVATION_COOKIE}=`));
  const value = cookie?.slice(CART_RESERVATION_COOKIE.length + 1);

  return parseReservationCookie(value).length;
}

export default function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refreshCount = () => setCount(readCartCount());
    refreshCount();
    window.addEventListener("orbital-cart-updated", refreshCount);
    window.addEventListener("focus", refreshCount);

    return () => {
      window.removeEventListener("orbital-cart-updated", refreshCount);
      window.removeEventListener("focus", refreshCount);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 transition hover:bg-white/10"
    >
      <span className="text-xl">🛒</span>
      <span>Cart</span>
      {count > 0 && (
        <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-black text-black">
          {count}
        </span>
      )}
    </Link>
  );
}
