import { Prisma } from "@prisma/client";
import Stripe from "stripe";

import { prisma } from "./prisma";

const SUPPORTED_FINANCIAL_EVENT_TYPES = new Set([
  "refund.created",
  "refund.updated",
  "refund.failed",
  "charge.dispute.created",
  "charge.dispute.updated",
  "charge.dispute.closed",
  "charge.dispute.funds_withdrawn",
  "charge.dispute.funds_reinstated",
]);

const SETTLED_DISPUTE_STATUSES = new Set([
  "won",
  "warning_closed",
]);

type PaymentReferences = {
  paymentIntentId: string | null;
  chargeId: string | null;
};

type FinancialEventDetails = PaymentReferences & {
  stripeObjectId: string;
  amountCents: number | null;
  currency: string | null;
};

type AllocationItem = {
  id: string;
  weight: number;
};

function getStripeExpandableId(
  value:
    | string
    | {
        id: string;
      }
    | null
    | undefined
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    typeof value.id === "string"
  ) {
    return value.id;
  }

  return null;
}

function getFinancialEventDetails(
  event: Stripe.Event
): FinancialEventDetails {
  if (event.type.startsWith("refund.")) {
    const refund = event.data.object as Stripe.Refund;

    return {
      stripeObjectId: refund.id,
      paymentIntentId: getStripeExpandableId(
        refund.payment_intent
      ),
      chargeId: getStripeExpandableId(refund.charge),
      amountCents:
        typeof refund.amount === "number"
          ? refund.amount
          : null,
      currency: refund.currency || null,
    };
  }

  const dispute = event.data.object as Stripe.Dispute;

  return {
    stripeObjectId: dispute.id,
    paymentIntentId: getStripeExpandableId(
      dispute.payment_intent
    ),
    chargeId: getStripeExpandableId(dispute.charge),
    amountCents:
      typeof dispute.amount === "number"
        ? dispute.amount
        : null,
    currency: dispute.currency || null,
  };
}

async function resolveCharge(
  stripe: Stripe,
  initialReferences: PaymentReferences
): Promise<{
  charge: Stripe.Charge;
  paymentIntentId: string | null;
  chargeId: string;
}> {
  let paymentIntentId =
    initialReferences.paymentIntentId;

  let chargeId = initialReferences.chargeId;

  if (!chargeId && paymentIntentId) {
    const paymentIntent =
      await stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ["latest_charge"],
        }
      );

    chargeId = getStripeExpandableId(
      paymentIntent.latest_charge
    );
  }

  if (!chargeId) {
    throw new Error(
      "The Stripe financial event does not identify a Charge."
    );
  }

  const charge = await stripe.charges.retrieve(
    chargeId,
    {
      expand: ["payment_intent"],
    }
  );

  paymentIntentId =
    paymentIntentId ||
    getStripeExpandableId(charge.payment_intent);

  return {
    charge,
    paymentIntentId,
    chargeId,
  };
}

async function resolveCheckoutSessionId(
  stripe: Stripe,
  paymentIntentId: string | null,
  chargeId: string
): Promise<string | null> {
  const orderByCharge = await prisma.order.findFirst({
    where: {
      stripeChargeId: chargeId,
    },
    select: {
      stripeSessionId: true,
    },
  });

  if (orderByCharge) {
    return orderByCharge.stripeSessionId;
  }

  if (paymentIntentId) {
    const orderByPaymentIntent =
      await prisma.order.findFirst({
        where: {
          stripePaymentIntentId: paymentIntentId,
        },
        select: {
          stripeSessionId: true,
        },
      });

    if (orderByPaymentIntent) {
      return orderByPaymentIntent.stripeSessionId;
    }

    const sessions =
      await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });

    return sessions.data[0]?.id || null;
  }

  return null;
}

function allocateCents(
  totalCents: number,
  items: AllocationItem[]
): Map<string, number> {
  const allocations = new Map<string, number>();

  for (const item of items) {
    allocations.set(item.id, 0);
  }

  const safeTotalCents = Math.max(
    0,
    Math.trunc(totalCents)
  );

  const totalWeight = items.reduce(
    (total, item) =>
      total + Math.max(0, item.weight),
    0
  );

  if (
    safeTotalCents === 0 ||
    totalWeight === 0 ||
    items.length === 0
  ) {
    return allocations;
  }

  const remainders: Array<{
    id: string;
    fraction: number;
  }> = [];

  let allocatedCents = 0;

  for (const item of items) {
    const safeWeight = Math.max(0, item.weight);

    const exactAllocation =
      (safeTotalCents * safeWeight) / totalWeight;

    const wholeAllocation = Math.floor(
      exactAllocation
    );

    allocations.set(item.id, wholeAllocation);
    allocatedCents += wholeAllocation;

    remainders.push({
      id: item.id,
      fraction:
        exactAllocation - wholeAllocation,
    });
  }

  remainders.sort((first, second) => {
    if (second.fraction !== first.fraction) {
      return second.fraction - first.fraction;
    }

    return first.id.localeCompare(second.id);
  });

  let remainingCents =
    safeTotalCents - allocatedCents;

  let remainderIndex = 0;

  while (
    remainingCents > 0 &&
    remainders.length > 0
  ) {
    const item =
      remainders[
        remainderIndex % remainders.length
      ];

    allocations.set(
      item.id,
      (allocations.get(item.id) || 0) + 1
    );

    remainingCents -= 1;
    remainderIndex += 1;
  }

  return allocations;
}

