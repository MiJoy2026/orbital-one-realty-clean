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
    await prisma.property.update({
      where: {
        id: propertyId,
    },
      data: {
       status: "Sold",
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
    const verificationUrl = `/verify/${certificateNumber}`;
  return (
  <main className="min-h-screen bg-black px-6 py-20 text-white">
    <div className="mx-auto max-w-6xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-400">
        Purchase Complete
      </p>

      <h1 className="mt-4 text-5xl font-black uppercase text-yellow-400">
        Welcome to Orbital One Realty
      </h1>

      <p className="mt-6 text-2xl">
        Congratulations,{" "}
        <span className="font-black text-yellow-400">{deedName}</span>
      </p>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-yellow-400 p-6">
          <p className="text-sm uppercase text-gray-400">Property ID</p>
          <p className="mt-2 text-3xl font-black text-yellow-400">
            {propertyId}
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-400 p-6 md:col-span-2">
          <p className="text-sm uppercase text-gray-400">
            Certificate Number
          </p>
          <p className="mt-2 text-3xl font-black text-yellow-400">
            {certificateNumber}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-yellow-400/40 bg-white/5 p-8">
        <h2 className="text-3xl font-black text-yellow-400">
          Your Lunar Welcome Package Is Ready
        </h2>

        <p className="mt-4 text-gray-300">
          Download your personalized documents below. A copy has also been sent
          to the email address used during checkout.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a
            href={`/api/generate-deed?propertyId=${propertyId}&deedName=${encodeURIComponent(
              deedName
            )}&certificateNumber=${encodeURIComponent(certificateNumber)}`}
            className="rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
          >
            Download Lunar Deed
          </a>

          <a
            href={`/api/generate-welcome-letter?propertyId=${propertyId}&deedName=${encodeURIComponent(
              deedName
            )}&certificateNumber=${encodeURIComponent(certificateNumber)}`}
            className="rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400"
          >
            Download Welcome Letter
          </a>

          <a
            href={`/api/generate-passport?propertyId=${propertyId}&deedName=${encodeURIComponent(
              deedName
            )}&certificateNumber=${encodeURIComponent(certificateNumber)}`}
            className="rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400"
          >
            Download Lunar Passport
          </a>

          <a
            href={`/api/generate-hoa-certificate?propertyId=${propertyId}&deedName=${encodeURIComponent(
              deedName
            )}&certificateNumber=${encodeURIComponent(certificateNumber)}`}
            className="rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400"
          >
            Download HOA Certificate
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-white/20 bg-white/5 p-8">
        <h2 className="text-2xl font-black text-yellow-400">
          Verify Your Certificate
        </h2>

        <p className="mt-4 text-gray-300">
          Your certificate can be verified in the official Orbital One Realty
          registry.
        </p>

        <a
          href={verificationUrl}
          className="mt-6 inline-block rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400"
        >
          Verify Certificate
        </a>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <a
          href="/moon-map"
          className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black"
        >
          Return to Lunar Atlas
        </a>

        <a
          href="/explore"
          className="rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
        >
          Explore More Properties
        </a>
      </div>
    </div>
  </main>
);
}