import Link from "next/link";

import { verifyCustomerClaimToken } from "../../lib/customer-access-token";

export const metadata = {
  title: "Activate Customer Account | Orbital One Realty",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim() || "";
  let verifiedEmail = "";

  if (token) {
    try {
      const claim = await verifyCustomerClaimToken(token);
      verifiedEmail = claim.email;
    } catch {
      verifiedEmail = "";
    }
  }

  if (!token || !verifiedEmail) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-yellow-400/30 bg-white/5 p-8 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
            Secure Customer Access
          </p>
          <h1 className="mt-4 text-4xl font-black uppercase text-white sm:text-5xl">
            Account Link Required
          </h1>
          <p className="mt-5 leading-7 text-gray-300">
            Customer accounts are activated through a secure email link. This
            verifies that the account belongs to the purchaser or gift
            recipient before any property records are displayed.
          </p>
          {params.error && (
            <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
              That account link is invalid, expired, or has already been used.
            </p>
          )}
          <Link
            href="/account-access"
            className="mt-8 inline-flex w-full justify-center rounded-xl bg-yellow-400 px-6 py-4 font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
          >
            Email Me a Secure Link
          </Link>
          <Link
            href="/login"
            className="mt-4 inline-flex w-full justify-center rounded-xl border border-white/25 px-6 py-4 font-black text-white transition hover:border-yellow-400 hover:text-yellow-300"
          >
            Return to Customer Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          Verified Email
        </p>
        <h1 className="mt-4 text-5xl font-black uppercase text-yellow-400">
          Activate Your Account
        </h1>
        <p className="mt-4 text-gray-300">
          Set a private password for your verified Orbital One Realty customer
          account. This also securely recovers an existing account using the
          same email address.
        </p>

        {params.error === "password" && (
          <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
            Passwords must match and contain at least 8 characters.
          </p>
        )}

        {params.error === "used" && (
          <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
            This secure link is no longer valid. Request a new account-access
            email.
          </p>
        )}

        <form
          action="/api/register"
          method="POST"
          className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8"
        >
          <input type="hidden" name="token" value={token} />

          <label className="block text-sm font-bold text-gray-300">
            Name
          </label>
          <input
            name="name"
            autoComplete="name"
            className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
            required
          />

          <label className="mt-6 block text-sm font-bold text-gray-300">
            Verified Email
          </label>
          <input
            type="email"
            value={verifiedEmail}
            readOnly
            className="mt-2 w-full cursor-not-allowed rounded-xl border border-green-400/40 bg-green-950/20 px-4 py-3 text-green-200"
          />

          <label className="mt-6 block text-sm font-bold text-gray-300">
            New Password
          </label>
          <input
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
            required
          />

          <label className="mt-6 block text-sm font-bold text-gray-300">
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            minLength={8}
            autoComplete="new-password"
            className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
            required
          />

          <button
            type="submit"
            className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
          >
            Activate Secure Account
          </button>
        </form>
      </div>
    </main>
  );
}
