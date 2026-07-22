import { NextResponse } from "next/server";

import {
  getGeographyRelease,
  LunaSphereGeographyNotFoundError,
  LunaSphereGeographyValidationError,
} from "@/lib/lunasphere-geography-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    releaseNumber: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { releaseNumber: releaseNumberText } = await context.params;
  const releaseNumber = Number.parseInt(releaseNumberText, 10);

  try {
    return NextResponse.json({
      release: await getGeographyRelease(releaseNumber),
    });
  } catch (error) {
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

    console.error("Unable to load LunaSphere geography release", error);

    return NextResponse.json(
      { error: "The LunaSphere geography release could not be loaded." },
      { status: 500 }
    );
  }
}
