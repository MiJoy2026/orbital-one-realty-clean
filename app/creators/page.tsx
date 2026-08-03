import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Creator Partner Program | Orbital One Realty",
  description:
    "Apply to the Orbital One Realty Creator Partner Program and earn commission by introducing personalized novelty Moon gifts to your audience.",
  path: "/creators",
});

type CreatorPageProps = {
  searchParams: Promise<{
    submitted?: string;
    error?: string;
  }>;
};

const commissionTiers = [
  {
    rate: "20%",
    label: "Standard commission",
    detail: "Qualifying completed sales 1–24 in a calendar month.",
  },
  {
    rate: "25%",
    label: "Growth commission",
    detail: "Qualifying completed sales 25–99 in the same calendar month.",
  },
  {
    rate: "30%",
    label: "Breakout commission",
    detail: "Qualifying completed sales 100+ in the same calendar month.",
  },
];

const partnerBenefits = [
  "A unique, visual product with strong gift, space, romance, family, and holiday angles",
  "Approved images, video, product descriptions, disclosures, and campaign talking points",
  "A tracked creator link and promotional code after approval",
  "A 30-day referral window after approved tracking is issued",
  "Monthly commission review with a $25 minimum payout threshold",
  "Selected creators may receive a complimentary personalized sample package",
];

