export default function OwnerInformation() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

      <h3 className="text-xl font-bold">
        Owner Information
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        This section will collect the owner's information.
      </p>

      <div className="mt-6 space-y-4">

        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-yellow-400"
          placeholder="Owner Name"
        />

        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-yellow-400"
          placeholder="Additional Owner (Optional)"
        />

      </div>

    </div>
  );
}