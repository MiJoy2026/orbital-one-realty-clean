type LunaScapeImageGalleryProps = {
  snapshotId: string;
  propertyId: string;
  compact?: boolean;
  showDescription?: boolean;
  accessToken?: string;
};

export default function LunaScapeImageGallery({
  snapshotId,
  propertyId,
  compact = false,
  showDescription = true,
  accessToken,
}: LunaScapeImageGalleryProps) {
  const accessSuffix = accessToken
    ? `&access=${encodeURIComponent(accessToken)}`
    : "";
  const exactImage = `/api/property-image/${snapshotId}?view=scenic&size=thumb&v=exact-parcel-3${accessSuffix}`;
  const exactFull = `/api/property-image/${snapshotId}?view=scenic&v=exact-parcel-3${accessSuffix}`;
  const exactDownload = `/api/property-image/${snapshotId}?view=scenic&download=1&v=exact-parcel-3${accessSuffix}`;
  const virtualImage = `/api/property-image/${snapshotId}?view=virtual&size=thumb&v=virtual-scene-1${accessSuffix}`;
  const virtualFull = `/api/property-image/${snapshotId}?view=virtual&v=virtual-scene-1${accessSuffix}`;
  const virtualDownload = `/api/property-image/${snapshotId}?view=virtual&download=1&v=virtual-scene-1${accessSuffix}`;

  return (
    <section className={compact ? "p-4" : "p-6"}>
      {showDescription && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
              LunaScape Collection
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Two views of your lunar property
            </h3>
          </div>
          <p className="max-w-2xl text-sm text-gray-400">
            One view records the actual terrain beneath your purchased parcel.
            The other begins your future LunaScape experience with a polished
            virtual interpretation matched to the property type and local context.
          </p>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-yellow-400/55 bg-black/50 shadow-[0_0_35px_rgba(250,204,21,0.10)]">
          <a href={exactFull} target="_blank" rel="noreferrer">
            <img
              src={exactImage}
              alt={`Your Place on the Moon for ${propertyId}`}
              loading="lazy"
              className="aspect-[8/5] w-full object-cover transition duration-500 hover:scale-[1.01]"
            />
          </a>
          <div className="border-t border-yellow-400/20 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-black text-yellow-400">
                    Your Place on the Moon
                  </p>
                  <span className="rounded-full border border-yellow-400/45 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-300">
                    Actual Parcel View
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Real lunar imagery directly beneath the purchased parcel. The
                  thin outline identifies the exact owned square.
                </p>
              </div>
              <a
                href={exactDownload}
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-300"
              >
                Download
              </a>
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-cyan-300/40 bg-black/50 shadow-[0_0_35px_rgba(103,232,249,0.09)]">
          <a href={virtualFull} target="_blank" rel="noreferrer">
            <img
              src={virtualImage}
              alt={`Your LunaScape Property for ${propertyId}`}
              loading="lazy"
              className="aspect-video w-full object-cover transition duration-500 hover:scale-[1.01]"
            />
          </a>
          <div className="border-t border-cyan-300/15 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-black text-cyan-300">
                    Your LunaScape Property
                  </p>
                  <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200">
                    Virtual Property Preview
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  A realistic, user-friendly LunaScape scene matched to rural,
                  town, or city property. Nearby lunar attractions can appear
                  faintly as local background context.
                </p>
              </div>
              <a
                href={virtualDownload}
                className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
              >
                Download
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
