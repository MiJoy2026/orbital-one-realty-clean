import { jwtVerify, SignJWT } from "jose";

export const ADMIN_SESSION_COOKIE = "oor_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function getAdminSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be configured with at least 32 characters."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(
  username: string
): Promise<string> {
  return new SignJWT({
    role: "admin",
    username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("orbital-one-realty")
    .setAudience("orbital-one-admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getAdminSessionSecret());
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const verified = await jwtVerify(token, getAdminSessionSecret(), {
      issuer: "orbital-one-realty",
      audience: "orbital-one-admin",
    });

    return verified.payload.role === "admin";
  } catch {
    return false;
  }
}