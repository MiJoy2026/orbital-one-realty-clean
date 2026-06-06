import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { sendOrderEmail } from "../../lib/send-order-email";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  let propertyId = "R-001";
  let deedName = "Deed Recipient";
  let certificateNumber = "OOR-2026-000000";

  if (params.session_id) {
    const session = await stripe.checkout.sessions.retrieve(params.session_id);

    propertyId = session.metadata?.propertyId || propertyId;
    deedName = session.metadata?.deedName || deedName;

    const propertyType = session.metadata?.propertyType || "Unknown";
    const lunarState = session.metadata?.state || "Unknown";
    const orderCount = await prisma.order.count();

    certificateNumber = `OOR-2026-${String(orderCount + 1).padStart(
  6,
  "0"
)}`;
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
    const paymentStatus = session.payment_status || "unknown";
    const email = session.customer_details?.email || null;

    await prisma.order.upsert({
      where: {
        stripeSessionId: session.id,
      },
      update: {},
      create: {
        stripeSessionId: session.id,
        propertyId,
        propertyType,
        lunarState,
        deedName,
        certificateNumber,
        amountPaid,
        paymentStatus,
        email,
        premiumGoldSeal: true,
      },
    });

    await sendOrderEmail({
      to: email || "",
      deedName,
      propertyId,
      propertyType,
      lunarState,
      certificateNumber,
      amountPaid,
    });
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-center text-white">
      <h1 className="text-5xl font-black uppercase text-yellow-400">
        Welcome to Orbital One Realty
      </h1>

      <p className="mt-6 text-2xl text-white">
        Congratulations,
        <span className="ml-2 font-black text-yellow-400">{deedName}</span>
      </p>

      <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300">
        Your purchase has been successfully recorded and your Lunar Welcome
        Package is ready for download.
      </p>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-yellow-400/30 bg-white/5 p-8 text-left">
        <h2 className="text-2xl font-black text-yellow-400">
          Your Welcome Package Includes
        </h2>

        <div className="mt-6 space-y-3 text-lg">
          <p>📜 Personalized Lunar Property Deed</p>
          <p>✉️ Welcome Letter</p>
          <p>🛂 Lunar Passport</p>
          <p>🏛️ HOA Membership Certificate</p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-yellow-400/30 bg-white/5 p-8 text-left">
        <h2 className="text-2xl font-black text-yellow-400">
          Included HOA Member Benefits
        </h2>

        <div className="mt-6 space-y-3">
          <p>🌕 Monthly Lunar Newsletters</p>
          <p>🚀 Early Access to Future Orbital One Features</p>
          <p>🏠 Future Virtual Home Building Opportunities</p>
          <p>⭐ Member Discounts and Promotions</p>
          <p>🏛️ 2026 Founding Member Status</p>
        </div>
      </div>

      <a
        href={`/api/generate-deed?propertyId=${propertyId}&deedName=${encodeURIComponent(
         deedName
        )}&certificateNumber=${encodeURIComponent(certificateNumber)}`}
        className="mt-10 inline-block rounded-xl bg-yellow-400 px-8 py-4 font-black text-black"
      >
        Download Personalized Novelty Deed PDF
      </a>

      <br />
      <br />

      <a
        href={`/api/generate-welcome-letter?propertyId=${propertyId}&deedName=${encodeURIComponent(
         deedName
        )}&certificateNumber=${encodeURIComponent(certificateNumber)}`}
         className="mt-4 inline-block rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
       >

        Download Welcome Letter PDF
      </a>

      <br />
      <br />

      <a
        href={`/api/generate-passport?propertyId=${propertyId}&deedName=${encodeURIComponent(
         deedName
        )}&certificateNumber=${encodeURIComponent(certificateNumber)}`}
        className="mt-4 inline-block rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
      >
        Download Lunar Passport PDF
      </a>

      <br />
      <br />

      <a
        href={`/api/generate-hoa-certificate?propertyId=${propertyId}&deedName=${encodeURIComponent(
         deedName
        )}&certificateNumber=${encodeURIComponent(certificateNumber)}`}
        className="mt-4 inline-block rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
      >
        Download HOA Membership Certificate
      </a>

      <br />
      <br />

      <a
        href="/explore"
        className="mt-6 inline-block rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
      >
        Explore More Properties
      </a>
    </main>
  );
}