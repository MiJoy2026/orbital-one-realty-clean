export default function AdminNav() {
  return (
    <nav className="mb-10 rounded-2xl border border-yellow-400/30 bg-white/5 p-4">
      <div className="flex flex-wrap gap-3">
        <a
          href="/admin/dashboard"
          className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black"
        >
          Dashboard
        </a>

        <a
          href="/admin/orders"
          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
        >
          Orders
        </a>
        <a
          href="/admin/creators"
          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
        >
          Creators
        </a>
        <a
          href="/admin/creator-commissions"
          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
        >
          Commissions
        </a>
        <a
          href="/admin/inventory"
          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
        >
          Inventory
        </a>
        <a
          href="/admin/properties"
          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
        >
          Properties
        </a>

        <a
          href="/admin/property-images"
          className="rounded-xl border border-yellow-400 px-5 py-3 font-black text-yellow-400"
        >
          Property Images
        </a>

        <a
          href="/admin/logout"
          className="rounded-xl border border-red-400 px-5 py-3 font-black text-red-300 transition hover:bg-red-500 hover:text-white"
        >
          Log Out
        </a>
        <a
          href="/"
          className="rounded-xl border border-white/30 px-5 py-3 font-black text-white"
        >
          View Site
        </a>
      </div>
    </nav>
  );
}