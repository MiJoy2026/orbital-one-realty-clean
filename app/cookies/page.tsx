import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy | Orbital One Realty",
  description:
    "Current cookie, local-storage, authentication, cart, reservation, checkout, security, and privacy-preference practices.",
  path: "/cookies",
});

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.cookies} />;
}
