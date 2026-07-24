type LunaScapeImageGalleryProps = {
  snapshotId: string;
  propertyId: string;
  compact?: boolean;
  showDescription?: boolean;
};

export default function LunaScapeImageGallery({
  snapshotId,
  propertyId,
  compact = false,
  showDescription = true,
}: LunaScapeImageGalleryProps) {
  const scenicImage = `/api/property-image/${snapshotId}?view=scenic&size=thumb`;
  const locatorImage = `/api/property-image/${snapshotId}?view=locator&size=thumb`;
  const scenicDownload = `/api/property-image/${snapshotId}?view=scenic&download=1`;
  const locatorDownload = `/api/property-image/${snapshotId}?view=locator&download=1`;

  return (
    <section className={compact ? "p-4" : "p-6"}>
      {showDescription && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
              LunaScape Collection
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Scenic view and parcel locator
            </h3>
          </div>
          <p className="max-w-xl text-sm text-gray-400">
            The scenic portrait uses detailed LROC lunar imagery centered on
            the recorded parcel. The locator preserves the exact map context.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-yellow-400/50 bg-black/40">
          <img
            src={scenicImage}
            alt={`Scenic lunar terrain view for ${propertyId}`}
            loading="lazy"
            className="aspect-[8/5] w-full object-cover"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-black text-yellow-400">Scenic Property View</p>
              <p className="mt-1 text-xs text-gray-400">
                Shareable real-terrain portrait
              </p>
            </div>
            <a
              href={scenicDownload}
              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black"
            >
              Download Scenic View
            </a>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/20 bg-black/40">
          <img
            src={locatorImage}
            alt={`Parcel locator for ${propertyId}`}
            loading="lazy"
            className="aspect-[8/5] w-full object-cover"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-black text-white">Parcel Locator</p>
              <p className="mt-1 text-xs text-gray-400">
                Exact ownership map context
              </p>
            </div>
            <a
              href={locatorDownload}
              className="rounded-xl border border-white/30 px-4 py-2 text-sm font-black text-white"
            >
              Download Locator
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
