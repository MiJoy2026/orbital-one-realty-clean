import { NO_INDEX_FOLLOW } from "@/lib/route-metadata";

export const metadata = NO_INDEX_FOLLOW;

export default function SeoPrivacyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
