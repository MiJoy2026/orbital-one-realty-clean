import { Resend } from "resend";
import { NextResponse } from "next/server";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not configured");
}

const resend = new Resend(apiKey);

export async function GET() {
  const result = await resend.emails.send({
    from: "Orbital One Realty <onboarding@resend.dev>",
    to: "mijoy.enterprises@gmail.com",
    subject: "Orbital One Realty Test Email",
    html: `
      <h1>Orbital One Realty</h1>
      <p>This is a test email from your website.</p>
      <p>If you received this, Resend is connected successfully.</p>
    `,
  });

  return NextResponse.json(result);
}