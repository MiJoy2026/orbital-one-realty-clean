import { prisma } from "./prisma";

export class OrderDocumentError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function getOrderDocumentData(
  request: Request,
  options: {
    requirePassport?: boolean;
  } = {}
) {
  const { searchParams } = new URL(request.url);
  const certificateNumber = String(
    searchParams.get("certificateNumber") || ""
  ).trim();

  if (!certificateNumber) {
    throw new OrderDocumentError("Missing certificate number.", 400);
  }

  const order = await prisma.order.findUnique({
    where: {
      certificateNumber,
    },
  });

  if (!order || order.paymentStatus.toLowerCase() !== "paid") {
    throw new OrderDocumentError("Certificate not found.", 404);
  }

  if (options.requirePassport && !order.passportPurchased) {
    throw new OrderDocumentError(
      "A lunar passport was not purchased with this order.",
      403
    );
  }

  const [property, allocation, member] = await Promise.all([
    prisma.property.findUnique({
      where: {
        id: order.propertyId,
      },
    }),
    prisma.acreageAllocation.findFirst({
      where: {
        certificateNumber: order.certificateNumber,
      },
    }),
    prisma.member.findFirst({
      where: {
        email: {
          equals: order.recipientEmail || order.email || "",
          mode: "insensitive",
        },
      },
    }),
  ]);

  if (!property) {
    throw new OrderDocumentError("Property not found.", 404);
  }

  const assignedAcreRange = allocation
    ? allocation.startingAcre === allocation.endingAcre
      ? `Acre ${allocation.startingAcre.toLocaleString()}`
      : `Acres ${allocation.startingAcre.toLocaleString()} through ${allocation.endingAcre.toLocaleString()}`
    : "";

  const locationLabel = [property.city, property.town, property.state]
    .filter(Boolean)
    .join(" • ");

  return {
    order,
    property,
    allocation,
    member,
    assignedAcreRange,
    locationLabel,
    certificateNumber: order.certificateNumber,
    deedName: order.deedName,
    issueDate: order.createdAt.toLocaleDateString(),
  };
}
