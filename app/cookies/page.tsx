import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy | Orbital One Realty",
  description:
    "Cookie, local-storage, authentication, cart, reservation, checkout, security, privacy-preference, and optional Google Analytics practices.",
  path: "/cookies",
});

const analyticsSection = {
  heading: "Optional Google Analytics 4",
  paragraphs: [
    "Orbital One Realty uses Google Analytics 4 only after a visitor affirmatively enables Analytics and Performance through Cookie Settings. The Google Analytics script is not loaded and analytics information is not transmitted before that choice.",
    "When enabled, Analytics helps MiJoy Enterprises LLC understand how visitors use public pages and shopping features. Advertising and targeting technologies are not activated through this setting.",
  ],
  bullets: [
    "Measurement ID: G-CX654R9L09.",
    "Measured activity may include public page views, product views, additions to and removals from the cart, checkout starts, and completed purchases.",
    "Names, email addresses, deed names, gift-recipient information, gift messages, account pages, private documents, and customer credentials are not included in Analytics events.",
    "Page-view measurement omits URL query strings.",
    "Google Signals and advertising-personalization features are disabled in the Orbital One configuration.",
    "Visitors may withdraw Analytics consent at any time through the Cookie Settings link. Analytics is then disabled and the applicable first-party Google Analytics cookies are removed where the browser permits.",
  ],
};

const cookieDocument = {
  ...LEGAL_DOCUMENTS.cookies,
  sections: [
    ...LEGAL_DOCUMENTS.cookies.sections.filter(
      (section) =>
        section.heading !== analyticsSection.heading
    ),
    analyticsSection,
  ],
};

export default function Page() {
  return <LegalPolicyPage document={cookieDocument} />;
}
