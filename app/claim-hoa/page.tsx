import ClaimHoaForm from "@/components/ClaimHoaForm";
export default function ClaimHoaPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/30 bg-white/5 p-8">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
          Orbital One HOA
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase text-yellow-400">
          Activate Your Orbital One Membership
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-300">
          Activate your complimentary Orbital One HOA membership using the certificate
          number found on your Novelty Lunar Deed. Once activated, you&apos;ll be able
          to access your documents, view your lunar properties, receive member updates,
          and join future Orbital One experiences.
        </p>

        <div className="mt-10">
  <h2 className="text-2xl font-black uppercase text-yellow-400">
    Your Complimentary Membership Includes
  </h2>

  <div className="mt-6 grid gap-4 md:grid-cols-2">
    <div className="rounded-2xl border border-white/20 bg-black/40 p-5">
      <h3 className="font-black text-yellow-400">📜 Document Access</h3>
      <p className="mt-2 text-sm text-gray-300">
        Download your deed, welcome letter, HOA certificate, and passport if
        purchased.
      </p>
    </div>

    <div className="rounded-2xl border border-white/20 bg-black/40 p-5">
      <h3 className="font-black text-yellow-400">🛰 Moon Atlas</h3>
      <p className="mt-2 text-sm text-gray-300">
        Explore your lunar property, nearby attractions, cities, towns, and
        state region.
      </p>
    </div>

    <div className="rounded-2xl border border-white/20 bg-black/40 p-5">
      <h3 className="font-black text-yellow-400">🏡 Property Portfolio</h3>
      <p className="mt-2 text-sm text-gray-300">
        View your Orbital One properties from your member dashboard.
      </p>
    </div>

    <div className="rounded-2xl border border-white/20 bg-black/40 p-5">
      <h3 className="font-black text-yellow-400">⭐ 2026 Charter Status</h3>
      <p className="mt-2 text-sm text-gray-300">
        Early Orbital One members receive permanent Charter Member recognition.
      </p>
    </div>
  </div>
</div>
        <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6">
  <h2 className="text-2xl font-black uppercase text-yellow-400">
    Need Help Finding Your Certificate Number?
  </h2>

  <p className="mt-4 text-gray-300">
    Your Certificate Number can be found on your Orbital One documents and
    purchase confirmation.
  </p>

  <div className="mt-5 grid gap-3 text-gray-300 md:grid-cols-2">
    <p>📜 Novelty Lunar Deed</p>
    <p>🛂 Lunar Passport</p>
    <p>📄 HOA Certificate</p>
    <p>📧 Purchase Confirmation Email</p>
  </div>

  <p className="mt-5 rounded-xl border border-white/20 bg-black/40 p-4 font-mono text-sm text-yellow-400">
    Example: OOR-R-001-1749983722
  </p>

  <p className="mt-5 text-sm font-bold text-gray-300">
    Your Orbital One HOA membership is complimentary with every property
    purchase. There are no annual dues or recurring fees.
  </p>
</div>
    <ClaimHoaForm />
      </div>
    </main>
  );
}