export const metadata = {
  title: "Admin Login | Orbital One Realty",
  description: "Secure Orbital One Realty administration login.",
};

function safeDestination(value: string | undefined): string {
  if (
    value &&
    (value === "/admin" || value.startsWith("/admin/")) &&
    !value.startsWith("/admin/login")
  ) {
    return value;
  }

  return "/admin/dashboard";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    loggedOut?: string;
    next?: string;
  }>;
}) {
  const params = await searchParams;
  const destination = safeDestination(params.next);

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-lg">
        <div className="rounded-3xl border border-yellow-400/30 bg-white/[0.05] p-8 shadow-2xl shadow-black/50 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
            Orbital One Realty
          </p>

          <h1 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
            Admin Login
          </h1>

          <p className="mt-4 leading-7 text-gray-400">
            Enter the private administrator credentials stored in your
            environment settings.
          </p>

          {params.error === "1" && (
            <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
              Invalid administrator username or password.
            </p>
          )}

          {params.loggedOut === "1" && (
            <p className="mt-6 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 font-semibold text-green-200">
              You have been securely logged out of the Admin session.
            </p>
          )}

          <form
            action="/admin/api/login"
            method="POST"
            className="mt-8"
          >
            <input
              type="hidden"
              name="next"
              value={destination}
            />

            <label className="block text-sm font-bold text-gray-300">
              Admin Username
            </label>

            <input
              name="username"
              type="text"
              defaultValue="admin"
              autoComplete="username"
              required
              className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />

            <label className="mt-6 block text-sm font-bold text-gray-300">
              Admin Password
            </label>

            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
            />

            <button
              type="submit"
              className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
            >
              Enter Admin Dashboard
            </button>
          </form>

          <a
            href="/"
            className="mt-6 block text-center font-bold text-gray-400 transition hover:text-yellow-400"
          >
            Return to Public Website
          </a>
        </div>
      </div>
    </main>
  );
}