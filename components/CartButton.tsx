"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 transition"
    >
      <span className="text-xl">🛒</span>

      <span>Cart</span>

      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}