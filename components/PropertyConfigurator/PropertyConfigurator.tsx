"use client";

import { useEffect, type ReactNode } from "react";

type PropertyConfiguratorProps = {
  open: boolean;
  onClose: () => void;
  propertyName: string;
  children?: ReactNode;
};

export default function PropertyConfigurator({
  open,
  onClose,
  propertyName,
  children,
}: PropertyConfiguratorProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Configure ${propertyName}`}
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-2xl flex-col border-l border-yellow-300/20 bg-gradient-to-b from-slate-950 via-[#070a12] to-black shadow-2xl shadow-black/70 transition-transform duration-500 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-400">
                Mission Control
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                {propertyName}
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
                Personalize your lunar property package and review the live
                total before adding it to your cart.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close configurator"
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg transition hover:border-white/20 hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-semibold uppercase tracking-wider">
            <div className="rounded-lg bg-yellow-300 px-3 py-2 text-black">
              1. Personalize
            </div>

            <div className="rounded-lg bg-white/5 px-3 py-2 text-slate-400">
              2. Review
            </div>

            <div className="rounded-lg bg-white/5 px-3 py-2 text-slate-400">
              3. Add to Cart
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
          {children}
        </div>
      </aside>
    </>
  );
}