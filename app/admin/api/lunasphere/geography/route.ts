import { NextResponse } from "next/server";

import {
  getGeographyWorkspace,
  LunaSphereGeographyConflictError,
  LunaSphereGeographyValidationError,
  saveGeographyDraft,
} from "@/lib/lunasphere-geography-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getGeographyWorkspace());
  } catch (error) {
    console.error("Unable to load LunaSphere geography workspace", error);

    return NextResponse.json(
      { error: "The LunaSphere database workspace could not be loaded." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
  const expectedSavedAt =
    typeof body === "object" &&
    body !== null &&
    "expectedSavedAt" in body &&
    (typeof (body as { expectedSavedAt?: unknown }).expectedSavedAt ===
      "string" ||
      (body as { expectedSavedAt?: unknown }).expectedSavedAt === null)
      ? ((body as { expectedSavedAt: string | null })
          .expectedSavedAt ?? null)
      : null;

  try {
    return NextResponse.json({
      draft: await saveGeographyDraft(
        geography,
        expectedSavedAt
      ),
    });
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

    console.error("Unable to save LunaSphere geography draft", error);

    return NextResponse.json(
      { error: "The LunaSphere database draft could not be saved." },
      { status: 500 }
    );
  }
}
