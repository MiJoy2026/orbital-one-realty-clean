import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const CREATOR_TERMS_VERSION = "2026-08-03";

function readField(
  formData: FormData,
  name: string,
  maxLength: number
): string {
  return String(formData.get(name) || "").trim().slice(0, maxLength);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function redirectTo(request: Request, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url), 303);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = readField(formData, "fullName", 120);
    const email = readField(formData, "email", 180).toLowerCase();
    const country = readField(formData, "country", 100);
    const primaryPlatform = readField(formData, "primaryPlatform", 80);
    const handle = readField(formData, "handle", 160);
    const audienceSize = readField(formData, "audienceSize", 80);
    const profileUrl = readField(formData, "profileUrl", 400);
    const contentFocus = readField(formData, "contentFocus", 1200);
    const whyFit = readField(formData, "whyFit", 1800);
    const campaignIdea = readField(formData, "campaignIdea", 1500);

    const ageConfirmed = formData.get("ageConfirmed") === "yes";
    const disclosureConfirmed =
      formData.get("disclosureConfirmed") === "yes";
    const termsAccepted = formData.get("termsAccepted") === "yes";

    const requiredValues = [
      fullName,
      email,
      country,
      primaryPlatform,
      handle,
      audienceSize,
      profileUrl,
      contentFocus,
      whyFit,
    ];

    if (
      requiredValues.some((value) => !value) ||
      !isValidEmail(email) ||
      !ageConfirmed ||
      !disclosureConfirmed ||
      !termsAccepted
    ) {
      return redirectTo(request, "/creators?error=1#apply");
    }

    let parsedProfileUrl: URL;
    try {
      parsedProfileUrl = new URL(profileUrl);
      if (!["http:", "https:"].includes(parsedProfileUrl.protocol)) {
        throw new Error("Unsupported profile URL protocol.");
      }
    } catch {
      return redirectTo(request, "/creators?error=1#apply");
    }

        const application = await prisma.creatorApplication.create({
      data: {
        fullName,
        email,
        country,
        primaryPlatform,
        handle,
        audienceSize,
        profileUrl: parsedProfileUrl.toString(),
        contentFocus,
        whyFit,
        campaignIdea: campaignIdea || null,
        ageConfirmed,
        disclosureConfirmed,
        termsAccepted,
        termsVersion: CREATOR_TERMS_VERSION,
      },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
      console.error(
        `Creator application ${application.id} was saved, but RESEND_API_KEY is missing.`
      );

      return redirectTo(request, "/creators?submitted=1#apply");
    }

    const resend = new Resend(resendApiKey);
    const safe = {
      fullName: escapeHtml(fullName),
      email: escapeHtml(email),
      country: escapeHtml(country),
      primaryPlatform: escapeHtml(primaryPlatform),
      handle: escapeHtml(handle),
      audienceSize: escapeHtml(audienceSize),
      profileUrl: escapeHtml(parsedProfileUrl.toString()),
      contentFocus: escapeHtml(contentFocus).replaceAll("\n", "<br />"),
      whyFit: escapeHtml(whyFit).replaceAll("\n", "<br />"),
      campaignIdea: escapeHtml(campaignIdea).replaceAll("\n", "<br />"),
    };

        const applicationSubject =
      `Creator application ${application.id}: ${fullName} - ${primaryPlatform}`;

    const { data: applicationData, error: applicationError } =
      await resend.emails.send({
        from: "Orbital One Creator Partners <orders@orbitalonerealty.com>",
        to: ["mijoyenterprises@gmail.com"],
        replyTo: email,
        subject: applicationSubject,
        tags: [{ name: "category", value: "creator_application" }],
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:720px;margin:0 auto;">
            <h1 style="color:#9a7614;">New Creator Partner Application</h1>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border-bottom:1px solid #ddd;">${safe.fullName}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border-bottom:1px solid #ddd;">${safe.email}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Country</td><td style="padding:8px;border-bottom:1px solid #ddd;">${safe.country}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Platform</td><td style="padding:8px;border-bottom:1px solid #ddd;">${safe.primaryPlatform}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Handle</td><td style="padding:8px;border-bottom:1px solid #ddd;">${safe.handle}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Audience</td><td style="padding:8px;border-bottom:1px solid #ddd;">${safe.audienceSize}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Profile</td><td style="padding:8px;border-bottom:1px solid #ddd;"><a href="${safe.profileUrl}">${safe.profileUrl}</a></td></tr>
            </table>

            <h2 style="color:#9a7614;margin-top:28px;">Content focus</h2>
            <p>${safe.contentFocus}</p>

            <h2 style="color:#9a7614;margin-top:28px;">Why the program fits</h2>
            <p>${safe.whyFit}</p>

            <h2 style="color:#9a7614;margin-top:28px;">Campaign idea</h2>
            <p>${safe.campaignIdea || "Not provided."}</p>

            <hr style="border:0;border-top:1px solid #ddd;margin:28px 0;" />
            <p style="font-size:13px;color:#555;">
              Applicant confirmed age/legal capacity, disclosure obligations, and acceptance of the Creator Partner Program Terms.
            </p>
          </div>
        `,
        text: [
          "New Creator Partner Application",
          "",
          `Name: ${fullName}`,
          `Email: ${email}`,
          `Country: ${country}`,
          `Platform: ${primaryPlatform}`,
          `Handle: ${handle}`,
          `Audience: ${audienceSize}`,
          `Profile: ${parsedProfileUrl.toString()}`,
          "",
          "Content focus:",
          contentFocus,
          "",
          "Why the program fits:",
          whyFit,
          "",
          "Campaign idea:",
          campaignIdea || "Not provided.",
          "",
          "Applicant confirmed age/legal capacity, disclosure obligations, and acceptance of the program terms.",
        ].join("\n"),
      });

        if (applicationError) {
      console.error(
        `Creator application ${application.id} was saved, but the notification email failed:`,
        applicationError
      );
    } else {
      console.log(
        "Creator application email sent:",
        applicationData?.id || "accepted by Resend"
      );
    }

    const { data: confirmationData, error: confirmationError } =
      await resend.emails.send({
        from: "Orbital One Creator Partners <orders@orbitalonerealty.com>",
        to: [email],
        subject: "We received your Orbital One Realty creator application",
        tags: [{ name: "category", value: "creator_confirmation" }],
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px;margin:0 auto;">
            <h1 style="color:#9a7614;">Application Received</h1>
            <p>Hello ${safe.fullName},</p>
            <p>Thank you for applying to the Orbital One Realty Creator Partner Program.</p>
            <p>Applications are reviewed manually. If your audience and content are a fit, we will contact you with next steps, approved campaign materials, and tracking details.</p>
            <p>Submitting an application does not guarantee approval or create a commission entitlement.</p>
            <p style="margin-top:28px;">Orbital One Realty<br />MiJoy Enterprises LLC</p>
            <p style="font-size:12px;color:#666;margin-top:28px;">Novelty and commemorative products. No legal ownership of lunar real estate.</p>
          </div>
        `,
        text: [
          `Hello ${fullName},`,
          "",
          "Thank you for applying to the Orbital One Realty Creator Partner Program.",
          "Applications are reviewed manually. If your audience and content are a fit, we will contact you with next steps, approved campaign materials, and tracking details.",
          "",
          "Submitting an application does not guarantee approval or create a commission entitlement.",
          "",
          "Orbital One Realty",
          "MiJoy Enterprises LLC",
          "",
          "Novelty and commemorative products. No legal ownership of lunar real estate.",
        ].join("\n"),
      });

    if (confirmationError) {
      console.error(
        "Creator application confirmation email failed:",
        confirmationError
      );
    } else {
      console.log(
        "Creator confirmation email sent:",
        confirmationData?.id || "accepted by Resend"
      );
    }

    return redirectTo(request, "/creators?submitted=1#apply");
  } catch (error) {
    console.error("Creator application route failed:", error);
    return redirectTo(request, "/creators?error=1#apply");
  }
}
