import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy | Orbital One Realty",
  description:
    "Cookie, local-storage, authentication, cart, reservation, checkout, security, privacy-preference, Google Analytics, and Meta Pixel practices.",
  path: "/cookies",
});

const analyticsSection = {
  heading: "Optional Google Analytics 4",
  paragraphs: [
    "Orbital One Realty uses Google Analytics 4 only after a visitor affirmatively enables Analytics and Performance through Cookie Settings. The Google Analytics script is not loaded and analytics information is not transmitted before that choice.",
    "When enabled, Analytics helps MiJoy Enterprises LLC understand how visitors use public pages and shopping features. Meta Pixel and other advertising technologies are controlled separately through Advertising and Targeting settings.",
  ],
  bullets: [
    "Measurement ID: G-CX654R9L09.",
    "Measured activity may include public page views, product views, additions to and removals from the cart, checkout starts, and completed purchases.",
    "Names, email addresses, deed names, gift-recipient information, gift messages, account pages, private documents, and customer credentials are not intentionally included in Analytics events.",
    "Page-view measurement omits URL query strings.",
    "Google Signals and Google advertising-personalization features are disabled in the Orbital One configuration.",
    "Visitors may withdraw Analytics consent at any time through Cookie Settings. Analytics is then disabled and applicable first-party Google Analytics cookies are removed where the browser permits.",
  ],
};

const metaPixelSection = {
  heading: "Optional Meta Pixel",
  paragraphs: [
    "Orbital One Realty uses Meta Pixel only after a visitor affirmatively enables Advertising and Targeting through Cookie Settings. The Meta Pixel script is not loaded before that choice.",
    "When enabled, Meta Pixel helps MiJoy Enterprises LLC measure advertising performance, understand visits and shopping activity, attribute results to advertising campaigns, and create audiences for relevant Orbital One Realty advertising.",
    "Meta may use cookies, pixels, web beacons, and similar storage technologies to collect or receive information from this website and elsewhere for advertising measurement, audience creation, and ad delivery.",
  ],
  bullets: [
    "Meta Pixel and Dataset ID: 2040256933245673.",
    "Information may include public page visits, browser and device information, approximate location derived from an internet address, referring pages, website addresses, Meta cookie identifiers, and shopping-event information configured by Orbital One Realty.",
    "Orbital One Realty does not intentionally include customer names, email addresses, deed names, gift-recipient details, gift messages, login credentials, account pages, private documents, or payment-card information in Meta Pixel events.",
    "Pixel page-view tracking excludes account, administrative, authentication, checkout, success, verification, and other private page areas configured by Orbital One Realty.",
    "Visitors may withdraw Advertising and Targeting consent through Cookie Settings. Further Pixel events are then stopped, consent is revoked, and applicable first-party Meta cookies are removed where the browser permits.",
    "Visitors may also manage advertising preferences through their Meta account and browser privacy controls.",
  ],
};

const cookieDocument = {
  ...LEGAL_DOCUMENTS.cookies,
  sections: [
    ...LEGAL_DOCUMENTS.cookies.sections.filter(
      (section) =>
        section.heading !== analyticsSection.heading &&
        section.heading !== metaPixelSection.heading
    ),
    analyticsSection,
    metaPixelSection,
  ],
};

export default function Page() {
  return <LegalPolicyPage document={cookieDocument} />;
}