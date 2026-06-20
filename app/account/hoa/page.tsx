import { redirect } from "next/navigation";
import { getSessionUserId } from "../../../lib/session";
import { prisma } from "../../../lib/prisma";

export default async function AccountHoaPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      orders: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const email = user.email;
  const orders = user.orders;
  const firstOrder = orders[0];

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          HOA Membership Dashboard
        </h1>

        <p className="mt-4 text-xl text-gray-300">
          View your Orbital One Realty HOA membership benefits.
        </p>

        {!email ? (
          <div className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
            <p className="text-lg text-gray-300">
              Add your checkout email to the URL to view your HOA membership.
            </p>

            <p className="mt-4 rounded-xl bg-black p-4 text-yellow-400">
              /account/hoa?email=your@email.com
            </p>
          </div>
        ) : !firstOrder ? (
          <div className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
            <p className="text-lg text-gray-300">
              No HOA membership found for this email.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 rounded-3xl border border-yellow-400 bg-white/5 p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
                2026 Founding Member
              </p>

              <h2 className="mt-4 text-4xl font-black">
                {firstOrder.deedName}
              </h2>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm uppercase text-gray-400">
                    Membership Number
                  </p>
                  <p className="mt-2 text-2xl font-black text-yellow-400">
                    HOA-{firstOrder.certificateNumber}
                  </p>
                </div>

                <div>
                  <p className="text-sm uppercase text-gray-400">
                    Member Since
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {firstOrder.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm uppercase text-gray-400">
                    Properties Owned
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>
             <section className="mt-10 rounded-3xl border border-yellow-400/40 bg-white/5 p-8">
  <h2 className="text-3xl font-black text-yellow-400">
    HOA Member Card Preview
  </h2>

  <div className="mt-6 max-w-xl rounded-3xl border-2 border-yellow-400 bg-black p-8 shadow-2xl">
    <p className="text-2xl font-black text-yellow-400">
      ORBITAL ONE REALTY
    </p>

    <p className="mt-2 text-sm font-bold uppercase tracking-[0.25em] text-white">
      2026 Founding HOA Member
    </p>

    <p className="mt-10 text-3xl font-black text-white">
      {firstOrder.deedName}
    </p>

    <p className="mt-6 text-yellow-400">
      Membership No: HOA-{firstOrder.certificateNumber}
    </p>

    <p className="mt-2 text-gray-300">
      Member Since: {firstOrder.createdAt.toLocaleDateString()}
    </p>

    <p className="mt-2 text-gray-300">
      Properties Owned: {orders.length}
    </p>

    <p className="mt-8 text-sm text-yellow-400">
      Free HOA Membership • Lunar Newsletters • Future Member Benefits
    </p>
  </div>
</section>
            <section className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
              <h2 className="text-3xl font-black text-yellow-400">
                HOA Member Benefits
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <p>🌕 Monthly lunar newsletter access</p>
                <p>🚀 Early access to future Orbital One features</p>
                <p>🏠 Future virtual lunar home-building opportunities</p>
                <p>⭐ Member discounts and promotions</p>
                <p>🏛️ 2026 Founding Member recognition</p>
                <p>🛂 Lunar passport and certificate access</p>
              </div>
            </section>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={`/account?email=${encodeURIComponent(email)}`}
                className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
              >
                Back to My Account
              </a>
              <a
                href="/logout"
                className="rounded-xl border border-white/30 px-6 py-3 font-black text-white"
              >
                Logout
              </a>

              <a
                href={`/api/generate-hoa-certificate?propertyId=${firstOrder.propertyId}&deedName=${encodeURIComponent(
                  firstOrder.deedName
                )}&certificateNumber=${encodeURIComponent(
                  firstOrder.certificateNumber
                )}`}
                className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
              >
                Download HOA Certificate
              </a>
              <a
                href={`/api/generate-hoa-member-card?memberName=${encodeURIComponent(
                firstOrder.deedName
                )}&membershipNumber=${encodeURIComponent(
                  `HOA-${firstOrder.certificateNumber}`
                )}&joinDate=${encodeURIComponent(
                firstOrder.createdAt.toLocaleDateString()
                )}&propertiesOwned=${orders.length}`}
                className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
                 >
                 Download HOA Member Card
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}