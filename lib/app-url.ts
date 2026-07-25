function normalizeAppUrl(value: string): string {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_APP_URL must use http or https.");
  }

  return url.toString().replace(/\/+$/, "");
}

export function getAppUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return normalizeAppUrl(configuredUrl);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is required in the production environment."
    );
  }

  return "http://localhost:3000";
}
