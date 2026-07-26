import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Shipping and Digital Delivery Policy | Orbital One Realty",
  description:
    "How Orbital One Realty processes and electronically delivers personalized novelty lunar property documents and digital products.",
  path: "/shipping-delivery",
});

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.shippingDelivery} />;
}
