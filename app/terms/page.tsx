import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";

export const metadata: Metadata = {
  title: "Terms and Conditions | Orbital One Realty",
  description: "Terms governing Orbital One Realty novelty lunar products and services.",
};

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.terms} />;
}
