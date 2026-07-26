import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";

export const metadata: Metadata = {
  title: "Digital Delivery Policy | Orbital One Realty",
  description: "How Orbital One Realty processes and delivers digital products.",
};

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.shippingDelivery} />;
}
