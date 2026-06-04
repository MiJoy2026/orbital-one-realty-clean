const propertyTypes = [
  {
    title: "Rural Acres",
    price: "From $16.95",
    details: ["½ Acre — $16.95", "1 Acre — $24.95", "Additional Acres — $7.95 each"],
  },
  {
    title: "Town Blocks",
    price: "$39.95",
    details: ["Located in one of 1,140 lunar towns", "Great gift or keepsake"],
  },
  {
    title: "City Blocks",
    price: "$54.95",
    details: ["Located in one of 171 lunar cities", "Premium novelty lunar location"],
  },
];

const packageItems = [
  "Novelty Deed",
  "Property Picture",
  "Nearby Lunar Attractions",
  "Novelty Lunar Currency",
  "Free HOA Membership",
  "Terms & Conditions",
  "Privacy Policy",
];

export default function Home() {
  return (
    <main className="bg-black text-white">
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.4em] text-yellow-400">
            Orbital One Realty
          </p>

          <h1 className="text-5xl font-black uppercase leading-tight md:text-8xl">
            Own a Piece of the Moon
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-300 md:text-2xl">
            It&apos;s fun. It&apos;s unique. It&apos;s out of this world!
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/pricing"
              className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black"
            >
              View Pricing
            </a>

            <a
              href="/faq"
              className="rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/5 px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-6 text-center md:grid-cols-4">
          <div>
            <p className="text-5xl font-black text-yellow-400">57</p>
            <p className="mt-2 uppercase tracking-wide text-gray-300">Lunar States</p>
          </div>
          <div>
            <p className="text-5xl font-black text-yellow-400">171</p>
            <p className="mt-2 uppercase tracking-wide text-gray-300">Cities</p>
          </div>
          <div>
            <p className="text-5xl font-black text-yellow-400">1,140</p>
            <p className="mt-2 uppercase tracking-wide text-gray-300">Towns</p>
          </div>
          <div>
            <p className="text-5xl font-black text-yellow-400">∞</p>
            <p className="mt-2 uppercase tracking-wide text-gray-300">Fun Factor</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-black uppercase md:text-5xl">
            Choose Your Lunar Property
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {propertyTypes.map((type) => (
              <div
                key={type.title}
                className="rounded-3xl border border-white/20 bg-white/5 p-8"
              >
                <h3 className="text-3xl font-black text-yellow-400">
                  {type.title}
                </h3>

                <p className="mt-5 text-5xl font-black">{type.price}</p>

                <ul className="mt-6 space-y-3 text-gray-300">
                  {type.details.map((detail) => (
                    <li key={detail}>✓ {detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 text-black">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-black uppercase md:text-5xl">
            Included With Every Purchase
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packageItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-black/10 p-6 text-lg font-bold"
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-yellow-400 p-8">
            <h2 className="text-4xl font-black uppercase text-yellow-400">
              Free HOA Membership
            </h2>
            <p className="mt-5 text-gray-300">
              Every paid property purchase includes complimentary membership in
              the Orbital One HOA, including member benefits, updates, and a
              commemorative membership experience.
            </p>
            <a
              href="/hoa"
              className="mt-8 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
            >
              View HOA Benefits
            </a>
          </div>

          <div className="rounded-3xl border border-white/20 p-8">
            <h2 className="text-4xl font-black uppercase">
              Lunar Passports
            </h2>
            <p className="mt-5 text-gray-300">
              Add a novelty Lunar Passport to your order for only $4.99. A fun
              keepsake for space fans, collectors, and gift recipients.
            </p>
            <a
              href="/passports"
              className="mt-8 inline-block rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
            >
              View Passports
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/5 px-6 py-20 text-center">
        <h2 className="text-4xl font-black uppercase md:text-5xl">
          Ready to Claim Your Place in Lunar History?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-300">
          Start with rural acreage, a town block, or a city block and receive
          your Orbital One welcome package.
        </p>

        <a
          href="/pricing"
          className="mt-10 inline-block rounded-xl bg-yellow-400 px-10 py-4 font-black text-black"
        >
          Get Started
        </a>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-gray-400">
        Orbital One Realty sells novelty and commemorative products only.
        Purchases do not convey legal ownership of lunar real estate.
      </footer>
    </main>
  );
}