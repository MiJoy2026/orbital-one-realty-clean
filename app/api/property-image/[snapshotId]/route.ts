import { NextRequest, NextResponse } from "next/server";

import { prisma } from "../../../../lib/prisma";
import {
  renderOwnedPropertyImage,
  type PropertyImageView,
} from "../../../../lib/property-image-renderer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function safeFilename(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "-");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ snapshotId: string }> }
) {
  const { snapshotId } = await params;
  const snapshot = await prisma.ownedPropertySnapshot.findUnique({
    where: { id: snapshotId },
  });

  if (!snapshot) {
    return NextResponse.json(
      { error: "Property image not found." },
      { status: 404 }
    );
  }

  const size =
    request.nextUrl.searchParams.get("size") === "thumb" ? "thumb" : "full";
  const requestedView = request.nextUrl.searchParams.get("view");
  const view: PropertyImageView =
    requestedView === "locator" ? "locator" : "scenic";
  const shouldDownload = request.nextUrl.searchParams.get("download") === "1";

  try {
    const image = await renderOwnedPropertyImage(snapshot, size, view);
    const filename =
      view === "locator"
        ? `${safeFilename(snapshot.propertyId)}-parcel-locator.png`
        : `${safeFilename(snapshot.propertyId)}-lunascape-scenic-view.png`;

    return new NextResponse(new Uint8Array(image), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(image.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": shouldDownload
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
        "X-LunaScape-View": view,
      },
    });
  } catch (error) {
    console.error(
      `[Orbital One] Unable to render ${view} property image ${snapshot.id}.`,
      error
    );

    return NextResponse.json(
      { error: "The property image could not be rendered." },
      { status: 500 }
    );
  }
}
