import type { Metadata } from "next";
import Image from "next/image";

import { PROPERTY_PRICES } from "@/lib/purchase-constants";
import LunarGiftCampaignTracking, {
  TrackedGiftLink,
} from "@/components/LunarGiftCampaignTracking";

export const metadata: Metadata = {
  title: "Gift a Place on the Moon | Orbital One Realty",
  description:
    "Create a personalized novelty lunar-property gift with a mapped location, custom deed, LunaScape imagery, and 2026 Charter HOA membership. Starting at $16.95.",
  alternates: {
    canonical: "/gift-a-place-on-the-moon",
  },
  openGraph: {
    title: "Give Someone Their Own Place on the Moon",
    description:
      "A personalized novelty lunar gift they can display, explore, and remember.",
    url: "/gift-a-place-on-the-moon",
    type: "website",
  },
};

const giftOptions = [
  {
    name: "Half-Acre Lunar Property",
    description:
      "An affordable personalized lunar keepsake for birthdays, graduations, children, grandchildren, and first-time buyers.",
    price: PROPERTY_PRICES["Half Acre"],
    image: "/property-images/rural-acre.jpg",
    badge: "Best Starting Gift",
  },
  {
    name: "One-Acre Lunar Property",
    description:
      "The classic Orbital One experience with a full novelty lunar acre and a complete personalized ownership collection.",
    price: PROPERTY_PRICES["Rural Acre"],
    image: "/property-images/rural-acre.jpg",
    badge: "Most Popular",
  },
  {
    name: "Lunar Town Block",
    description:
      "A commemorative property inside a named lunar town for someone who wants identity, community, and a memorable location.",
    price: PROPERTY_PRICES["Town Block"],
    image: "/property-images/town-block.jpg",
    badge: "Named Community",
  },
  {
    name: "Lunar City Block",
    description:
      "A premium novelty address inside one of LunaSphere's mapped lunar cities.",
    price: PROPERTY_PRICES["City Block"],
    image: "/property-images/city-block.jpg",
    badge: "Premium Gift",
  },
];

const includedItems = [
  {
    title: "Personalized Novelty Deed",
    description:
      "Created with the chosen recipient or owner name and the assigned lunar property.",
  },
  {
    title: "Unique Mapped Property",
    description:
      "Every assigned property receives its own permanent LunaSphere property ID and mapped location.",
  },
  {
    title: "Property and LunaScape Imagery",
    description:
      "A visual presentation of the lunar terrain and the property's place inside the Orbital One experience.",
  },
  {
    title: "Welcome and Membership Materials",
    description:
      "A polished digital collection that makes the gift feel complete and ready to share.",
  },
  {
    title: "2026 Charter HOA Membership",
    description:
      "Early customers become founding members of the growing Orbital One lunar community.",
  },
  {
    title: "Verifiable Property Record",
    description:
      "The recipient can revisit the property and its Orbital One record after purchase.",
  },
];

const occasions = [
  "Birthdays",
  "Anniversaries",
  "Graduations",
  "Weddings",
  "Space enthusiasts",
  "Children and grandchildren",
  "Science and astronomy fans",
  "The person who has everything",
];

