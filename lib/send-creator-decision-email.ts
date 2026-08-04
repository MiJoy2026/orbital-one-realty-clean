import { Resend } from "resend";

type ApprovedCreatorDecision = {
  kind: "approved";
  to: string;
  fullName: string;
  trackingCode: string;
};

type RejectedCreatorDecision = {
  kind: "rejected";
  to: string;
  fullName: string;
};

type CreatorDecision =
  | ApprovedCreatorDecision
  | RejectedCreatorDecision;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendCreatorDecisionEmail(
  decision: CreatorDecision
): Promise<string | null> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(resendApiKey);
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.orbitalonerealty.com"
  ).replace(/\/+$/, "");

  const safeName = escapeHtml(decision.fullName);

  if (decision.kind === "approved") {
    const trackingLink =
      `${appUrl}/?ref=${encodeURIComponent(decision.trackingCode)}`;
    const termsLink = `${appUrl}/creators/terms`;

    const { data, error } = await resend.emails.send({
      from: "Orbital One Creator Partners <orders@orbitalonerealty.com>",
      to: [decision.to],
      subject: "Welcome to the Orbital One Realty Creator Partner Program",
      tags: [{ name: "category", value: "creator_approval" }],
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:680px;margin:0 auto;">
          <h1 style="color:#9a7614;">Your application has been approved</h1>

          <p>Hello ${safeName},</p>

          <p>
            Welcome to the Orbital One Realty Creator Partner Program.
            Your unique referral link is now active.
          </p>

          <div style="margin:24px 0;padding:18px;border:1px solid #d4af37;border-radius:12px;background:#fffaf0;">
            <p style="margin:0 0 8px;font-weight:bold;">Your creator link</p>
            <p style="margin:0;word-break:break-all;">
              <a href="${trackingLink}">${trackingLink}</a>
            </p>

            <p style="margin:16px 0 0;">
              <strong>Tracking code:</strong>
              ${escapeHtml(decision.trackingCode)}
            </p>
          </div>

          <p>
            The standard referral window is 30 days when the visitor permits
            optional tracking. Commission is calculated according to the
            qualifying monthly sales tiers described in the program terms:
            20% for sales 1-24, 25% for sales 25-99, and 30% for sales 100 and above.
          </p>

          <p>
            Clearly disclose that you may earn a commission whenever you promote
            Orbital One Realty. Describe all products as novelty and commemorative
            products that do not convey legally recognized ownership of lunar real estate.
          </p>

          <p>
            Review the current
            <a href="${termsLink}">Creator Partner Program Terms</a>
            before beginning promotion.
          </p>

          <p style="margin-top:28px;">
            Orbital One Realty<br />
            MiJoy Enterprises LLC
          </p>
        </div>
      `,
      text: [
        `Hello ${decision.fullName},`,
        "",
        "Your Orbital One Realty Creator Partner application has been approved.",
        "",
        `Your creator link: ${trackingLink}`,
        `Tracking code: ${decision.trackingCode}`,
        "",
        "The standard referral window is 30 days when the visitor permits optional tracking.",
        "Commission tiers are 20% for qualifying monthly sales 1-24, 25% for sales 25-99, and 30% for sales 100 and above.",
        "",
        "Clearly disclose that you may earn a commission. Orbital One Realty products are novelty and commemorative products and do not convey legally recognized ownership of lunar real estate.",
        "",
        `Program terms: ${termsLink}`,
        "",
        "Orbital One Realty",
        "MiJoy Enterprises LLC",
      ].join("\n"),
    });

    if (error) {
      throw new Error(
        `Creator approval email failed: ${error.message}`
      );
    }

    return data?.id || null;
  }

  const { data, error } = await resend.emails.send({
    from: "Orbital One Creator Partners <orders@orbitalonerealty.com>",
    to: [decision.to],
    subject: "Update on your Orbital One Realty creator application",
    tags: [{ name: "category", value: "creator_rejection" }],
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px;margin:0 auto;">
        <h1 style="color:#9a7614;">Creator application update</h1>

        <p>Hello ${safeName},</p>

        <p>
          Thank you for your interest in the Orbital One Realty Creator Partner Program.
          After reviewing your application, we are unable to approve it at this time.
        </p>

        <p>
          Program participation depends on current audience fit, content alignment,
          brand-safety considerations, and available program capacity.
        </p>

        <p>
          We appreciate the time you took to apply.
        </p>

        <p style="margin-top:28px;">
          Orbital One Realty<br />
          MiJoy Enterprises LLC
        </p>
      </div>
    `,
    text: [
      `Hello ${decision.fullName},`,
      "",
      "Thank you for your interest in the Orbital One Realty Creator Partner Program.",
      "After reviewing your application, we are unable to approve it at this time.",
      "",
      "Program participation depends on current audience fit, content alignment, brand-safety considerations, and available program capacity.",
      "",
      "We appreciate the time you took to apply.",
      "",
      "Orbital One Realty",
      "MiJoy Enterprises LLC",
    ].join("\n"),
  });

  if (error) {
    throw new Error(
      `Creator rejection email failed: ${error.message}`
    );
  }

  return data?.id || null;
}