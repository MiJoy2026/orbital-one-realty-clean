import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const VALID_ACTIONS = new Set([
  "suspend",
  "reactivate",
  "terminate",
]);

const MAX_REASON_LENGTH = 1000;

class CreatorPartnerStatusConflictError extends Error {
  constructor() {
    super(
      "The Creator Partner status changed while it was being updated."
    );

    this.name = "CreatorPartnerStatusConflictError";
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<
      string,
      unknown
    >;
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    );
  }

  const creatorPartnerId = String(
    body.creatorPartnerId || ""
  ).trim();

  const action = String(body.action || "")
    .trim()
    .toLowerCase();

  const reason = String(body.reason || "").trim();

  if (
    !creatorPartnerId ||
    !VALID_ACTIONS.has(action)
  ) {
    return NextResponse.json(
      {
        error:
          "A valid Creator Partner and status action are required.",
      },
      { status: 400 }
    );
  }

  if (!reason) {
    return NextResponse.json(
      {
        error:
          "A documented reason is required for every status change.",
      },
      { status: 400 }
    );
  }

  if (reason.length > MAX_REASON_LENGTH) {
    return NextResponse.json(
      {
        error:
          `The status-change reason cannot exceed ` +
          `${MAX_REASON_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw<
          Array<{ lockAcquired: number }>
        >`
          WITH creator_partner_status_lock AS (
            SELECT pg_advisory_xact_lock(
              hashtext(
                ${`creator-partner-status:${creatorPartnerId}`}
              )
            )
          )
          SELECT 1 AS "lockAcquired"
          FROM creator_partner_status_lock
        `;

        const creatorPartner =
          await transaction.creatorPartner.findUnique({
            where: {
              id: creatorPartnerId,
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              trackingCode: true,
              status: true,
              suspendedAt: true,
              terminatedAt: true,
            },
          });

        if (!creatorPartner) {
          return {
            kind: "not-found" as const,
          };
        }

        const currentStatus = creatorPartner.status;

        if (
          !["Active", "Suspended", "Terminated"].includes(
            currentStatus
          )
        ) {
          return {
            kind: "unsupported-status" as const,
            currentStatus,
          };
        }

        let newStatus: "Active" | "Suspended" | "Terminated";

        if (action === "suspend") {
          newStatus = "Suspended";

          if (currentStatus === "Suspended") {
            return {
              kind: "already-updated" as const,
              creatorPartner,
              newStatus,
            };
          }

          if (currentStatus !== "Active") {
            return {
              kind: "invalid-transition" as const,
              currentStatus,
              requestedStatus: newStatus,
            };
          }
        } else if (action === "reactivate") {
          newStatus = "Active";

          if (currentStatus === "Active") {
            return {
              kind: "already-updated" as const,
              creatorPartner,
              newStatus,
            };
          }

          if (currentStatus !== "Suspended") {
            return {
              kind: "invalid-transition" as const,
              currentStatus,
              requestedStatus: newStatus,
            };
          }
        } else {
          newStatus = "Terminated";

          if (currentStatus === "Terminated") {
            return {
              kind: "already-updated" as const,
              creatorPartner,
              newStatus,
            };
          }

          if (
            currentStatus !== "Active" &&
            currentStatus !== "Suspended"
          ) {
            return {
              kind: "invalid-transition" as const,
              currentStatus,
              requestedStatus: newStatus,
            };
          }
        }

        const changedAt = new Date();

        const partnerUpdate =
          await transaction.creatorPartner.updateMany({
            where: {
              id: creatorPartnerId,
              status: currentStatus,
            },
            data:
              newStatus === "Active"
                ? {
                    status: "Active",
                    suspendedAt: null,
                    terminatedAt: null,
                  }
                : newStatus === "Suspended"
                  ? {
                      status: "Suspended",
                      suspendedAt: changedAt,
                      terminatedAt: null,
                    }
                  : {
                      status: "Terminated",
                      terminatedAt: changedAt,
                    },
          });

        if (partnerUpdate.count !== 1) {
          throw new CreatorPartnerStatusConflictError();
        }

        const statusEvent =
          await transaction.creatorPartnerStatusEvent.create({
            data: {
              creatorPartnerId,
              previousStatus: currentStatus,
              newStatus,
              reason,
            },
            select: {
              id: true,
              createdAt: true,
              previousStatus: true,
              newStatus: true,
              reason: true,
            },
          });

        return {
          kind: "updated" as const,
          creatorPartner: {
            ...creatorPartner,
            status: newStatus,
          },
          previousStatus: currentStatus,
          newStatus,
          statusEvent,
        };
      }
    );

    if (result.kind === "not-found") {
      return NextResponse.json(
        { error: "Creator Partner not found." },
        { status: 404 }
      );
    }

    if (result.kind === "unsupported-status") {
      return NextResponse.json(
        {
          error:
            `This Creator Partner has an unsupported current status: ` +
            `${result.currentStatus}.`,
        },
        { status: 409 }
      );
    }

    if (result.kind === "invalid-transition") {
      return NextResponse.json(
        {
          error:
            `The Creator Partner cannot be changed from ` +
            `${result.currentStatus} to ` +
            `${result.requestedStatus}.`,
        },
        { status: 409 }
      );
    }

    if (result.kind === "already-updated") {
      return NextResponse.json({
        success: true,
        alreadyUpdated: true,
        creatorPartnerId:
          result.creatorPartner.id,
        status: result.newStatus,
      });
    }

    return NextResponse.json({
      success: true,
      alreadyUpdated: false,
      creatorPartnerId:
        result.creatorPartner.id,
      previousStatus: result.previousStatus,
      status: result.newStatus,
      statusEvent: {
        ...result.statusEvent,
        createdAt:
          result.statusEvent.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (
      error instanceof
      CreatorPartnerStatusConflictError
    ) {
      return NextResponse.json(
        {
          error:
            "The Creator Partner status changed while the update was being saved. Refresh the dashboard and try again.",
        },
        { status: 409 }
      );
    }

    console.error(
      "Unable to update Creator Partner status:",
      error
    );

    return NextResponse.json(
      {
        error:
          "The Creator Partner status could not be updated.",
      },
      { status: 500 }
    );
  }
}