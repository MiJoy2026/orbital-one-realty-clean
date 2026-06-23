import Image from "next/image";
import { prisma } from "../../../lib/prisma";
import { sampleProperties } from "../../../lib/moon-data";

export default async function PropertyExplorerPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;

  const property = sampleProperties.find(
    (item) => item.id.toLowerCase() === propertyId.toLowerCase()
  );

  if (!property) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">Property Not Found</h1>
        <a href="/explore" className="mt-8 inline-block text-yellow-400">
          Back to Explore
        </a>
      </main>
    );
  }

  const dbProperty = await prisma.property.findUnique({
    where: {
      id: property.id,
    },
  });

  const liveStatus = dbProperty?.status || property.status;
  const isSold = liveStatus === "Sold";
  const isRuralAcre = property.type === "Rural Acre";
  const propertyImage =
  property.type === "City Block"
    ? "/property-images/city-block.jpg"
    : property.type === "Town Block"
    ? "/property-images/town-block.jpg"
    : "/property-images/rural-acre.jpg";
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <Image
          src={propertyImage}
          alt={property.type}
          width={1200}
          height={650}
          className="mb-10 h-[420px] w-full rounded-3xl border border-yellow-400/30 object-cover"
        />
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-400">
  <a href="/moon-map" className="hover:text-yellow-400">
    Moon Atlas
  </a>

  <span>›</span>

  <a
    href={`/states/${encodeURIComponent(property.state)}`}
    className="hover:text-yellow-400"
  >
    {property.state}
  </a>

  {property.city && (
    <>
      <span>›</span>

      <a
        href={`/cities/${encodeURIComponent(property.city)}`}
        className="hover:text-yellow-400"
      >
        {property.city}
      </a>
    </>
  )}

  {property.town && (
    <>
      <span>›</span>

      <a
        href={`/towns/${encodeURIComponent(property.town)}`}
        className="hover:text-yellow-400"
      >
        {property.town}
      </a>
    </>
  )}

  <span>›</span>

  <span className="font-bold text-yellow-400">
    {property.id}
  </span>
