import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";

export const metadata: Metadata = {
  title: "Accessibility Statement | Orbital One Realty",
  description: "Orbital One Realty accessibility goals and assistance options.",
};

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.accessibility} />;
}
