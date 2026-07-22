import { NextResponse } from "next/server";

import {
  LunaSphereGeographyConflictError,
  LunaSphereGeographyValidationError,
  publishGeographyRelease,
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

  const geography =
    typeof body === "object" && body !== null && "geography" in body
      ? (body as { geography: unknown }).geography
      : typeof body === "object" && body !== null && "topology" in body
        ? (body as { topology: unknown }).topology
        : null;

  try {
    return NextResponse.json(
      await publishGeographyRelease(geography)
    );
  } catch (error) {
    if (error instanceof LunaSphereGeographyConflictError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error instanceof LunaSphereGeographyValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }

    console.error("Unable to publish LunaSphere geography", error);

    return NextResponse.json(
      { error: "The LunaSphere geography release could not be published." },
      { status: 500 }
    );
  }
}