</div>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-400">
          Orbital One Realty Property
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-6xl font-black uppercase text-yellow-400">
              {property.id}
            </h1>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {property.type} · {property.size}
            </p>
        </div>

        <div
          className={`rounded-full px-5 py-3 text-sm font-black uppercase ${
            isSold
              ? "bg-red-600 text-white"
              : "bg-green-500 text-black"
          }`}
        >
          {liveStatus}
        </div>
      </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-yellow-400 p-6">
            <p className="text-sm uppercase text-gray-400">Price</p>
            <p className="mt-2 text-4xl font-black text-yellow-400">
              ${property.price.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Location
            </p>

            <p className="mt-2 text-xl font-black">
              {property.city || property.town || property.state}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 p-6">
            <p className="text-sm uppercase text-gray-400">State</p>
            <p className="mt-2 text-2xl font-black">{property.state}</p>
          </div>

          <div className="rounded-2xl border border-white/20 p-6">
            <p className="text-sm uppercase text-gray-400">Status</p>
            <p
              className={`mt-2 text-2xl font-black ${
                isSold ? "text-red-400" : "text-green-400"
              }`}
            >
              {liveStatus}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Status synced from live inventory database.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
          <h2 className="text-3xl font-black text-yellow-400">
            Property Overview
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            This {property.size} {property.type} in the lunar state of{" "}
            {property.state} is a novelty keepsake property designed for gifts,
            collectors, space enthusiasts, and anyone who wants a fun connection
            to the Moon. Each purchase includes personalized digital documents
            and entry into the Orbital One Realty registry.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
          <h2 className="text-3xl font-black text-yellow-400">
            Property Location
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <p>
              <span className="font-bold text-gray-400">State:</span>{" "}
              {property.state}
            </p>

            {property.city && (
              <p>
                <span className="font-bold text-gray-400">City:</span>{" "}
                {property.city}
              </p>
            )}

            {property.town && (
              <p>
                <span className="font-bold text-gray-400">Town:</span>{" "}
                {property.town}
              </p>
            )}
          </div>
        </div>
          <div className="mt-10 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-8">
            <h2 className="text-3xl font-black text-yellow-400">
               Moon Atlas Location
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                 <p className="text-sm uppercase text-gray-400">State</p>
                 <p className="mt-2 text-xl font-black">
                   {property.state}
                 </p>
              </div>

              {property.city && (
                <div>
                  <p className="text-sm uppercase text-gray-400">City</p>
                  <p className="mt-2 text-xl font-black">
                    {property.city}
                  </p>
                </div>
              )}

              {property.town && (
               <div>
                 <p className="text-sm uppercase text-gray-400">Town</p>
                 <p className="mt-2 text-xl font-black">
                   {property.town}
                 </p>
               </div>
              )}
            </div>

            <div className="mt-8">
              <a
                href="/moon-map"
                className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
              >
                View on Moon Atlas
              </a>
            </div>
          </div>

        <div className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8">
          <h2 className="text-3xl font-black text-yellow-400">
            Nearby Lunar Attractions
          </h2>

          <div className="mt-6 flex flex-wrap gap-3">
            {property.nearbyAttractions.map((attraction) => (
              <span
                key={attraction}
                className="rounded-full border border-yellow-400 px-4 py-2 text-sm font-bold text-yellow-400"
              >
                {attraction}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-8">
          <h2 className="text-3xl font-black text-yellow-400">
            Included With This Property
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <p>📜 Personalized Novelty Lunar Deed</p>
            <p>🛂 Lunar Passport Eligibility</p>
            <p>🏛️ Free HOA Membership</p>
            <p>⭐ 2026 Founding Member Status</p>
            <p>✉️ Welcome Letter PDF</p>
            <p>🌕 Certificate Verification</p>
          </div>

          <div className="mt-10 rounded-3xl border-2 border-yellow-400 bg-black p-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
              Certificate Preview
            </p>

            <h2 className="mt-4 text-3xl font-black text-yellow-400">
              Orbital One Realty
            </h2>

            <p className="mt-6 text-lg">Novelty Lunar Property Certificate</p>

            <div className="mt-8 space-y-3">
              <p>
                <span className="font-bold text-yellow-400">
                  Certificate Number:
                </span>{" "}
                PREVIEW-{property.id}
              </p>

              <p>
                <span className="font-bold text-yellow-400">Property:</span>{" "}
                {property.id}
              </p>

              <p>
                <span className="font-bold text-yellow-400">State:</span>{" "}
                {property.state}
              </p>

              <p>
                <span className="font-bold text-yellow-400">Size:</span>{" "}
                {property.size}
              </p>
            </div>

            <p className="mt-8 text-sm text-gray-400">
              Preview Only • Final certificate generated after purchase
            </p>
          </div>
        </div>

        {isRuralAcre && !isSold && (
          <div className="mt-8 rounded-2xl border border-yellow-400/30 p-6">
            <h3 className="text-xl font-black text-yellow-400">
              Choose Your Acreage
            </h3>

            <p className="mt-2 text-gray-300">
              Select the amount of rural lunar acreage you would like to
              purchase.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <a
                href={`/cart?propertyId=${property.id}&acres=0.5`}
                className="rounded-xl border border-white/20 p-4 hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                1/2 Acre — $16.95
              </a>

              <a
                href={`/cart?propertyId=${property.id}&acres=1`}
                className="rounded-xl border border-white/20 p-4 hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                1 Acre — $24.95
              </a>

              <a
                href={`/cart?propertyId=${property.id}&acres=2`}
                className="rounded-xl border border-white/20 p-4 hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                2 Acres — $32.90
              </a>

              <a
                href={`/cart?propertyId=${property.id}&acres=3`}
                className="rounded-xl border border-white/20 p-4 hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                3 Acres — $40.85
              </a>

              <a
                href={`/cart?propertyId=${property.id}&acres=5`}
                className="rounded-xl border border-white/20 p-4 hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                5 Acres — $56.75
              </a>

              <a
                href={`/cart?propertyId=${property.id}&acres=10`}
                className="rounded-xl border border-white/20 p-4 hover:border-yellow-400 hover:bg-yellow-400/10"
              >
                10 Acres — $96.50
              </a>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          {!isSold && !isRuralAcre ? (
            <a
              href={`/cart?propertyId=${property.id}`}
              className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black"
            >
              Purchase This Property
            </a>
          ) : isSold ? (
            <div className="rounded-xl bg-red-600 px-8 py-4 font-black text-white">
              Sold
            </div>
          ) : null}

          <a
            href={`/states/${encodeURIComponent(property.state)}`}
            className="rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
          >
            Back to State
          </a>

          <a
            href="/moon-map"
            className="rounded-xl border border-white/30 px-8 py-4 font-black text-white"
          >
            Back to Lunar Atlas
          </a>
        </div>
      </div>
    </main>
  );
}