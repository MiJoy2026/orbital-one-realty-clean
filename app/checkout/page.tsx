import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ reservationId?: string }>;
}) {
  const params = await searchParams;

  if (params.reservationId) {
    redirect(
      `/cart?reservationId=${encodeURIComponent(params.reservationId)}`
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/20 bg-white/5 p-10 text-center">
        <h1 className="text-4xl font-black text-yellow-400">
          Reserve a Property First
        </h1>
        <p className="mt-5 text-gray-300">
          Secure checkout begins after you select and reserve an available
          property on the Moon Map.
        </p>
        <Link
          href="/moon-map"
          className="mt-8 inline-block rounded-xl bg-yellow-400 px-7 py-4 font-black text-black"
        >
          Open the Moon Map
        </Link>
      </div>
    </main>
  );
}
