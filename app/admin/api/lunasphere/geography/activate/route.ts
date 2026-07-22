import { NextResponse } from "next/server";

import {
  activateGeographyRelease,
  LunaSphereGeographyConflictError,
  LunaSphereGeographyNotFoundError,
  LunaSphereGeographyValidationError,
} from "@/lib/lunasphere-geography-store";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request body is required." },
      { status: 400 }
    );
  }

  const releaseNumber =
    typeof body === "object" &&
    body !== null &&
    "releaseNumber" in body &&
    typeof (body as { releaseNumber?: unknown }).releaseNumber ===
      "number"
      ? (body as { releaseNumber: number }).releaseNumber
      : Number.NaN;

  try {
    return NextResponse.json({
      activeRelease: await activateGeographyRelease(releaseNumber),
    });
  } catch (error) {
    if (error instanceof LunaSphereGeographyConflictError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error instanceof LunaSphereGeographyNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof LunaSphereGeographyValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }

    console.error("Unable to activate LunaSphere geography release", error);

    return NextResponse.json(
      { error: "The LunaSphere geography release could not be activated." },
      { status: 500 }
    );
  }
}
