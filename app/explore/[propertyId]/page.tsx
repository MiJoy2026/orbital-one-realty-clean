import { sampleProperties } from "../../../lib/moon-data";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const resolvedParams = await params;
  const propertyId = resolvedParams.propertyId;

  const property = sampleProperties.find(
    (item) => item.id.toLowerCase() === propertyId.toLowerCase()
  );

  if (!property) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="text-5xl font-black">Property Not Found</h1>
        <p className="mt-4">Property ID requested: {propertyId}</p>
        <a href="/explore" className="mt-8 inline-block text-yellow-400">
          Back to Explore
        </a>
      </main>
    );
  }

  const isSold = property.status === "Sold";

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/20 p-8">
        <h1 className="text-5xl font-black uppercase">{property.id}</h1>

        <p className="mt-4 text-2xl text-yellow-400">{property.type}</p>

        <p className="mt-6">State: {property.state}</p>
        <p>Size: {property.size}</p>
        <p>Price: ${property.price.toFixed(2)}</p>

        <p className="mt-4">
          Status:{" "}
          <span className={isSold ? "text-red-400" : "text-green-400"}>
            {property.status}
          </span>
        </p>

        <h2 className="mt-8 text-2xl font-bold text-yellow-400">
          Nearby Attractions
        </h2>

        <ul className="mt-3 space-y-2">
          {property.nearbyAttractions.map((attraction) => (
            <li key={attraction}>• {attraction}</li>
          ))}
        </ul>

        <button
          disabled={isSold}
          className={`mt-8 rounded-xl px-6 py-3 font-black ${
            isSold
              ? "cursor-not-allowed bg-gray-700 text-gray-400"
              : "bg-yellow-400 text-black"
          }`}
        >
          {isSold ? "Sold / Unavailable" : "Add to Cart"}
        </button>

        <br />

        <a href="/explore" className="mt-8 inline-block text-yellow-400">
          Back to Explore
        </a>
      </div>
    </main>
  );
}