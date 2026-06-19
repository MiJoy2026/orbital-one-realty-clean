export default function VerifySearchPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Certificate Registry
        </h1>

        <p className="mt-6 text-xl text-gray-300">
          Enter an Orbital One Realty certificate number to verify its record.
        </p>

        <form action="/verify/search" className="mt-10 rounded-3xl border border-yellow-400/30 bg-white/5 p-8">
          <input
            name="certificateNumber"
            className="w-full rounded-xl border border-white/20 bg-black px-5 py-4 text-white"
            placeholder="OOR-2026-000123"
            required
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-yellow-400 px-6 py-4 font-black text-black"
          >
            Verify Certificate
          </button>
        </form>
      </div>
    </main>
  );
}