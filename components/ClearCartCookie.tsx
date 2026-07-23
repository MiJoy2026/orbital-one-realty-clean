"use client";

import { useEffect } from "react";

import { CART_RESERVATION_COOKIE } from "../lib/cart-reservations";

export default function ClearCartCookie() {
  useEffect(() => {
    document.cookie = `${CART_RESERVATION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    window.dispatchEvent(new Event("orbital-cart-updated"));
  }, []);

  return null;
}
