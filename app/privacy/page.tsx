import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy | Orbital One Realty",
  description:
    "How Orbital One Realty and MiJoy Enterprises LLC collect, use, disclose, retain, and protect personal information, including optional analytics and advertising-measurement information.",
  path: "/privacy",
});

const analyticsSection = {
  heading: "Optional Analytics Information",
  paragraphs: [
    "With the visitor's affirmative consent, Orbital One Realty uses Google Analytics 4 to measure use of public website pages and shopping activity. Analytics remains disabled unless the visitor enables Analytics and Performance through Cookie Settings.",
    "Orbital One configures these events to avoid intentionally transmitting customer names, email addresses, deed names, gift-recipient details, gift messages, account activity, private documents, or login credentials.",
  ],
  bullets: [
    "Public page views may be measured without URL query strings.",
    "Shopping measurement may include product views, cart activity, checkout starts, transaction totals, product categories, and completed purchases.",
    "Public certificate numbers may be combined into a transaction identifier to prevent duplicate purchase reporting without sending Stripe identifiers.",
    "Advertising personalization and Google Signals are disabled in the Orbital One configuration.",
    "Analytics consent may be withdrawn through Cookie Settings.",
  ],
};

const advertisingSection = {
  heading: "Optional Advertising and Measurement Information",
  paragraphs: [
    "With the visitor's affirmative consent, Orbital One Realty uses Meta Pixel to measure advertising performance and activity on public website pages. Meta Pixel remains disabled unless the visitor enables Advertising and Targeting through Cookie Settings.",
    "Meta may receive event information about visits and actions on the website together with browser, device, internet-address, referring-page, website-address, and Meta cookie information. Meta may use that information for measurement, attribution, audience creation, and advertising services according to its own terms and privacy practices.",
    "Orbital One Realty configures its Pixel integration to avoid intentionally including customer names, email addresses, deed names, gift-recipient information, gift messages, login credentials, account pages, private documents, or payment-card information in Pixel events.",
  ],
  bullets: [
    "Meta Pixel and Dataset ID: 2040256933245673.",
    "Measured activity may include public page visits and shopping actions configured by Orbital One Realty.",
    "Private account, administrative, authentication, checkout, success, verification, and document areas are excluded from Pixel page-view tracking.",
    "Advertising and Targeting consent is separate from Google Analytics consent.",
    "Consent may be withdrawn at any time through Cookie Settings.",
    "When consent is withdrawn, Orbital One stops sending further Pixel events and attempts to remove applicable first-party Meta cookies where the browser permits.",
  ],
};

const privacyDocument = {
  ...LEGAL_DOCUMENTS.privacy,
  sections: [
    ...LEGAL_DOCUMENTS.privacy.sections.filter(
      (section) =>
        section.heading !== analyticsSection.heading &&
        section.heading !== advertisingSection.heading
    ),
    analyticsSection,
    advertisingSection,
  ],
};

export default function Page() {
  return <LegalPolicyPage document={privacyDocument} />;
}