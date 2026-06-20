import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();

  let linkedOrders = 0;

  for (const user of users) {
    const result = await prisma.order.updateMany({
      where: {
        email: user.email,
        userId: null,
      },
      data: {
        userId: user.id,
      },
    });

    linkedOrders += result.count;
  }

  return NextResponse.json({
    success: true,
    usersChecked: users.length,
    linkedOrders,
  });
}