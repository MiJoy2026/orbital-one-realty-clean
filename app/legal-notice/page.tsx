import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Website Legal Notice and Intellectual Property Policy | Orbital One Realty",
  description:
    "Trademark, copyright, attribution, NASA non-affiliation, and novelty lunar property notices for Orbital One Realty.",
  path: "/legal-notice",
});

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.legalNotice} />;
}
