import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { lunarStates } from "../../../lib/moon-data";

export async function GET() {
  for (const state of lunarStates) {
    await prisma.stateInventory.upsert({
      where: {
        stateName: state.name,
      },
      update: {
        totalAcres: 50000,
      },
      create: {
        stateName: state.name,
        totalAcres: 50000,
        soldAcres: 0,
      },
    });
  }

  return NextResponse.json({
    success: true,
    statesLoaded: lunarStates.length,
    acresPerState: 50000,
  });
}