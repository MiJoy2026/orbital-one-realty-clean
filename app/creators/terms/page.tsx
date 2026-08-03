import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Creator Partner Program Terms | Orbital One Realty",
  description:
    "Terms governing approved participation in the Orbital One Realty Creator Partner Program.",
  path: "/creators/terms",
});

const sections = [
  {
    heading: "1. Program operator and acceptance",
    paragraphs: [
      "The Orbital One Realty Creator Partner Program is operated by MiJoy Enterprises LLC, doing business as Orbital One Realty (collectively, “Orbital One,” “we,” “us,” or “our”). These terms apply only after Orbital One approves a creator in writing and issues an approved tracking link, code, or other program credentials.",
      "Submitting an application does not guarantee approval, create an agency relationship, promise a free product, or create a right to commission. By participating after approval, the creator agrees to these terms and any written campaign instructions supplied by Orbital One.",
    ],
  },
  {
    heading: "2. Eligibility and account information",
    paragraphs: [
      "A creator must be at least 18 years old or the age of legal majority where the creator lives, have legal capacity to participate, provide accurate and current information, and control the accounts used for promotion.",
      "Orbital One may approve, reject, suspend, or limit participation based on audience fit, content quality, brand safety, legal or platform requirements, suspected fraud, or program capacity. Participation is non-exclusive unless a separate written agreement says otherwise.",
    ],
  },
  {
    heading: "3. Commission rates",
    paragraphs: [
      "Unless Orbital One approves a different written rate, commission is calculated by calendar month as follows: 20% on qualifying completed sales 1–24, 25% on qualifying completed sales 25–99, and 30% on qualifying completed sales 100 and above.",
      "Commission is based on qualifying net product revenue actually received by Orbital One after discounts. Taxes, shipping or delivery charges, refunds, partial refunds, reversals, chargebacks, disputed transactions, fraudulent transactions, cancelled orders, test orders, and any amount not retained by Orbital One are excluded.",
      "A transaction does not qualify if it is a self-referral, a purchase made primarily to generate commission, an unauthorized incentive, a duplicate or artificial order, or a transaction produced through prohibited promotion.",
    ],
  },
  {
    heading: "4. Tracking and attribution",
    paragraphs: [
      "Approved creators may receive a unique link, promotional code, or other tracking method. The standard referral window is 30 days from an eligible tracked visit after approved tracking is issued, subject to browser settings, customer consent choices, technical limitations, and the attribution records available to Orbital One.",
      "The tracking and checkout records maintained by Orbital One control attribution. Orbital One may correct duplicate attribution, technical errors, fraudulent activity, or conflicting creator claims. Commission is not owed when a transaction cannot reasonably be connected to the creator through an approved method.",
    ],
  },
  {
    heading: "5. Validation and payment",
    paragraphs: [
      "Commission is reviewed monthly after transactions have had time to clear ordinary refund, reversal, and chargeback risks. Orbital One may hold a transaction for additional review when fraud, dispute, delivery, or compliance concerns exist.",
      "The minimum payout threshold is $25. Valid unpaid balances below the threshold carry forward. Payment timing and available payment methods may vary by country and will be confirmed with the approved creator.",
      "Creators are responsible for their own taxes, registrations, permits, bank or payment-provider fees, currency conversion, and reporting obligations. Orbital One may request legally required tax or identity documentation before issuing payment.",
    ],
  },
  {
    heading: "6. Required disclosures and honest endorsements",
    paragraphs: [
      "Creators must clearly and conspicuously disclose every material connection to Orbital One, including commission, free products, discounts, bonuses, travel, or any other benefit. The disclosure must appear with the endorsement in a place and format viewers are likely to notice and understand.",
      "Platform disclosure tools should be used when available, but a platform label does not replace any additional disclosure needed for clarity. Examples may include “Ad,” “Paid partnership,” “I earn a commission from qualifying purchases,” or another plain-language disclosure appropriate to the format.",
      "Endorsements must reflect the creator’s honest opinion and actual experience. Creators may not fabricate reviews, testimonials, purchases, customer reactions, performance results, scarcity, or product features.",
    ],
  },
  {
    heading: "7. Product descriptions and required accuracy",
    paragraphs: [
      "Orbital One products must be described as novelty, commemorative, entertainment, and personalized digital products. A purchase does not convey legally recognized ownership of lunar real estate, government-recognized title, development rights, occupancy rights, mineral rights, citizenship, an investment, or a security.",
      "LunaSphere™ may be described as Orbital One’s interactive Moon atlas, location-selection, geography, property-identification, search, reservation, and inventory experience. LunaScape™ must be described as a planned future experience whose features, availability, timing, and development are not guaranteed by a purchase.",
      "Creators must use current approved pricing, product inclusions, disclosures, images, logos, links, and campaign language. Creators must promptly correct or remove inaccurate content after notice from Orbital One.",
    ],
  },
  {
    heading: "8. Prohibited promotion",
    bullets: [
      "Spam, unsolicited bulk messages, deceptive direct messages, fake accounts, bot traffic, purchased engagement, cookie stuffing, click injection, forced clicks, or hidden redirects",
      "False, misleading, unsubstantiated, or legally prohibited claims",
      "Trademark bidding, paid-search advertising using Orbital One Realty, LunaSphere, LunaScape, confusing misspellings, or related brand terms without written approval",
      "Registering domains, social handles, pages, groups, or profiles that impersonate Orbital One or imply official ownership",
      "Unauthorized coupon, deal, cashback, browser-extension, toolbar, or incentive traffic",
      "Self-referrals, coordinated artificial purchases, stolen payment methods, or attempts to manipulate attribution",
      "Content involving unlawful conduct, hate, harassment, explicit sexual material, serious violence, dangerous deception, or other material reasonably likely to harm the brand",
      "Editing the Orbital One logo, removing required disclosures, or presenting AI-generated product documents as authentic customer documents",
    ],
  },
  {
    heading: "9. Brand assets and creator content",
    paragraphs: [
      "Approved creators receive a limited, revocable, non-exclusive, non-transferable license to use approved Orbital One brand assets only for authorized program promotion. Creators may not sublicense, sell, alter, or use those assets for unrelated products.",
      "The creator retains ownership of original creator content. Orbital One may share or repost a creator’s public post through ordinary platform sharing features with attribution. Any broader advertising, editing, paid usage, or licensing of creator content requires separate permission or a written campaign agreement.",
    ],
  },
  {
    heading: "10. Independent relationship",
    paragraphs: [
      "Creators participate as independent contractors and are not employees, agents, franchisees, joint venturers, brokers, or legal representatives of MiJoy Enterprises LLC or Orbital One Realty. Creators have no authority to bind Orbital One, make warranties for Orbital One, collect customer payments, or promise refunds or future features.",
    ],
  },
  {
    heading: "11. Suspension, termination, and withheld commission",
    paragraphs: [
      "Either party may end participation at any time. Orbital One may immediately suspend tracking, links, codes, assets, or payment review for suspected fraud, disclosure failures, inaccurate claims, platform violations, reputational risk, or breach of these terms.",
      "Valid commission earned before termination remains eligible after ordinary validation. Commission connected to fraud, prohibited promotion, inaccurate attribution, undisclosed endorsements, chargebacks, or other material breach may be denied or offset against future balances.",
    ],
  },
  {
    heading: "12. Program changes and contact",
    paragraphs: [
      "Orbital One may update commission rates, thresholds, tracking methods, campaign rules, or these terms prospectively. Material changes will be posted on this page or communicated to approved creators. Continued participation after the effective date of an update constitutes acceptance of the revised terms.",
      "Questions about the program may be sent to mijoyenterprises@gmail.com. Do not email passwords, complete payment-card information, or sensitive tax identification documents unless Orbital One provides a secure method and specifically requests them.",
    ],
  },
];

export default function CreatorPartnerTermsPage() {
  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-20 text-white">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">
          Orbital One Realty™
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
          Creator Partner Program Terms
        </h1>
        <p className="mt-5 text-slate-400">Effective August 3, 2026</p>

        <div className="mt-8 rounded-2xl border border-yellow-300/20 bg-yellow-300/[0.06] p-6">
          <p className="leading-7 text-slate-300">
            These program terms supplement the Orbital One Realty website{" "}
            <Link href="/terms" className="font-bold text-yellow-300 underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-bold text-yellow-300 underline"
            >
              Privacy Policy
            </Link>
            . If a separate signed creator agreement conflicts with these
            public terms, the signed agreement controls for that campaign.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-black text-yellow-300">
                {section.heading}
              </h2>

              {"paragraphs" in section && section.paragraphs && (
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="leading-8 text-slate-300">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {"bullets" in section && section.bullets && (
                <ul className="mt-4 space-y-3">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-3 leading-7 text-slate-300"
                    >
                      <span className="font-black text-yellow-300">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <Link
            href="/creators#apply"
            className="inline-flex rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-7 py-4 font-black text-black"
          >
            Return to Creator Application
          </Link>
        </div>
      </article>
    </main>
  );
}
