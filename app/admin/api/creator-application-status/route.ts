import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendCreatorDecisionEmail } from "@/lib/send-creator-decision-email";

const ALLOWED_ACTIONS = new Set(["approve", "reject"]);

function createTrackingCode(application: {
  id: string;
  handle: string;
  fullName: string;
}): string {
  const namePart =
    application.handle
      .replace(/^@/, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 12) ||
    application.fullName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 12) ||
    "CREATOR";

  const uniquePart = createHash("sha256")
    .update(application.id)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();

  return `OOR-${namePart}-${uniquePart}`;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    );
  }

  const applicationId = String(body.applicationId || "").trim();
  const action = String(body.action || "")
    .trim()
    .toLowerCase();
  const reviewNotes = String(body.reviewNotes || "")
    .trim()
    .slice(0, 2000);

  if (!applicationId || !ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { error: "A valid creator application and action are required." },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (transaction) => {
    const application = await transaction.creatorApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        partner: true,
      },
    });

    if (!application) {
      return {
        kind: "not-found" as const,
      };
    }

    const reviewedAt = new Date();

    if (action === "reject") {
      if (application.partner) {
        return {
          kind: "approved-partner" as const,
        };
      }

      const updatedApplication =
        await transaction.creatorApplication.update({
          where: {
            id: application.id,
          },
          data: {
            status: "Rejected",
            reviewNotes: reviewNotes || null,
            reviewedBy: "MiJoy Enterprises LLC",
            reviewedAt,
            rejectedAt: reviewedAt,
            approvedAt: null,
          },
        });

      return {
        kind: "rejected" as const,
        application: updatedApplication,
      };
    }

    const partnerWithSameEmail =
      await transaction.creatorPartner.findUnique({
        where: {
          email: application.email,
        },
      });

    if (
      partnerWithSameEmail &&
      partnerWithSameEmail.applicationId !== application.id
    ) {
      return {
        kind: "duplicate-email" as const,
      };
    }

    const trackingCode =
      application.partner?.trackingCode ||
      createTrackingCode({
        id: application.id,
        handle: application.handle,
        fullName: application.fullName,
      });

    const partner = await transaction.creatorPartner.upsert({
      where: {
        applicationId: application.id,
      },
      update: {
        fullName: application.fullName,
        email: application.email,
        status: "Active",
        suspendedAt: null,
        terminatedAt: null,
      },
      create: {
        applicationId: application.id,
        fullName: application.fullName,
        email: application.email,
        trackingCode,
        status: "Active",
      },
    });

    const updatedApplication =
      await transaction.creatorApplication.update({
        where: {
          id: application.id,
        },
        data: {
          status: "Approved",
          reviewNotes: reviewNotes || null,
          reviewedBy: "MiJoy Enterprises LLC",
          reviewedAt,
          approvedAt: reviewedAt,
          rejectedAt: null,
        },
      });

    return {
      kind: "approved" as const,
      application: updatedApplication,
      partner,
    };
  });

  if (result.kind === "not-found") {
    return NextResponse.json(
      { error: "Creator application not found." },
      { status: 404 }
    );
  }

  if (result.kind === "approved-partner") {
    return NextResponse.json(
      {
        error:
          "This application already has a Creator Partner account and cannot be rejected here.",
      },
      { status: 409 }
    );
  }

  if (result.kind === "duplicate-email") {
    return NextResponse.json(
      {
        error:
          "A Creator Partner account already exists for this email address.",
      },
      { status: 409 }
    );
  }
    let decisionEmailSent = false;

  try {
    const emailId =
      result.kind === "approved"
        ? await sendCreatorDecisionEmail({
            kind: "approved",
            to: result.application.email,
            fullName: result.application.fullName,
            trackingCode: result.partner.trackingCode,
          })
        : await sendCreatorDecisionEmail({
            kind: "rejected",
            to: result.application.email,
            fullName: result.application.fullName,
          });

    decisionEmailSent = true;

    console.log(
      `Creator ${result.kind} email sent:`,
      emailId || "accepted by Resend"
    );
  } catch (error) {
    console.error(
      `Creator application ${result.application.id} was updated, but the decision email failed:`,
      error
    );
  }

    return NextResponse.json({
    success: true,
    action: result.kind,
    application: result.application,
    partner: result.kind === "approved" ? result.partner : null,
    decisionEmailSent,
  });
}