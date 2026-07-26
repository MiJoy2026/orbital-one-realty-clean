import Link from "next/link";

import type { LegalDocument } from "@/lib/legal-documents";
import { LEGAL_EFFECTIVE_DATE, LEGAL_ENTITY } from "@/lib/legal-config";

export default function LegalPolicyPage({
  document,
}: {
  document: LegalDocument;
}) {
  return (
    <main className="min-h-screen bg-[#02040a] px-6 py-16 text-white sm:py-20">
      <article className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400 hover:text-yellow-300"
        >
          ← Orbital One Realty
        </Link>

        <header className="mt-8 rounded-[2rem] border border-yellow-300/20 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-yellow-400">
            Legal and Customer Information
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            {document.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            {document.description}
          </p>
          <p className="mt-6 text-sm font-semibold text-slate-400">
            Effective date: {LEGAL_EFFECTIVE_DATE}
          </p>
        </header>

        <div className="mt-8 space-y-6">
          {document.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8"
            >
              <h2 className="text-xl font-black text-yellow-300 sm:text-2xl">
                {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-base leading-8 text-slate-300"
                >
                  {paragraph}
                </p>
              ))}

              {section.bullets && (
                <ul className="mt-5 space-y-3 text-base leading-7 text-slate-300">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-yellow-300/20 bg-yellow-300/[0.06] p-6 sm:p-8">
          <h2 className="text-xl font-black text-yellow-300">Contact</h2>
          <p className="mt-4 leading-7 text-slate-300">
            <strong>{LEGAL_ENTITY.legalName}</strong>
            <br />
            Operating under the {LEGAL_ENTITY.brandName} brand
            <br />
            Email: {LEGAL_ENTITY.email}
            <br />
            {LEGAL_ENTITY.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </section>

        <p className="mt-8 text-center text-xs leading-6 text-slate-600">
          This website content is general business information and is not a
          substitute for advice from a qualified attorney concerning a specific
          legal matter.
        </p>
      </article>
    </main>
  );
}
