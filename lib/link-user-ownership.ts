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
        userId: null,
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          { recipientEmail: { equals: email, mode: "insensitive" } },
        ],
      },
      data: {
        userId,
      },
    }),
    prisma.member.updateMany({
      where: {
        userId: null,
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
