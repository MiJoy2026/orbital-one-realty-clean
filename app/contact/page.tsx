export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-5xl font-black uppercase">
          Contact Orbital One Realty
        </h1>

        <p className="mt-6 text-center text-xl text-gray-300">
          Questions about lunar property, HOA membership, novelty deeds, or
          passports? We'd love to hear from you.
        </p>

        <div className="mt-12 rounded-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-yellow-400">
            Customer Support
          </h2>

          <div className="mt-6 space-y-4 text-lg">
            <p>
              <strong>Email:</strong> support@orbitalonerealty.com
            </p>

            <p>
              <strong>Sales:</strong> sales@orbitalonerealty.com
            </p>

            <p>
              <strong>HOA Questions:</strong> hoa@orbitalonerealty.com
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-yellow-400">
            Business Hours
          </h2>

          <div className="mt-4 space-y-2">
            <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
            <p>Saturday: 10:00 AM - 2:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-yellow-400">
            Disclaimer
          </h2>

          <p className="mt-4 text-gray-300">
            Orbital One Realty provides novelty and commemorative products for
            entertainment purposes only. Purchases do not convey legal
            ownership of lunar real estate.
          </p>
        </div>
      </div>
    </main>
  );
}