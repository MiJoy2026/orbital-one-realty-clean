export default function HOAPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Orbital One HOA
        </h1>

        <p className="mt-6 text-center text-xl text-gray-300">
          Every paid property purchase includes complimentary membership in the
          Orbital One Homeowners Association.
        </p>

        <div className="mt-12 rounded-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-yellow-400">
            Membership Benefits
          </h2>

          <ul className="mt-6 space-y-3">
            <li>✓ Official Orbital One HOA Membership</li>
            <li>✓ Community News & Updates</li>
            <li>✓ Future Lunar Development Announcements</li>
            <li>✓ Eligibility for Special Promotions</li>
            <li>✓ Access to Member-Only Content</li>
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-yellow-400">
            HOA Mission
          </h2>

          <p className="mt-4 text-gray-300">
            The Orbital One HOA exists to build a fun and engaging community of
            lunar property enthusiasts while celebrating humanity's fascination
            with space exploration.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-yellow-400">
            Membership Cost
          </h2>

          <p className="mt-4 text-2xl font-bold">
            Included FREE with every paid property purchase.
          </p>
        </div>
      </div>
    </main>
  );
}