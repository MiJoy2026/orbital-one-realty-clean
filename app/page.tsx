import Image from "next/image";

const propertyTypes = [
  {
    title: "Rural Acres",
    price: "From $16.95",
    image: "/property-images/rural-acre.jpg",
    details: ["½ Acre — $16.95", "1 Acre — $24.95"],
  },
  {
    title: "Town Blocks",
    price: "$39.95",
    image: "/property-images/town-block.jpg",
    details: ["Located in one of 1,140 lunar towns", "Great gift or keepsake"],
  },
  {
    title: "City Blocks",
    price: "$54.95",
    image: "/property-images/city-block.jpg",
    details: ["Located in one of 171 lunar cities", "Premium novelty lunar location"],
  },
];

const stats = [
  ["57", "Lunar States"],
  ["171", "Cities"],
  ["1,140", "Towns"],
  ["2.85M", "Rural Acres"],
];

const packageItems = [
  "Personalized Novelty Deed",
  "Free HOA Membership",
  "Certificate Verification",
  "HOA Member Card",
  "Assigned Acre Range",
  "Lunar Property Portfolio",
  "Welcome Letter PDF",
  "Public Registry Record",
  "Novelty Lunar Passport",
];

export default function Home() {
  return (
    <main
      className="min-h-screen bg-black text-white"
      style={{
        backgroundImage: "url('/backgrounds/account-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen bg-black/65 px-6 py-10">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-yellow-400/40 bg-black/75 p-10 text-center shadow-2xl backdrop-blur-sm">
            <p className="text-sm font-black uppercase tracking-[0.45em] text-yellow-400">
              Orbital One Realty
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase leading-none md:text-8xl">
              Own a Piece
              <span className="block text-yellow-400">of the Moon</span>
            </h1>

            <p className="mt-6 text-2xl font-bold">
              It&apos;s fun. It&apos;s unique. It&apos;s out of this world!
            </p>

            <p className="mx-auto mt-6 max-w-3xl text-gray-300">
              Choose novelty lunar acreage, town blocks, or city blocks and
              receive a personalized digital property package with certificate
              verification, HOA membership, and your own customer portfolio. PLUS receive access to our future Virtual Lunar App where you will be able to manage, build and explore your purchased properties.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="/moon-map" className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black">
                Explore Lunar Atlas
              </a>
              <a href="/pricing" className="rounded-xl border border-yellow-400 px-8 py-4 font-black text-yellow-400">
                View Pricing
              </a>
              <a href="/verify" className="rounded-xl border border-white/30 px-8 py-4 font-black text-white">
                Verify Certificate
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {stats.map(([number, label]) => (
              <div key={label} className="rounded-2xl border border-white/20 bg-black/75 p-6 text-center backdrop-blur-sm">
                <p className="text-5xl font-black text-yellow-400">{number}</p>
                <p className="mt-2 font-bold uppercase text-gray-300">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <section className="lg:col-span-2">
              <h2 className="text-center text-3xl font-black uppercase text-yellow-400">
                Choose Your Lunar Property
              </h2>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {propertyTypes.map((type) => (
                  <div key={type.title} className="overflow-hidden rounded-3xl border border-yellow-400/30 bg-black/75 backdrop-blur-sm">
                    <Image
                      src={type.image}
                      alt={type.title}
                      width={800}
                      height={500}
                      className="h-48 w-full object-cover"
                    />

                    <div className="p-6">
                      <h3 className="text-2xl font-black uppercase text-yellow-400">
                        {type.title}
                      </h3>
                      <p className="mt-2 text-3xl font-black">{type.price}</p>

                      <ul className="mt-4 space-y-2 text-sm text-gray-300">
                        {type.details.map((detail) => (
                          <li key={detail}>✓ {detail}</li>
                        ))}
                      </ul>

                      <a href="/pricing" className="mt-6 block rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black">
                        View Options
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/20 bg-black/75 p-6 backdrop-blur-sm">
              <h2 className="text-center text-3xl font-black uppercase text-yellow-400">
                Included With Every Purchase
              </h2>

              <div className="mt-6 grid gap-3">
                {packageItems.map((item) => (
                  <div key={item} className="rounded-xl border border-white/15 bg-white/5 p-4 font-bold">
                    ✓ {item}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-yellow-400 bg-black/75 p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-black uppercase text-yellow-400">
                Free HOA Membership
              </h2>
              <p className="mt-4 text-gray-300">
                Every paid property purchase includes complimentary membership
                in the Orbital One HOA, including founding member recognition,
                future updates, newsletters, and member benefits.
              </p>
              <a href="/hoa" className="mt-6 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-black text-black">
                View HOA Benefits
              </a>
            </div>

            <div className="rounded-3xl border border-white/20 bg-black/75 p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-black uppercase">
                Customer Portfolio
              </h2>
              <p className="mt-4 text-gray-300">
                Create an account to view your lunar properties, download your
                documents, access your HOA dashboard, and manage your novelty
                property portfolio.
              </p>
              <a href="/login" className="mt-6 inline-block rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400">
                Customer Login
              </a>
            </div>
          </div>

          <section className="mt-8 rounded-3xl border border-white/20 bg-black/75 p-8 text-center backdrop-blur-sm">
            <h2 className="text-3xl font-black uppercase md:text-4xl">
              Ready to Claim Your Place in Lunar History?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-gray-300">
              Start with rural acreage, a town block, or a city block and
              receive your Orbital One welcome package.
            </p>
            <a href="/moon-map" className="mt-6 inline-block rounded-xl bg-yellow-400 px-10 py-4 font-black text-black">
              Explore the Lunar Atlas
            </a>
          </section>

          <footer className="py-8 text-center text-sm text-gray-400">
            Orbital One Realty sells novelty and commemorative products only.
            Purchases do not convey legal ownership of lunar real estate.
          </footer>
        </section>
      </div>
    </main>
  );
}