export default function LunarGiftLandingPage() {
  return (
    <main className="overflow-hidden bg-[#02040a] text-white">
      <LunarGiftCampaignTracking />
      <section className="relative isolate min-h-[760px] overflow-hidden border-b border-white/10 px-6 py-20 sm:py-24 lg:flex lg:items-center">
        <Image
          src="/pricing/pricing-hero.png"
          alt="Lunar landscape beneath a dark star-filled sky"
          fill
          priority
          sizes="100vw"
          className="-z-30 object-cover object-center"
        />

        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#02040a] via-[#02040a]/90 to-[#02040a]/35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#02040a] via-transparent to-black/30" />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex rounded-full border border-yellow-300/30 bg-black/45 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-yellow-200 backdrop-blur">
              A personalized gift that is out of this world
            </p>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Give Someone Their Own Place on the Moon
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Create a personalized novelty lunar-property gift they can
              display, explore, share, and remember.
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Gifts starting at
                </p>
                <p className="mt-1 text-5xl font-black text-yellow-300">
                  ${PROPERTY_PRICES["Half Acre"].toFixed(2)}
                </p>
              </div>

              <p className="max-w-xs text-sm leading-6 text-slate-400">
                Personalized digital delivery with a mapped LunaSphere
                property, novelty deed, and Charter HOA membership.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <TrackedGiftLink
              href="/pricing#property-collection"
              trackingId="hero-create-gift"
                className="rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-7 py-4 text-center text-lg font-black text-black shadow-xl shadow-yellow-400/10 transition hover:-translate-y-0.5 hover:from-yellow-200 hover:to-yellow-400"
              >
                Create My Lunar Gift
              </TrackedGiftLink>

              <TrackedGiftLink
                href="/moon-map"
                trackingId="hero-choose-exact-location"
                className="rounded-xl border border-white/25 bg-black/35 px-7 py-4 text-center text-lg font-black text-white backdrop-blur transition hover:border-yellow-300/50 hover:bg-white/10"
              >
                Choose an Exact Location
              </TrackedGiftLink>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-slate-300">
              {[
                "Secure Stripe checkout",
                "Unique mapped property",
                "Personalized digital delivery",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-black/35 px-4 py-2 backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-yellow-300/25 bg-black/55 p-4 shadow-2xl backdrop-blur">
              <div className="relative h-[430px] overflow-hidden rounded-[1.5rem] sm:h-[520px]">
                <Image
                  src="/property-images/rural-acre.jpg"
                  alt="Example lunar property terrain"
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
                    Personalized lunar gift
                  </p>

                  <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                    A mapped place with a story of its own
                  </h2>

                  <p className="mt-4 max-w-lg leading-7 text-slate-300">
                    Select a gift tier, add the recipient&apos;s name, and
                    Orbital One will reserve an available LunaSphere property
                    for the personalized collection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
              Choose the perfect lunar gift
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Four ways to make their gift unforgettable
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Start with an affordable keepsake or choose a premium named-town
              or city location.
            </p>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {giftOptions.map((option) => (
              <article
                key={option.name}
                className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/25"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={option.image}
                    alt={option.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-black/20" />

                  <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-2 text-xs font-black uppercase tracking-wide text-black">
                    {option.badge}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-2xl font-black">{option.name}</h3>

                  <p className="mt-4 flex-1 text-sm leading-7 text-slate-400">
                    {option.description}
                  </p>

                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Starting at
                    </p>

                    <p className="mt-1 text-3xl font-black text-yellow-300">
                      ${option.price.toFixed(2)}
                    </p>

                    <TrackedGiftLink
                       href="/pricing#property-collection"
                       trackingId={`gift-option-${option.name
                       .toLowerCase()
                       .replace(/[^a-z0-9]+/g, "-")
                       .replace(/^-|-$/g, "")}`}
                      className="mt-5 block rounded-xl bg-yellow-400 px-5 py-3 text-center font-black text-black transition hover:bg-yellow-300"
                    >
                      Personalize This Gift
                    </TrackedGiftLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.025] px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
                What they receive
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                More than a certificate
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-400">
                Orbital One turns a novelty lunar property into a complete,
                polished digital gift experience.
              </p>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                Optional products and personalization upgrades are clearly
                shown before checkout.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {includedItems.map((item, index) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/25 p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-black">
                    {index + 1}
                  </span>

                  <h3 className="mt-5 text-xl font-black">{item.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
              Three simple steps
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Create the gift in minutes
            </h2>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {[
              {
                number: "1",
                title: "Choose a Property Type",
                text: "Select an affordable rural keepsake, a full acre, a town block, or a premium city block.",
              },
              {
                number: "2",
                title: "Personalize the Gift",
                text: "Enter the name for the deed and add gift-recipient information or a personal message.",
              },
              {
                number: "3",
                title: "Receive the Collection",
                text: "Orbital One assigns and reserves an available mapped property for the completed digital package.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-300/10 text-2xl font-black text-yellow-300">
                  {step.number}
                </span>

                <h3 className="mt-6 text-2xl font-black">{step.title}</h3>

                <p className="mt-4 leading-7 text-slate-400">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.025] px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
                Perfect for
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                The people and moments that deserve something different
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-400">
                A personalized lunar gift works when ordinary gifts feel too
                predictable.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {occasions.map((occasion) => (
                <div
                  key={occasion}
                  className="rounded-2xl border border-white/10 bg-black/25 px-5 py-5 text-center font-bold text-slate-200"
                >
                  {occasion}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-yellow-300/25 bg-gradient-to-br from-yellow-300/[0.12] via-white/[0.035] to-transparent p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">
            Ready to create their lunar gift?
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Give them a place with a story that is truly out of this world
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Choose a gift tier, personalize it, and let Orbital One securely
            assign an available LunaSphere property.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <TrackedGiftLink
               href="/pricing#property-collection"
               trackingId="final-create-gift"
               className="rounded-xl bg-yellow-400 px-8 py-4 text-lg font-black text-black transition hover:bg-yellow-300"
            >
              Create My Lunar Gift
            </TrackedGiftLink>

            <TrackedGiftLink
               href="/moon-map"
               trackingId="final-explore-lunasphere"
               className="rounded-xl border border-white/20 px-8 py-4 text-lg font-black text-white transition hover:bg-white/10"
            >
              Explore LunaSphere
            </TrackedGiftLink>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-slate-400">
            Orbital One Realty products are novelty and entertainment products.
            They do not represent legal ownership of land or real estate on the
            Moon and are not government-recognized property titles.
          </div>
        </div>
      </section>
    </main>
  );
}