function calculateCommissionAmountCents(
  netRevenueCents: number,
  commissionRateBps: number
): number {
  return Math.max(
    0,
    Math.round(
      (Math.max(0, netRevenueCents) *
        Math.max(0, commissionRateBps)) /
        10000
    )
  );
}

function getFinancialStatus({
  grossRevenueCents,
  refundAmountCents,
  disputeAmountCents,
  hasOpenDispute,
  hasLostDispute,
}: {
  grossRevenueCents: number;
  refundAmountCents: number;
  disputeAmountCents: number;
  hasOpenDispute: boolean;
  hasLostDispute: boolean;
}): string {
  if (
    disputeAmountCents > 0 &&
    hasOpenDispute
  ) {
    return "Disputed";
  }

  if (
    disputeAmountCents > 0 &&
    hasLostDispute
  ) {
    return "DisputeLost";
  }

  if (
    refundAmountCents >= grossRevenueCents &&
    grossRevenueCents > 0
  ) {
    return "Refunded";
  }

  if (refundAmountCents > 0) {
    return "PartiallyRefunded";
  }

  return "Clear";
}

function createFinancialNote({
  event,
  refundAmountCents,
  disputeAmountCents,
}: {
  event: Stripe.Event;
  refundAmountCents: number;
  disputeAmountCents: number;
}): string {
  return [
    `Stripe financial reconciliation: ${event.type}.`,
    `Stripe event: ${event.id}.`,
    `Refund total: ${refundAmountCents} cents.`,
    `Dispute total: ${disputeAmountCents} cents.`,
    `Reconciled at: ${new Date().toISOString()}.`,
  ].join(" ");
}

export function isSupportedStripeFinancialEvent(
  eventType: string
): boolean {
  return SUPPORTED_FINANCIAL_EVENT_TYPES.has(
    eventType
  );
}

