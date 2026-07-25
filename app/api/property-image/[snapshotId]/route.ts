import { NextRequest, NextResponse } from "next/server";

import { renderLunaScapeVirtualImage } from "../../../../lib/lunascape-virtual-renderer";
import { requestCanAccessOrder } from "../../../../lib/order-access-authorization";
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

function notFoundResponse() {
  return NextResponse.json(
    { error: "Property image not found." },
    {
      status: 404,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ snapshotId: string }> }
) {
  const { snapshotId } = await params;
  const snapshot = await prisma.ownedPropertySnapshot.findUnique({
    where: { id: snapshotId },
    include: {
      order: {
        select: {
          id: true,
          certificateNumber: true,
          paymentStatus: true,
          userId: true,
        },
      },
    },
  });

  if (!snapshot) {
    return notFoundResponse();
  }

  const authorized = await requestCanAccessOrder(
    request,
    snapshot.order,
    snapshot.id
  );

  if (!authorized) {
    return notFoundResponse();
  }

  const size =
    request.nextUrl.searchParams.get("size") === "thumb" ? "thumb" : "full";
  const requestedView = request.nextUrl.searchParams.get("view");
  const view: "virtual" | PropertyImageView =
    requestedView === "virtual" || requestedView === "postcard"
      ? "virtual"
      : requestedView === "locator"
        ? "locator"
        : "scenic";
  const shouldDownload = request.nextUrl.searchParams.get("download") === "1";

  try {
    const image =
      view === "virtual"
        ? await renderLunaScapeVirtualImage(snapshot, size)
        : await renderOwnedPropertyImage(snapshot, size, view);
    const filename =
      view === "virtual"
        ? `${safeFilename(snapshot.propertyId)}-your-lunascape-property.png`
        : view === "locator"
          ? `${safeFilename(snapshot.propertyId)}-parcel-locator.png`
          : `${safeFilename(snapshot.propertyId)}-your-place-on-the-moon.png`;

    return new NextResponse(new Uint8Array(image), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(image.length),
        "Cache-Control": "private, no-store, max-age=0",
        Pragma: "no-cache",
        "Content-Disposition": shouldDownload
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
        "Referrer-Policy": "no-referrer",
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
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  }
}
