import { Resend } from "resend";

import { getAppUrl } from "./app-url";
import { createCustomerClaimTokenForEmail } from "./customer-access-token";

type OrderEmailItem = {
  propertyId: string;
  propertyType: string;
  propertySize: string;
  lunarState: string;
  cityName: string | null;
  townName: string | null;
  certificateNumber: string;
  propertySnapshotId?: string | null;
};

type SendOrderEmailParams = {
  to: string[];
  deedName: string;
  accountEmail: string;
  amountPaid: number;
  passportPurchased: boolean;
  giftMessage: string | null;
  items: OrderEmailItem[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPropertySections(
  appUrl: string,
  items: OrderEmailItem[],
  passportPurchased: boolean
): string {
  return items
    .map((item) => {
      const certificateQuery = encodeURIComponent(item.certificateNumber);
      const location = [item.cityName, item.townName, item.lunarState]
        .filter(Boolean)
        .join(" • ");

      return `
        <div style="border:1px solid #ddd; border-radius:12px; padding:18px; margin:18px 0;">
          <h2 style="margin-top:0; color:#b8962e;">${escapeHtml(
            item.propertyId
          )}</h2>
          <p><strong>Certificate Number:</strong> ${escapeHtml(
            item.certificateNumber
          )}</p>
          <p><strong>Property Type:</strong> ${escapeHtml(
            item.propertyType
          )}</p>
          <p><strong>Property Size:</strong> ${escapeHtml(
            item.propertySize
          )}</p>
          <p><strong>Location:</strong> ${escapeHtml(location)}</p>
          <p><a href="${appUrl}/verify/${certificateQuery}">Verify Certificate</a></p>
          <ul>
            <li><a href="${appUrl}/api/generate-deed?certificateNumber=${certificateQuery}">Download Lunar Property Deed</a></li>
            <li><a href="${appUrl}/api/generate-welcome-letter?certificateNumber=${certificateQuery}">Download Welcome Letter</a></li>
            <li><a href="${appUrl}/api/generate-hoa-certificate?certificateNumber=${certificateQuery}">Download HOA Membership Certificate</a></li>
            ${
              item.propertySnapshotId
                ? `<li><a href="${appUrl}/api/property-image/${encodeURIComponent(
                    item.propertySnapshotId
                  )}?view=scenic&download=1&v=exact-parcel-3">Download Your Place on the Moon</a></li>
                   <li><a href="${appUrl}/api/property-image/${encodeURIComponent(
                    item.propertySnapshotId
                  )}?view=virtual&download=1&v=virtual-scene-1">Download Your LunaScape Property</a></li>`
                : ""
            }
            ${
              passportPurchased
                ? `<li><a href="${appUrl}/api/generate-passport?certificateNumber=${certificateQuery}">Download Lunar Passport</a></li>`
                : ""
            }
          </ul>
        </div>
      `;
    })
    .join("");
}

export async function sendOrderEmail({
  to,
  deedName,
  accountEmail,
  amountPaid,
  passportPurchased,
  giftMessage,
  items,
}: SendOrderEmailParams) {
  const recipients = Array.from(
    new Set(to.map((email) => email.trim().toLowerCase()).filter(Boolean))
  );
  const normalizedAccountEmail = accountEmail.trim().toLowerCase();
  const resendApiKey = process.env.RESEND_API_KEY;

  if (recipients.length === 0 || items.length === 0 || !resendApiKey) {
    return;
  }

  const appUrl = getAppUrl();
  const resend = new Resend(resendApiKey);
  const propertySections = buildPropertySections(
    appUrl,
    items,
    passportPurchased
  );

  await Promise.all(
    recipients.map(async (recipient) => {
      let accountAccessSection = "";

      if (recipient === normalizedAccountEmail) {
        const claimToken = await createCustomerClaimTokenForEmail(
          normalizedAccountEmail,
          "7d"
        );
        const claimUrl = new URL("/register", appUrl);
        claimUrl.searchParams.set("token", claimToken);

        accountAccessSection = `
          <div style="border:1px solid #b8962e;border-radius:12px;padding:18px;margin:22px 0;background:#fffbea;">
            <h2 style="margin-top:0;color:#8a6f16;">Activate Your Secure Customer Account</h2>
            <p>Use this verified email link to create or recover your password and connect this purchase to your private customer portal.</p>
            <p style="margin:22px 0;">
              <a
                href="${claimUrl.toString()}"
                style="display:inline-block;background:#facc15;color:#111;padding:14px 22px;border-radius:10px;font-weight:700;text-decoration:none;"
              >
                Activate or Recover My Account
              </a>
            </p>
            <p style="font-size:13px;color:#555;">This secure account link expires in 7 days and becomes invalid after your password is set.</p>
          </div>
        `;
      }

      const result = await resend.emails.send({
        from: "Orbital One Realty <orders@orbitalonerealty.com>",
        to: recipient,
        subject: `Your Orbital One Realty Welcome Package - ${items.length} ${
          items.length === 1 ? "Property" : "Properties"
        }`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
            <h1 style="color:#b8962e;">Welcome to Orbital One Realty</h1>
            <p>Congratulations, <strong>${escapeHtml(deedName)}</strong>!</p>
            <p>Your Lunar Welcome Package is ready for ${items.length} ${
              items.length === 1 ? "property" : "properties"
            }.</p>
            ${
              giftMessage
                ? `<div style="border-left:4px solid #b8962e;padding-left:14px;margin:18px 0;"><strong>Gift Message:</strong><br>${escapeHtml(
                    giftMessage
                  )}</div>`
                : ""
            }
            <p><strong>Total Amount Paid:</strong> $${amountPaid.toFixed(2)}</p>
            ${accountAccessSection}
            ${propertySections}
            <h2>Included HOA Member Benefits</h2>
            <ul>
              <li>Lunar newsletters and future updates</li>
              <li>Early access to future Orbital One features</li>
              <li>Future virtual home-building and property enhancements</li>
              <li>Member discounts and priority access</li>
              <li>2026 Founding and Charter Member recognition</li>
            </ul>
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
    })
  );
}
