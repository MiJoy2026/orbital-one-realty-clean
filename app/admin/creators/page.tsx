import AdminNav from "@/components/AdminNav";
import CreatorApplicationActions from "@/components/CreatorApplicationActions";
import CreatorPartnerStatusControls from "@/components/CreatorPartnerStatusControls";
import { prisma } from "@/lib/prisma";

function statusClasses(status: string): string {
  if (status === "Approved") {
    return "bg-green-500 text-black";
  }

  if (status === "Rejected") {
    return "bg-red-600 text-white";
  }

  return "bg-yellow-400 text-black";
}

function partnerStatusClasses(status: string): string {
  if (status === "Active") {
    return "bg-green-500 text-black";
  }

  if (status === "Suspended") {
    return "bg-yellow-400 text-black";
  }

  if (status === "Terminated") {
    return "bg-red-600 text-white";
  }

  return "bg-gray-600 text-white";
}

export default async function AdminCreatorsPage() {
    const applications = await prisma.creatorApplication.findMany({
    include: {
      partner: {
        include: {
          statusEvents: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const pendingCount = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === "Approved"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Creator Applications
        </h1>

        <AdminNav />

        <p className="mt-4 text-gray-300">
          Review applications, approve Creator Partners, and issue unique
          tracking codes.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">
              Total Applications
            </p>
            <p className="mt-2 text-4xl font-black">
              {applications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400 bg-yellow-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">Pending</p>
            <p className="mt-2 text-4xl font-black text-yellow-400">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500 bg-green-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">Approved</p>
            <p className="mt-2 text-4xl font-black text-green-400">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500 bg-red-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">Rejected</p>
            <p className="mt-2 text-4xl font-black text-red-400">
              {rejectedCount}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-2xl border border-white/20 bg-white/5 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-yellow-400">
                    {application.fullName}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Submitted {application.createdAt.toLocaleString()}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-black ${statusClasses(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-black text-gray-400">Email:</span>{" "}
                    <a
                      href={`mailto:${application.email}`}
                      className="text-yellow-300 underline"
                    >
                      {application.email}
                    </a>
                  </p>

                  <p>
                    <span className="font-black text-gray-400">Country:</span>{" "}
                    {application.country}
                  </p>

                  <p>
                    <span className="font-black text-gray-400">Platform:</span>{" "}
                    {application.primaryPlatform}
                  </p>

                  <p>
                    <span className="font-black text-gray-400">Handle:</span>{" "}
                    {application.handle}
                  </p>

                  <p>
                    <span className="font-black text-gray-400">Audience:</span>{" "}
                    {application.audienceSize}
                  </p>

                  <p>
                    <span className="font-black text-gray-400">Profile:</span>{" "}
                    <a
                      href={application.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-yellow-300 underline"
                    >
                      {application.profileUrl}
                    </a>
                  </p>

                  <p>
                    <span className="font-black text-gray-400">
                      Terms version:
                    </span>{" "}
                    {application.termsVersion}
                  </p>

                  {application.partner && (
  <div className="rounded-xl border border-white/20 bg-black/30 p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <p className="font-black text-yellow-300">
        Creator Partner Account
      </p>

      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${partnerStatusClasses(
          application.partner.status
        )}`}
      >
        {application.partner.status}
      </span>
    </div>

    <p className="mt-4">
      <span className="font-black text-gray-400">
        Tracking code:
      </span>{" "}
      <span className="font-mono text-yellow-300">
        {application.partner.trackingCode}
      </span>
    </p>

    <p className="mt-2">
      <span className="font-black text-gray-400">
        Approved:
      </span>{" "}
      {application.partner.approvedAt.toLocaleString()}
    </p>

    {application.partner.suspendedAt && (
      <p className="mt-2">
        <span className="font-black text-gray-400">
          Suspended:
        </span>{" "}
        {application.partner.suspendedAt.toLocaleString()}
      </p>
    )}

    {application.partner.terminatedAt && (
      <p className="mt-2">
        <span className="font-black text-gray-400">
          Terminated:
        </span>{" "}
        {application.partner.terminatedAt.toLocaleString()}
      </p>
    )}

    <div className="mt-5 border-t border-white/10 pt-5">
      <CreatorPartnerStatusControls
        creatorPartnerId={application.partner.id}
        creatorName={application.partner.fullName}
        status={application.partner.status}
      />
    </div>

    <div className="mt-5 border-t border-white/10 pt-5">
      <h4 className="font-black text-yellow-300">
        Status History
      </h4>

      <div className="mt-3 space-y-3">
             {application.partner.statusEvents.map(
               (event) => (
                 <div
                   key={event.id}
                   className="rounded-lg border border-white/10 bg-white/5 p-3"
                 >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black">
                       {event.previousStatus} → {event.newStatus}
                      </p>

                      <p className="text-xs text-gray-500">
                        {event.createdAt.toLocaleString()}
                      </p>
                    </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">
                        {event.reason}
                      </p>
                 </div>
               )
             )}

              {application.partner.statusEvents.length === 0 && (
                <p className="text-sm text-gray-400">
                  No account-status changes have been recorded.
                </p>
              )}
      </div>
    </div>
  </div>
)}
                </div>

                <div className="space-y-5">
                  <section>
                    <h3 className="font-black text-yellow-300">
                      Content focus
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-300">
                      {application.contentFocus}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-black text-yellow-300">
                      Why the program fits
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-300">
                      {application.whyFit}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-black text-yellow-300">
                      Campaign idea
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-300">
                      {application.campaignIdea || "Not provided."}
                    </p>
                  </section>
                </div>
              </div>

              <div className="mt-7 border-t border-white/10 pt-6">
                <CreatorApplicationActions
                  applicationId={application.id}
                  currentStatus={application.status}
                  hasPartner={Boolean(application.partner)}
                  initialReviewNotes={application.reviewNotes}
                />
              </div>
            </article>
          ))}

          {applications.length === 0 && (
            <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center text-gray-400">
              No Creator Partner applications have been submitted yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}