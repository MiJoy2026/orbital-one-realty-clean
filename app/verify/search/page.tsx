import { redirect } from "next/navigation";

export default async function VerifySearchRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ certificateNumber?: string }>;
}) {
  const params = await searchParams;
  const certificateNumber = params.certificateNumber?.trim();

  if (!certificateNumber) {
    redirect("/verify");
  }

  redirect(`/verify/${encodeURIComponent(certificateNumber)}`);
}