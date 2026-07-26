import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";

export const metadata: Metadata = {
  title: "Privacy Policy | Orbital One Realty",
  description: "How Orbital One Realty handles personal information.",
};

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.privacy} />;
}
