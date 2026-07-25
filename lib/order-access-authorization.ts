import { verifyOrderAccessToken } from "./order-access-token";
import { getSessionUserId } from "./session";

type AccessControlledOrder = {
  id: string;
  certificateNumber: string;
  paymentStatus: string;
  userId: string | null;
};

export async function requestCanAccessOrder(
  request: Request,
  order: AccessControlledOrder,
  snapshotId?: string | null
): Promise<boolean> {
  if (order.paymentStatus.trim().toLowerCase() !== "paid") {
    return false;
  }

  const sessionUserId = await getSessionUserId();

  if (sessionUserId && order.userId === sessionUserId) {
    return true;
  }

  const accessToken = new URL(request.url).searchParams.get("access")?.trim();

  if (!accessToken) {
    return false;
  }

  try {
    await verifyOrderAccessToken(accessToken, {
      orderId: order.id,
      certificateNumber: order.certificateNumber,
      snapshotId,
    });
    return true;
  } catch {
    return false;
  }
}
