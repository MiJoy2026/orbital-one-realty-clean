import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Customer Login
        </h1>

        <p className="mt-4 text-gray-300">
          Log in to view your verified Orbital One Realty customer account.
        </p>

        {params.error === "invalid" && (
          <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
            Invalid email or password.
          </p>
        )}

        {params.error === "access" && (
          <p className="mt-6 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 font-semibold text-yellow-100">
            This account must be verified through a secure email link before
            login.
          </p>
        )}

        <form
          action="/api/login"
          method="POST"
          className="mt-10 rounded-3xl border border-white/20 bg-white/5 p-8"
        >
          <label className="block text-sm font-bold text-gray-300">
            Email
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
            required
          />

          <label className="mt-6 block text-sm font-bold text-gray-300">
            Password
          </label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
            required
          />

          <button
            type="submit"
            className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-gray-400">
          Need to activate or recover your account?{" "}
          <Link href="/account-access" className="font-bold text-yellow-400">
            Email a secure access link
          </Link>
        </p>
      </div>
    </main>
  );
}
