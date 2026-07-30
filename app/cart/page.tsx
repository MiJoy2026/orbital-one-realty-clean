import Link from "next/link";
import { cookies } from "next/headers";

import CartCheckoutPanel from "../../components/CartCheckoutPanel";
import ClearCartCookie from "../../components/ClearCartCookie";
import {
  CART_RESERVATION_COOKIE,
  normalizeReservationIds,
  parseReservationCookie,
} from "../../lib/cart-reservations";
import {
  getCanonicalPropertyPrice,
  isPurchasablePropertyType,
} from "../../lib/purchase-constants";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

type CartItem = {
  reservationId: string;
  expiresAt: string;
  propertyId: string;
  propertyType: string;
  propertySize: string;
  stateName: string;
  cityName: string | null;
  townName: string | null;
  price: number;
};

function EmptyCart() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <ClearCartCookie />
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/20 bg-white/5 p-10 text-center">
        <h1 className="text-4xl font-black text-yellow-400">
          Your Cart Is Empty
        </h1>
        <p className="mt-5 text-gray-300">
          Select and reserve Rural Acres, City Blocks, or Town Blocks on the
          Moon Map. You can combine up to ten active property reservations in
          one secure checkout.
        </p>
        <Link
          href="/moon-map"
          className="mt-8 inline-block rounded-xl bg-yellow-400 px-7 py-4 font-black text-black"
        >
          Choose Properties
        </Link>
      </div>
    </main>
  );
}

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ reservationId?: string | string[] }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieReservationIds = parseReservationCookie(
    cookieStore.get(CART_RESERVATION_COOKIE)?.value
  );
  const queryReservationIds = normalizeReservationIds(
    params.reservationId
  );
  const reservationIds = normalizeReservationIds([
    ...cookieReservationIds,
    ...queryReservationIds,
  ]);

  if (reservationIds.length === 0) {
    return <EmptyCart />;
  }

  const now = new Date();
  const reservations = await prisma.propertyReservation.findMany({
    where: {
      id: { in: reservationIds },
      status: "Reserved",
      expiresAt: { gt: now },
    },
  });

  if (reservations.length === 0) {
    return <EmptyCart />;
  }

  const properties = await prisma.property.findMany({
    where: {
      id: {
        in: reservations.map((reservation) => reservation.parcelKey),
      },
      status: {
        not: "Sold",
      },
    },
  });
  const propertyById = new Map(
    properties.map((property) => [property.id, property])
  );
  const reservationById = new Map(
    reservations.map((reservation) => [reservation.id, reservation])
  );

  const items: CartItem[] = reservationIds.flatMap((reservationId) => {
    const reservation = reservationById.get(reservationId);

    if (!reservation) {
      return [];
    }

    const property = propertyById.get(reservation.parcelKey);

    if (!property || !isPurchasablePropertyType(property.type)) {
      return [];
    }

    return [
      {
        reservationId: reservation.id,
        expiresAt: reservation.expiresAt.toISOString(),
        propertyId: property.id,
        propertyType: property.type,
        propertySize: property.size,
        stateName: property.state,
        cityName: property.city,
        townName: property.town,
        price: getCanonicalPropertyPrice(property.type),
      },
    ];
  });

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
          Reserved Properties
        </p>
        <h1 className="mt-3 text-5xl font-black">Shopping Cart</h1>
        <p className="mt-4 text-gray-300">
          Each property keeps its own permanent ID, deed, certificate, and HOA
          record. All active reservations below can be paid together in one
          Stripe checkout.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-5">
            {items.map((item) => {
              const location = [
                item.cityName,
                item.townName,
                item.stateName,
              ]
                .filter(Boolean)
                .join(" • ");

              return (
                <article
                  key={item.reservationId}
                  className="rounded-3xl border border-white/20 bg-white/5 p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                        {item.propertyType}
                      </p>
                      <h2 className="mt-2 break-words text-2xl font-black text-yellow-400">
                        {item.propertyId}
                      </h2>
                    </div>
                    <p className="text-2xl font-black">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-bold text-gray-500">Size:</span>{" "}
                      {item.propertySize}
                    </p>
                    <p>
                      <span className="font-bold text-gray-500">Location:</span>{" "}
                      {location}
                    </p>
                  </div>
                </article>
              );
            })}

            <Link
              href="/moon-map"
              className="inline-block rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
            >
              + Reserve Another Property
            </Link>
          </section>

          <aside className="rounded-3xl border border-yellow-400/40 bg-white/5 p-8">
            <h2 className="text-3xl font-black">Order Summary</h2>
            <CartCheckoutPanel items={items} />
          </aside>
        </div>
      </div>
    </main>
  );
}
