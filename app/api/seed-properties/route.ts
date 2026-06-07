import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sampleProperties } from "../../../lib/moon-data";

export async function GET() {
  for (const property of sampleProperties) {
    await prisma.property.upsert({
      where: {
        id: property.id,
      },
      update: {},
      create: {
        id: property.id,
        state: property.state,
        type: property.type,
        size: property.size,
        price: property.price,
        status: "Available",
      },
    });
  }

  const count = await prisma.property.count();

  return NextResponse.json({
    success: true,
    propertiesLoaded: count,
  });
}