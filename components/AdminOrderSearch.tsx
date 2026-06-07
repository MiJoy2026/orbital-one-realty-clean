"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminOrderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    if (search.trim()) {
      router.push(`/admin/orders?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/admin/orders");
    }
  }

  return (
    <form onSubmit={handleSearch} className="mt-8 flex flex-wrap gap-3">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search certificate, email, recipient, or property ID..."
        className="min-w-[280px] flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white placeholder:text-gray-400"
      />

      <button
        type="submit"
        className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
      >
        Search
      </button>

      <button
        type="button"
        onClick={() => {
          setSearch("");
          router.push("/admin/orders");
        }}
        className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
      >
        Clear
      </button>
    </form>
  );
}