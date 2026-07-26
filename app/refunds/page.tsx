import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy | Orbital One Realty",
  description: "Refund and cancellation rules for personalized digital orders.",
};

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.refunds} />;
}
