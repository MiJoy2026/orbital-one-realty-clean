import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms and Conditions | Orbital One Realty",
  description:
    "Terms governing Orbital One Realty novelty lunar property, LunaSphere, LunaScape, customer accounts, purchases, and digital services.",
  path: "/terms",
});

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.terms} />;
}
