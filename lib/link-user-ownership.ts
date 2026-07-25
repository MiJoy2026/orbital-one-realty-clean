import { prisma } from "./prisma";

export async function linkUserOwnershipByEmail(
  userId: string,
  emailAddress: string
): Promise<void> {
  const email = emailAddress.trim().toLowerCase();

  if (!email) {
    return;
  }

  await prisma.$transaction([
    prisma.order.updateMany({
      where: {
        OR: [
          {
            recipientEmail: {
              equals: email,
              mode: "insensitive",
            },
          },
          {
            email: {
              equals: email,
              mode: "insensitive",
            },
            isGift: false,
          },
        ],
      },
      data: {
        userId,
      },
    }),
    prisma.member.updateMany({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      data: {
        userId,
      },
    }),
  ]);
}
