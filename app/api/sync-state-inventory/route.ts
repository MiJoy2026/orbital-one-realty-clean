import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { lunarStates } from "../../../lib/moon-data";

export async function GET() {
  for (const state of lunarStates) {
    const ruralOrders = await prisma.order.findMany({
      where: {
        lunarState: state.name,
        propertyType: "Rural Acre",
      },
    });

    const soldAcres = ruralOrders.reduce(
      (total, order) => total + (order.acreagePurchased || 1),
      0
    );

    await prisma.stateInventory.upsert({
      where: {
        stateName: state.name,
      },
      update: {
        totalAcres: 50000,
        soldAcres,
      },
      create: {
        stateName: state.name,
        totalAcres: 50000,
        soldAcres,
      },
    });
  }

  return NextResponse.json({
    success: true,
    message: "State inventory synced from historical orders.",
  });
}