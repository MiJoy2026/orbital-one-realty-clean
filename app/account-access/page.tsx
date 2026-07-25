import Link from "next/link";

export const metadata = {
  title: "Customer Account Access | Orbital One Realty",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountAccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    sent?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-yellow-400/30 bg-white/5 p-8 sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          Orbital One Customer Portal
        </p>
        <h1 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
          Secure Account Access
        </h1>
        <p className="mt-5 leading-7 text-gray-300">
          Enter the purchaser or gift-recipient email connected to a paid
          Orbital One Realty order. We will send a secure activation or
          recovery link when the address matches our records.
        </p>

        {params.sent === "1" && (
          <p className="mt-6 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 font-semibold text-green-200">
            Check your inbox. When the email matches a paid order, a secure
            account link will arrive shortly.
          </p>
        )}

        {params.error === "service" && (
          <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
            Email service is temporarily unavailable. Please try again later.
          </p>
        )}

        <form
          action="/api/account-access"
          method="POST"
          className="mt-8"
        >
          <label className="block text-sm font-bold text-gray-300">
            Purchase or Gift-Recipient Email
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            required
          />

          <button
            type="submit"
            className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
          >
            Email My Secure Link
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center font-bold text-gray-400 transition hover:text-yellow-400"
        >
          Return to Customer Login
        </Link>
      </div>
    </main>
  );
}
