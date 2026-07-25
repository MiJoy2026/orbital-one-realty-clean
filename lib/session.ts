import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const CUSTOMER_SESSION_COOKIE = "oor_customer_session_v2";
const LEGACY_SESSION_COOKIE = "oor_session";
const SESSION_ISSUER = "orbital-one-realty";
const SESSION_AUDIENCE = "orbital-one-customer";

function getSessionSecret(): Uint8Array {
  const configuredSecret = process.env.SESSION_SECRET?.trim();

  if (configuredSecret && configuredSecret.length < 32) {
    throw new Error(
      "SESSION_SECRET must contain at least 32 characters."
    );
  }

  if (configuredSecret) {
    return new TextEncoder().encode(configuredSecret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is required in the production environment."
    );
  }

  return new TextEncoder().encode(
    "orbital-one-local-development-secret-only"
  );
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId, version: 2 })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());

  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.delete(LEGACY_SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSessionSecret(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    const userId = verified.payload.userId;
    const version = verified.payload.version;

    return typeof userId === "string" && userId && version === 2
      ? userId
      : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
  cookieStore.delete(LEGACY_SESSION_COOKIE);
}
