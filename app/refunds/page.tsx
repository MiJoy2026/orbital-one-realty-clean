import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Refund and Cancellation Policy | Orbital One Realty",
  description:
    "Refund and cancellation rules for personalized Orbital One Realty digital products and novelty lunar property orders.",
  path: "/refunds",
});

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.refunds} />;
}
