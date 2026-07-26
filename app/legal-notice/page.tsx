import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";

export const metadata: Metadata = {
  title: "Legal Notice | Orbital One Realty",
  description: "Trademark, copyright, attribution, and novelty-property notices.",
};

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.legalNotice} />;
}
