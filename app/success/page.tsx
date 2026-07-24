import Link from "next/link";
import Stripe from "stripe";

import ClearCartCookie from "../../components/ClearCartCookie";
import LunaScapeImageGallery from "../../components/LunaScapeImageGallery";
import { fulfillStripeCheckoutSession } from "../../lib/fulfillment-service";
import { prisma } from "../../lib/prisma";

function ProcessingMessage({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/40 bg-white/5 p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-400">
          Payment Received
        </p>
        <h1 className="mt-4 text-4xl font-black uppercase text-yellow-400">
          Preparing Your Welcome Package
        </h1>
        <p className="mt-6 text-lg text-gray-300">{message}</p>
        <p className="mt-4 text-sm text-gray-500">
          Your Stripe payment is the source of truth. Refresh this page in a
          moment if fulfillment is still processing.
        </p>
      </div>
    </main>
  );
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id?.trim();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-black text-yellow-400">
          Checkout Session Missing
        </h1>
        <Link
          href="/moon-map"
          className="mt-8 inline-block rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
        >
          Return to the Moon Map
        </Link>
      </main>
    );
  }

  if (!stripeSecretKey) {
    return (
      <ProcessingMessage message="Secure payment verification is temporarily unavailable." />
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("[Orbital One] Unable to retrieve Stripe session.", error);
    return (
      <ProcessingMessage message="We could not retrieve this checkout session yet." />
    );
  }

  if (session.payment_status !== "paid") {
    return (
      <ProcessingMessage message="Stripe has not marked this checkout as paid yet." />
    );
  }

  try {
    await fulfillStripeCheckoutSession(session);
  } catch (error) {
    console.error(
      "[Orbital One] Success-page fulfillment fallback failed.",
      error
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      stripeSessionId: session.id,
    },
    include: {
      propertySnapshot: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (orders.length === 0) {
    return (
      <ProcessingMessage message="Your payment is confirmed and fulfillment is still being recorded." />
    );
  }

  const [properties, allocations] = await Promise.all([
    prisma.property.findMany({
      where: {
        id: { in: orders.map((order) => order.propertyId) },
      },
    }),
    prisma.acreageAllocation.findMany({
      where: {
        certificateNumber: {
          in: orders.map((order) => order.certificateNumber),
        },
      },
    }),
  ]);
  const propertyById = new Map(
    properties.map((property) => [property.id, property])
  );
  const allocationByCertificate = new Map(
    allocations.map((allocation) => [allocation.certificateNumber, allocation])
  );
  const totalPaid = session.amount_total
    ? session.amount_total / 100
    : orders.reduce((sum, order) => sum + order.amountPaid, 0);

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <ClearCartCookie />
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-400">
          Purchase Complete
        </p>
        <h1 className="mt-4 text-5xl font-black uppercase text-yellow-400">
          Welcome to Orbital One Realty
        </h1>
        <p className="mt-6 text-2xl">
          Congratulations, <span className="font-black text-yellow-400">{orders[0].deedName}</span>
        </p>
        <p className="mt-3 text-gray-300">
          {orders.length} {orders.length === 1 ? "property has" : "properties have"} been recorded. Total paid: ${totalPaid.toFixed(2)}.
        </p>

        <div className="mt-10 space-y-8 text-left">
          {orders.map((order) => {
            const property = propertyById.get(order.propertyId);
            const allocation = allocationByCertificate.get(
              order.certificateNumber
            );
            const assignedAcreRange = allocation
              ? allocation.startingAcre === allocation.endingAcre
                ? `Acre ${allocation.startingAcre.toLocaleString()}`
                : `Acres ${allocation.startingAcre.toLocaleString()} through ${allocation.endingAcre.toLocaleString()}`
              : "";
            const certificateQuery = encodeURIComponent(
              order.certificateNumber
            );
            const location = [property?.city, property?.town, property?.state]
              .filter(Boolean)
              .join(" • ");

            return (
              <section
                key={order.id}
                className="overflow-hidden rounded-3xl border border-yellow-400/40 bg-white/5"
              >
                {order.propertySnapshot && (
                  <LunaScapeImageGallery
                    snapshotId={order.propertySnapshot.id}
                    propertyId={order.propertyId}
                    compact
                  />
                )}
                <div className="p-8">
                <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                      {order.propertyType}
                    </p>
                    <h2 className="mt-2 break-words text-3xl font-black text-yellow-400">
                      {order.propertyId}
                    </h2>
                    <p className="mt-3 text-gray-300">
                      {location || order.lunarState} · {property?.size || "Recorded property"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/30 p-4">
                    <p className="text-xs uppercase text-gray-500">Certificate</p>
                    <p className="mt-2 break-all font-black text-yellow-400">
                      {order.certificateNumber}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Recorded value: ${order.amountPaid.toFixed(2)}
                    </p>
                  </div>
                </div>

                {assignedAcreRange && (
                  <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
                    <p className="font-black text-yellow-400">{assignedAcreRange}</p>
                  </div>
                )}

                <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <a
                    href={`/api/generate-deed?certificateNumber=${certificateQuery}`}
                    className="rounded-xl bg-yellow-400 px-4 py-3 text-center font-black text-black"
                  >
                    Lunar Deed
                  </a>
                  <a
                    href={`/api/generate-welcome-letter?certificateNumber=${certificateQuery}`}
                    className="rounded-xl border border-yellow-400 px-4 py-3 text-center font-black text-yellow-400"
                  >
                    Welcome Letter
                  </a>
                  <a
                    href={`/api/generate-hoa-certificate?certificateNumber=${certificateQuery}`}
                    className="rounded-xl border border-yellow-400 px-4 py-3 text-center font-black text-yellow-400"
                  >
                    HOA Certificate
                  </a>
                  {order.passportPurchased && (
                    <a
                      href={`/api/generate-passport?certificateNumber=${certificateQuery}`}
                      className="rounded-xl border border-yellow-400 px-4 py-3 text-center font-black text-yellow-400"
                    >
                      Lunar Passport
                    </a>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/verify/${certificateQuery}`}
                    className="text-sm font-black text-yellow-400 hover:underline"
                  >
                    Verify this certificate →
                  </Link>
                  {order.propertySnapshot && (
                    <a
                      href={`/api/property-image/${order.propertySnapshot.id}?view=scenic&download=1`}
                      className="rounded-xl border border-white/30 px-4 py-2 text-sm font-black text-white"
                    >
                      Download Scenic View
                    </a>
                  )}
                </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/moon-map"
            className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black"
          >
            Return to Lunar Atlas
          </Link>
          <Link
            href="/account"
            className="rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
          >
            View My Account
          </Link>
        </div>
      </div>
    </main>
  );
}