export async function processStripeFinancialEvent(
  stripe: Stripe,
  event: Stripe.Event
): Promise<{
  processed: boolean;
  alreadyProcessed: boolean;
  stripeSessionId: string;
  commissionCount: number;
}> {
  if (
    !isSupportedStripeFinancialEvent(event.type)
  ) {
    throw new Error(
      `Unsupported Stripe financial event: ${event.type}`
    );
  }

  const eventDetails =
    getFinancialEventDetails(event);

  const {
    charge,
    paymentIntentId,
    chargeId,
  } = await resolveCharge(stripe, {
    paymentIntentId:
      eventDetails.paymentIntentId,
    chargeId: eventDetails.chargeId,
  });

  if (
    charge.currency &&
    charge.currency.toLowerCase() !== "usd"
  ) {
    throw new Error(
      `Stripe financial event ${event.id} uses unsupported currency ${charge.currency}.`
    );
  }

  const stripeSessionId =
    await resolveCheckoutSessionId(
      stripe,
      paymentIntentId,
      chargeId
    );

  if (!stripeSessionId) {
    throw new Error(
      `No Checkout Session could be located for Stripe financial event ${event.id}.`
    );
  }

  const disputeList =
    await stripe.disputes.list({
      charge: chargeId,
      limit: 100,
    });

  if (disputeList.has_more) {
    throw new Error(
      `Stripe Charge ${chargeId} has more disputes than can be reconciled safely in one request.`
    );
  }

  const relevantDisputes =
    disputeList.data.filter(
      (dispute) =>
        !SETTLED_DISPUTE_STATUSES.has(
          dispute.status
        )
    );

  const hasOpenDispute =
    relevantDisputes.some(
      (dispute) => dispute.status !== "lost"
    );

  const hasLostDispute =
    relevantDisputes.some(
      (dispute) => dispute.status === "lost"
    );

  const stripeRefundAmountCents = Math.max(
    0,
    charge.amount_refunded
  );

  const stripeDisputeAmountCents =
    relevantDisputes.reduce(
      (total, dispute) =>
        total + Math.max(0, dispute.amount),
      0
    );

  const reconciliationTime = new Date();

  try {
    return await prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw<
          Array<{ lockAcquired: number }>
        >`
          WITH stripe_financial_event_lock AS (
            SELECT pg_advisory_xact_lock(
              hashtext(
                ${`stripe-financial:${chargeId}`}
              )
            )
          )
          SELECT 1 AS "lockAcquired"
          FROM stripe_financial_event_lock
        `;

        const existingEvent =
          await transaction.stripeFinancialEvent.findUnique({
            where: {
              stripeEventId: event.id,
            },
            select: {
              id: true,
            },
          });

        if (existingEvent) {
          const existingCommissionCount =
            await transaction.creatorCommission.count({
              where: {
                order: {
                  stripeSessionId,
                },
              },
            });

          return {
            processed: true,
            alreadyProcessed: true,
            stripeSessionId,
            commissionCount:
              existingCommissionCount,
          };
        }

        const orders =
          await transaction.order.findMany({
            where: {
              stripeSessionId,
            },
            include: {
              creatorCommission: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          });

        if (orders.length === 0) {
          throw new Error(
            `No Orbital One orders were found for Checkout Session ${stripeSessionId}.`
          );
        }

        await transaction.order.updateMany({
          where: {
            stripeSessionId,
          },
          data: {
            stripePaymentIntentId:
              paymentIntentId,
            stripeChargeId: chargeId,
          },
        });

        const commissions = orders.flatMap(
          (order) =>
            order.creatorCommission
              ? [order.creatorCommission]
              : []
        );

        const totalGrossRevenueCents =
          commissions.reduce(
            (total, commission) =>
              total +
              Math.max(
                0,
                commission.grossRevenueCents
              ),
            0
          );

        const appliedRefundAmountCents =
          Math.min(
            stripeRefundAmountCents,
            totalGrossRevenueCents
          );

        const refundAllocations =
          allocateCents(
            appliedRefundAmountCents,
            commissions.map((commission) => ({
              id: commission.id,
              weight:
                commission.grossRevenueCents,
            }))
          );

        const revenueRemainingAfterRefund =
          Math.max(
            0,
            totalGrossRevenueCents -
              appliedRefundAmountCents
          );

        const appliedDisputeAmountCents =
          Math.min(
            stripeDisputeAmountCents,
            revenueRemainingAfterRefund
          );

        const disputeAllocations =
          allocateCents(
            appliedDisputeAmountCents,
            commissions.map((commission) => ({
              id: commission.id,
              weight: Math.max(
                0,
                commission.grossRevenueCents -
                  (refundAllocations.get(
                    commission.id
                  ) || 0)
              ),
            }))
          );

        for (const commission of commissions) {
          const refundAmountCents =
            refundAllocations.get(
              commission.id
            ) || 0;

          const disputeAmountCents =
            disputeAllocations.get(
              commission.id
            ) || 0;

          const netRevenueCents = Math.max(
            0,
            commission.grossRevenueCents -
              refundAmountCents -
              disputeAmountCents
          );

          const financialStatus =
            getFinancialStatus({
              grossRevenueCents:
                commission.grossRevenueCents,
              refundAmountCents,
              disputeAmountCents,
              hasOpenDispute,
              hasLostDispute,
            });

          const financialNote =
            createFinancialNote({
              event,
              refundAmountCents,
              disputeAmountCents,
            });

          const shouldRecalculateCommission =
            commission.status === "Approved" &&
            commission.paidAt === null &&
            commission.commissionRateBps !==
              null;

          const recalculatedCommissionCents =
            shouldRecalculateCommission
              ? calculateCommissionAmountCents(
                  netRevenueCents,
                  commission.commissionRateBps!
                )
              : null;

          await transaction.creatorCommission.update({
            where: {
              id: commission.id,
            },
            data: {
              refundAmountCents,
              disputeAmountCents,
              netRevenueCents,
              financialStatus,
              financialNote,
              financialUpdatedAt:
                reconciliationTime,
              ...(recalculatedCommissionCents !==
              null
                ? {
                    commissionAmountCents:
                      recalculatedCommissionCents,
                  }
                : {}),
            },
          });
        }

        await transaction.stripeFinancialEvent.create({
          data: {
            stripeEventId: event.id,
            eventType: event.type,
            stripeObjectId:
              eventDetails.stripeObjectId,
            stripePaymentIntentId:
              paymentIntentId,
            stripeChargeId: chargeId,
            stripeSessionId,
            amountCents:
              eventDetails.amountCents,
            currency:
              eventDetails.currency ||
              charge.currency ||
              null,
            eventCreatedAt: new Date(
              event.created * 1000
            ),
            processedAt:
              reconciliationTime,
          },
        });

        return {
          processed: true,
          alreadyProcessed: false,
          stripeSessionId,
          commissionCount:
            commissions.length,
        };
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel
            .Serializable,
      }
    );
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        processed: true,
        alreadyProcessed: true,
        stripeSessionId,
        commissionCount: 0,
      };
    }

    throw error;
  }
}