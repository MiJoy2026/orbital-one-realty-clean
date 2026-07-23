import Link from "next/link";

const products = [
  {
    name: "One-Acre Lunar Property",
    category: "Rural Acre",
    description:
      "A selectable one-acre rural parcel outside all city and town territories.",
    price: 24.95,
    icon: "🌕",
    badge: "Most Popular",
  },
  {
    name: "Lunar Town Block",
    category: "Town Block",
    description:
      "An individually selectable novelty block inside one of LunaSphere’s named towns.",
    price: 39.95,
    icon: "🏘️",
  },
  {
    name: "Lunar City Block",
    category: "City Block",
    description:
      "A premium individually selectable novelty block inside a LunaSphere city.",
    price: 54.95,
    icon: "🌆",
    badge: "Premium",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#03050b] text-white">
      <section className="relative border-b border-white/10 px-6 py-20 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.14),_transparent_38%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-sm font-semibold text-yellow-200">
            <span>✦</span>
            Novelty Lunar Property Packages
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Find Your Place
            <span className="block bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              On the Moon
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Select the exact available property on the LunaSphere Moon Map,
            reserve it, personalize the deed, and complete secure Stripe
            checkout.
          </p>
          <Link
            href="/moon-map"
            className="mt-9 inline-flex items-center gap-3 rounded-xl bg-yellow-400 px-7 py-4 font-black text-black transition hover:bg-yellow-300"
          >
            Explore Available Properties
          </Link>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
              Launch Property Collection
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Three ways to own a LunaSphere keepsake
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Every map cell has a permanent property ID. For launch, rural
              properties are sold as individual one-acre parcels; adjacent
              multi-acre selection can be added later without creating phantom
              inventory.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.category}
                className="group relative flex min-h-[470px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.025] shadow-2xl shadow-black/30 transition duration-300 hover:-translate-y-2 hover:border-yellow-300/40"
              >
                {product.badge && (
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                    {product.badge}
                  </div>
                )}
                <div className="relative flex h-44 items-center justify-center border-b border-white/10 bg-gradient-to-br from-slate-800 via-slate-950 to-black">
                  <div className="absolute h-40 w-40 rounded-full bg-yellow-200/10 blur-2xl transition duration-500 group-hover:bg-yellow-200/20" />
                  <span className="relative text-7xl transition duration-500 group-hover:scale-110">
                    {product.icon}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
                    {product.category}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold leading-tight">
                    {product.name}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                    {product.description}
                  </p>
                  <div className="mt-7 border-t border-white/10 pt-6">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Price per property
                    </p>
                    <p className="mt-1 text-4xl font-black">
                      ${product.price.toFixed(2)}
                    </p>
                    <Link
                      href="/moon-map"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-3.5 font-bold text-black transition hover:from-yellow-200 hover:to-yellow-400"
                    >
                      Choose on Moon Map
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-5 text-center text-sm leading-6 text-slate-400">
            Optional Lunar Passport: <strong className="text-white">$4.99</strong>
            {" · "}Additional deed names:{" "}
            <strong className="text-white">$1.99 each</strong>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
              Included With Every Property
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              A complete lunar ownership experience
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["📜", "Personalized Deed", "A recorded novelty deed featuring the selected owner name."],
              ["🏅", "Charter HOA Membership", "Recognition as a 2026 Founding and Charter HOA Member."],
              ["📦", "Welcome Materials", "Coordinated property, ownership, and membership documents."],
              ["🚀", "Future Benefits", "Updates, recognition, discounts, and priority access to future features."],
            ].map(([icon, title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-black/20 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-300/10 text-2xl">
                  {icon}
                </div>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-20 text-center">
        <span className="text-5xl">🌕</span>
        <h2 className="mt-6 text-3xl font-black sm:text-4xl">
          It’s fun. It’s unique.
          <span className="block text-yellow-400">
            It’s out of this world!
          </span>
        </h2>
        <p className="mx-auto mt-10 max-w-3xl text-xs leading-5 text-slate-600">
          Orbital One Realty products are novelty and entertainment products.
          They do not represent legal ownership of land or real estate on the
          Moon and are not government-recognized property titles.
        </p>
      </section>
    </main>
  );
}
