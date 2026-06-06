import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendOrderEmailParams = {
  to: string;
  deedName: string;
  propertyId: string;
  propertyType: string;
  lunarState: string;
  certificateNumber: string;
  amountPaid: number;
};

export async function sendOrderEmail({
  to,
  deedName,
  propertyId,
  propertyType,
  lunarState,
  certificateNumber,
  amountPaid,
}: SendOrderEmailParams) {
  if (!to) {
    return;
  }

  await resend.emails.send({
    from: "Orbital One Realty <orders@orbitalonerealty.com>",
    to,
    subject: `Your Orbital One Realty Welcome Package - ${certificateNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h1 style="color: #b8962e;">Welcome to Orbital One Realty</h1>

        <p>Congratulations, <strong>${deedName}</strong>!</p>

        <p>Your Lunar Welcome Package is ready.</p>

        <h2>Order Details</h2>
        <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
        <p><strong>Property ID:</strong> ${propertyId}</p>
        <p><strong>Property Type:</strong> ${propertyType}</p>
        <p><strong>Lunar State:</strong> ${lunarState}</p>
        <p><strong>Amount Paid:</strong> $${amountPaid.toFixed(2)}</p>

        <h2>Your Welcome Package Includes</h2>
        <ul>
          <li>Personalized Lunar Property Deed</li>
          <li>Welcome Letter</li>
          <li>Lunar Passport</li>
          <li>HOA Membership Certificate</li>
        </ul>

        <h2>Included HOA Member Benefits</h2>
        <ul>
          <li>Monthly Lunar Newsletters</li>
          <li>Early access to future Orbital One features</li>
          <li>Future virtual home building opportunities</li>
          <li>Member discounts and promotions</li>
          <li>2026 Founding Member status</li>
        </ul>

        <p>
          You can download your documents from the success page after checkout.
        </p>

        <p style="font-size: 12px; color: #555;">
          Orbital One Realty products are novelty and commemorative items only.
          They do not convey legal ownership of lunar real estate.
        </p>
      </div>
    `,
  });
}