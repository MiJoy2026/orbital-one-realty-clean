import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Accessibility Statement | Orbital One Realty",
  description:
    "Orbital One Realty accessibility goals, known limitations, alternative access, and assistance options.",
  path: "/accessibility",
});

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.accessibility} />;
}
