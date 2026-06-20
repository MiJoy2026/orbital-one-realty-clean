export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Customer Login
        </h1>

        <p className="mt-4 text-gray-300">
          Log in to view your Orbital One Realty account.
        </p>

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
            className="mt-2 w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white"
            required
          />

          <label className="mt-6 block text-sm font-bold text-gray-300">
            Password
          </label>
          <input
            name="password"
            type="password"
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
          Need an account?{" "}
          <a href="/register" className="text-yellow-400">
            Create one here
          </a>
        </p>
      </div>
    </main>
  );
}