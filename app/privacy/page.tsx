import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy | Orbital One Realty",
  description:
    "How Orbital One Realty and MiJoy Enterprises LLC collect, use, disclose, retain, and protect personal information, including optional analytics information.",
  path: "/privacy",
});

const analyticsSection = {
  heading: "Optional Analytics Information",
  paragraphs: [
    "With the visitor's affirmative consent, Orbital One Realty uses Google Analytics 4 to measure use of public website pages and shopping activity. Analytics remains disabled unless the visitor enables Analytics and Performance through Cookie Settings.",
    "Orbital One configures these events to avoid transmitting customer names, email addresses, deed names, gift-recipient details, gift messages, account activity, private documents, or login credentials.",
  ],
  bullets: [
    "Public page views may be measured without URL query strings.",
    "Shopping measurement may include product views, cart activity, checkout starts, transaction totals, product categories, and completed purchases.",
    "A Stripe checkout-session identifier may be used as a transaction identifier to prevent duplicate purchase reporting.",
    "Advertising personalization and Google Signals are disabled in the Orbital One configuration.",
    "Consent may be withdrawn through Cookie Settings.",
  ],
};

const privacyDocument = {
  ...LEGAL_DOCUMENTS.privacy,
  sections: [
    ...LEGAL_DOCUMENTS.privacy.sections.filter(
      (section) =>
        section.heading !== analyticsSection.heading
    ),
    analyticsSection,
  ],
};

export default function Page() {
  return <LegalPolicyPage document={privacyDocument} />;
}
