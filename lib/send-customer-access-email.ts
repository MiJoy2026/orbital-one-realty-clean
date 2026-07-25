import { Resend } from "resend";

import { getAppUrl } from "./app-url";
import { createCustomerClaimTokenForEmail } from "./customer-access-token";

export async function sendCustomerAccessEmail(
  emailAddress: string,
  expirationTime: string | number | Date = "30m"
): Promise<void> {
  const email = emailAddress.trim().toLowerCase();
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const token = await createCustomerClaimTokenForEmail(email, expirationTime);
  const accessUrl = new URL("/register", getAppUrl());
  accessUrl.searchParams.set("token", token);

  const resend = new Resend(resendApiKey);
  const result = await resend.emails.send({
    from: "Orbital One Realty <orders@orbitalonerealty.com>",
    to: email,
    subject: "Secure access to your Orbital One Realty account",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
        <h1 style="color:#b8962e;">Orbital One Realty Account Access</h1>
        <p>Use the secure button below to activate or recover your customer account.</p>
        <p style="margin:28px 0;">
          <a
            href="${accessUrl.toString()}"
            style="display:inline-block;background:#facc15;color:#111;padding:14px 22px;border-radius:10px;font-weight:700;text-decoration:none;"
          >
            Activate or Recover My Account
          </a>
        </p>
        <p>This secure link expires in 30 minutes and becomes invalid after your password is set.</p>
        <p>If you did not request this email, you may safely ignore it.</p>
        <p style="font-size:12px;color:#555;">
          Orbital One Realty products are novelty and commemorative items only.
          They do not convey legal ownership of lunar real estate.
        </p>
      </div>
    `,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}
