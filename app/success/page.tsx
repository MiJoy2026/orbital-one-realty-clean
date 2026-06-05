export default function SuccessPage() {
  const propertyId = "R-001";

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-center text-white">
      <h1 className="text-5xl font-black uppercase text-yellow-400">
        Payment Successful
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-300">
        Thank you for your Orbital One Realty purchase. Your novelty deed,
        welcome package, HOA membership, and any add-ons will be prepared next.
      </p>

      <a
        href={`/api/generate-deed?propertyId=${propertyId}`}
        className="mt-10 inline-block rounded-xl bg-yellow-400 px-8 py-4 font-black text-black"
      >
        Download Novelty Deed PDF
      </a>

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