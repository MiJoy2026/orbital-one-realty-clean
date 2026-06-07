import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { propertyId, status } = body;

  if (!propertyId || !status) {
    return NextResponse.json(
      { error: "Missing propertyId or status" },
      { status: 400 }
    );
  }

  const property = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: {
      status,
    },
  });

  return NextResponse.json({
    success: true,
    property,
  });
}