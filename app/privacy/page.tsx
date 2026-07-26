import type { Metadata } from "next";

import LegalPolicyPage from "@/components/LegalPolicyPage";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy | Orbital One Realty",
  description:
    "How Orbital One Realty and MiJoy Enterprises LLC collect, use, disclose, retain, and protect personal information.",
  path: "/privacy",
});

export default function Page() {
  return <LegalPolicyPage document={LEGAL_DOCUMENTS.privacy} />;
}
