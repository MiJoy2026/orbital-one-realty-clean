import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";

export const metadata: Metadata = {
  title: "Cookie Policy | Orbital One Realty",
  description: "Current cookie and browser-storage practices for Orbital One Realty.",
};

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.cookies} />;
}
