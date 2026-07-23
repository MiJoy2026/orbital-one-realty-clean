import { NextResponse } from "next/server";

import {
  freezeActiveGeographyRelease,
  LunaSphereGeographyConflictError,
  LunaSphereGeographyNotFoundError,
  LunaSphereGeographyValidationError,
  unfreezeActiveGeography,
} from "@/lib/lunasphere-geography-store";

export const runtime = "nodejs";
export const maxDuration = 60;

function readString(
  body: Record<string, unknown>,
  key: string
): string {
  return typeof body[key] === "string" ? body[key].trim() : "";
}

function handleKnownError(error: unknown) {
  if (error instanceof LunaSphereGeographyConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof LunaSphereGeographyNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof LunaSphereGeographyValidationError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }

  console.error("Unable to update the LunaSphere geography freeze", error);

  return NextResponse.json(
    { error: "The LunaSphere geography freeze could not be updated." },
    { status: 500 }
  );
}

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

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "A valid geography freeze request is required." },
      { status: 400 }
    );
  }

  const record = body as Record<string, unknown>;
  const releaseNumber =
    typeof record.releaseNumber === "number"
      ? record.releaseNumber
      : Number.NaN;

  try {
    return NextResponse.json({
      freeze: await freezeActiveGeographyRelease({
        releaseNumber,
        confirmation: readString(record, "confirmation"),
        acceptWarnings: record.acceptWarnings === true,
        note: readString(record, "note") || null,
      }),
    });
  } catch (error) {
    return handleKnownError(error);
  }
}

export async function DELETE(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request body is required." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "A valid geography unfreeze request is required." },
      { status: 400 }
    );
  }

  const record = body as Record<string, unknown>;

  try {
    return NextResponse.json({
      freeze: await unfreezeActiveGeography({
        confirmation: readString(record, "confirmation"),
        note: readString(record, "note") || null,
      }),
    });
  } catch (error) {
    return handleKnownError(error);
  }
}
