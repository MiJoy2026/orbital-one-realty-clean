import { prisma } from "../../../lib/prisma";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateNumber: string }>;
}) {
  const resolvedParams = await params;

  const order = await prisma.order.findUnique({
    where: {
      certificateNumber: resolvedParams.certificateNumber,
    },
  });

  if (!order) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-center text-white">
        <h1 className="text-5xl font-black uppercase text-red-500">
          Certificate Not Found
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-300">
          We could not find this certificate number in the Orbital One Realty
          registry.
        </p>

        <a
          href="/"
          className="mt-10 inline-block rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
        >
          Return Home
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-yellow-400/40 bg-white/5 p-10 text-center">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Certificate Verified
        </h1>

        <p className="mt-6 text-xl text-gray-300">
          This certificate is recorded in the Orbital One Realty registry.
        </p>

        <div className="mt-10 rounded-2xl border border-white/20 p-8 text-left">
          <p className="text-sm uppercase text-gray-400">Certificate Number</p>
          <p className="mt-2 text-3xl font-black text-yellow-400">
            {order.certificateNumber}
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase text-gray-400">
                Certificate Holder
              </p>
              <p className="mt-2 text-xl font-bold">{order.deedName}</p>
            </div>

            <div>
              <p className="text-sm uppercase text-gray-400">Property ID</p>
              <p className="mt-2 text-xl font-bold">{order.propertyId}</p>
            </div>
            <div>
              <p className="text-sm uppercase text-gray-400">Property Type</p>
              <p className="mt-2 text-xl font-bold">{order.propertyType}</p>
            </div>

               {order.acreagePurchased && (
            <div>
              <p className="text-sm uppercase text-gray-400">Acreage Purchased</p>
              <p className="mt-2 text-xl font-bold">
               {order.acreagePurchased} Acre
               {order.acreagePurchased === 1 ? "" : "s"}
            </p>
            </div>
)}

            <div>
              <p className="text-sm uppercase text-gray-400">Lunar State</p>
              <p className="mt-2 text-xl font-bold">{order.lunarState}</p>
            </div>

            <div>
              <p className="text-sm uppercase text-gray-400">Issued</p>
              <p className="mt-2 text-xl font-bold">
                {order.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <a
          href="/explore"
          className="mt-10 inline-block rounded-xl bg-yellow-400 px-8 py-4 font-black text-black"
        >
          Explore Lunar Properties
        </a>
      </div>
    </main>
  );
}