import type { NextRequest, NextResponse } from "next/server";

export const CART_RESERVATION_COOKIE = "orbital_one_cart_reservations";
export const MAX_CART_PROPERTIES = 10;

function normalizeReservationId(value: unknown): string {
  return String(value || "").trim().slice(0, 80);
}

export function normalizeReservationIds(value: unknown): string[] {
  const source = Array.isArray(value) ? value : [value];

  return Array.from(
    new Set(source.map(normalizeReservationId).filter(Boolean))
  ).slice(0, MAX_CART_PROPERTIES);
}

export function parseReservationCookie(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  let decoded = value;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  return normalizeReservationIds(decoded.split(","));
}

export function getRequestCartReservationIds(request: NextRequest): string[] {
  return parseReservationCookie(
    request.cookies.get(CART_RESERVATION_COOKIE)?.value
  );
}

export function setCartReservationCookie(
  response: NextResponse,
  reservationIds: string[]
): void {
  const normalized = normalizeReservationIds(reservationIds);

  response.cookies.set(CART_RESERVATION_COOKIE, normalized.join(","), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function appendCartReservation(
  request: NextRequest,
  response: NextResponse,
  reservationId: string
): void {
  const existing = getRequestCartReservationIds(request);
  setCartReservationCookie(response, [...existing, reservationId]);
}

export function removeCartReservation(
  request: NextRequest,
  response: NextResponse,
  reservationId: string
): void {
  const existing = getRequestCartReservationIds(request);
  setCartReservationCookie(
    response,
    existing.filter((id) => id !== reservationId)
  );
}