const creatorTypes = [
  "Unique gift and product-discovery creators",
  "Space, astronomy, science, and educational creators",
  "Couples, wedding, anniversary, and relationship creators",
  "Parenting, family, homeschool, and teacher creators",
  "Holiday, Christmas, birthday, and shopping creators",
  "Unboxing, review, lifestyle, and small-business discovery creators",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-yellow-300";
const labelClass = "block text-sm font-black text-slate-200";

export default async function CreatorPartnerPage({
  searchParams,
}: CreatorPageProps) {
  const params = await searchParams;
  const submitted = params.submitted === "1";
  const hasError = params.error === "1";

  return (
    <main className="min-h-screen bg-[#02040a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.15),transparent_42%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.12),transparent_32%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-300">
            Orbital One Realty™ Creator Partner Program
          </p>

          <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Help people discover a gift that is{" "}
            <span className="text-yellow-300">out of this world.</span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
            Introduce your audience to personalized novelty Moon-property gift
            experiences, earn commission on qualifying completed sales, and help
            grow the Orbital One Realty founding generation.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#apply"
              className="rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-7 py-4 font-black text-black transition hover:-translate-y-0.5"
            >
              Apply to Become a Partner
            </a>

            <Link
              href="/creators/terms"
              className="rounded-xl border border-white/20 px-7 py-4 font-black text-white transition hover:border-yellow-300/50 hover:bg-white/5"
            >
              Read Program Terms
            </Link>
          </div>

          <p className="mt-8 max-w-4xl text-sm leading-6 text-slate-500">
            Orbital One Realty sells novelty, commemorative, entertainment, and
            personalized digital products. Purchases do not convey legal
            ownership of lunar real estate.
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {commissionTiers.map((tier) => (
              <article
                key={tier.rate}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-7"
              >
                <p className="text-5xl font-black text-yellow-300">
                  {tier.rate}
                </p>
                <h2 className="mt-4 text-xl font-black">{tier.label}</h2>
                <p className="mt-3 leading-7 text-slate-400">{tier.detail}</p>
              </article>
            ))}
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            Commission is calculated on qualifying net product revenue after
            discounts and excludes taxes, refunds, reversals, chargebacks, and
            disqualified transactions. Full definitions appear in the program
            terms.
          </p>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">
              What partners receive
            </p>
            <h2 className="mt-4 text-4xl font-black">
              A complete creator launch kit.
            </h2>

            <div className="mt-8 space-y-4">
              {partnerBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <span className="font-black text-yellow-300">✓</span>
                  <p className="leading-7 text-slate-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">
              Who we are looking for
            </p>
            <h2 className="mt-4 text-4xl font-black">
              Engaged audiences matter more than follower count.
            </h2>

            <div className="mt-8 space-y-4">
              {creatorTypes.map((creatorType) => (
                <div
                  key={creatorType}
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-semibold text-slate-300"
                >
                  {creatorType}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-yellow-300/25 bg-yellow-300/[0.06] p-6">
              <h3 className="font-black text-yellow-200">
                Accurate promotion is required
              </h3>
              <p className="mt-3 leading-7 text-slate-300">
                Partners must clearly disclose the relationship, share honest
                opinions, and describe Orbital One products as novelty and
                commemorative products—not legally recognized lunar real
                estate, investments, or guaranteed future access.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="scroll-mt-28 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">
            Partner application
          </p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl">
            Tell us about your audience.
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Applications are reviewed manually. Approval is not automatic, and
            submitting this form does not create a partnership or commission
            entitlement.
          </p>

          {submitted && (
            <div
              role="status"
              className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-100"
            >
              <p className="font-black">Application received.</p>
              <p className="mt-2 leading-7">
                Thank you for applying. Orbital One Realty will review the
                information and contact you by email if the program is a fit.
              </p>
            </div>
          )}

          {hasError && (
            <div
              role="alert"
              className="mt-8 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-100"
            >
              <p className="font-black">The application could not be sent.</p>
              <p className="mt-2 leading-7">
                Please review the required fields and try again. If the problem
                continues, email mijoyenterprises@gmail.com.
              </p>
            </div>
          )}

          <form
            action="/api/creator-application"
            method="POST"
            className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-9"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <label className={labelClass}>
                Full legal name
                <input
                  className={inputClass}
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  required
                />
              </label>

              <label className={labelClass}>
                Email
                <input
                  className={inputClass}
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={180}
                  required
                />
              </label>

              <label className={labelClass}>
                Country
                <input
                  className={inputClass}
                  name="country"
                  type="text"
                  autoComplete="country-name"
                  maxLength={100}
                  required
                />
              </label>

              <label className={labelClass}>
                Primary platform
                <select
                  className={inputClass}
                  name="primaryPlatform"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select a platform
                  </option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Pinterest">Pinterest</option>
                  <option value="Blog or website">Blog or website</option>
                  <option value="Podcast or newsletter">
                    Podcast or newsletter
                  </option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className={labelClass}>
                Creator handle or channel name
                <input
                  className={inputClass}
                  name="handle"
                  type="text"
                  maxLength={160}
                  placeholder="@yourhandle"
                  required
                />
              </label>

              <label className={labelClass}>
                Approximate audience size
                <select
                  className={inputClass}
                  name="audienceSize"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select a range
                  </option>
                  <option value="Under 1,000">Under 1,000</option>
                  <option value="1,000–4,999">1,000–4,999</option>
                  <option value="5,000–24,999">5,000–24,999</option>
                  <option value="25,000–99,999">25,000–99,999</option>
                  <option value="100,000–499,999">100,000–499,999</option>
                  <option value="500,000+">500,000+</option>
                </select>
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Main profile, channel, or website URL
                <input
                  className={inputClass}
                  name="profileUrl"
                  type="url"
                  maxLength={400}
                  placeholder="https://"
                  required
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Content focus
                <textarea
                  className={`${inputClass} min-h-28`}
                  name="contentFocus"
                  maxLength={1200}
                  placeholder="Describe your content topics, audience, and usual format."
                  required
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Why is Orbital One Realty a fit for your audience?
                <textarea
                  className={`${inputClass} min-h-32`}
                  name="whyFit"
                  maxLength={1800}
                  required
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Optional campaign idea
                <textarea
                  className={`${inputClass} min-h-28`}
                  name="campaignIdea"
                  maxLength={1500}
                  placeholder="Tell us how you would introduce the product."
                />
              </label>
            </div>

            <div
              className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
              aria-hidden="true"
            >
              <label>
                Leave this field blank
                <input
                  name="companyWebsite"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5">
              <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                <input
                  name="ageConfirmed"
                  type="checkbox"
                  value="yes"
                  className="mt-1 h-4 w-4 accent-yellow-300"
                  required
                />
                <span>
                  I am at least 18 years old or the age of legal majority where I
                  live and have authority to submit this application.
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                <input
                  name="disclosureConfirmed"
                  type="checkbox"
                  value="yes"
                  className="mt-1 h-4 w-4 accent-yellow-300"
                  required
                />
                <span>
                  I will clearly disclose commissions, free products, and other
                  material connections in every endorsement or promotional
                  post.
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                <input
                  name="termsAccepted"
                  type="checkbox"
                  value="yes"
                  className="mt-1 h-4 w-4 accent-yellow-300"
                  required
                />
                <span>
                  I have read and agree that any approved participation will be
                  governed by the{" "}
                  <Link
                    href="/creators/terms"
                    className="font-bold text-yellow-300 underline"
                  >
                    Creator Partner Program Terms
                  </Link>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-7 py-4 text-lg font-black text-black transition hover:-translate-y-0.5"
            >
              Submit Creator Application
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-slate-600">
              Do not submit passwords, payment-card information, tax
              identification numbers, or private customer information through
              this form.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
