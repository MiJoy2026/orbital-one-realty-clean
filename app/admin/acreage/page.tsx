import AdminNav from "../../../components/AdminNav";
import type { AcreageAllocation } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

export default async function AdminAcreagePage() {
  const allocations = await prisma.acreageAllocation.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Acreage Allocations
        </h1>

        <AdminNav />

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="p-4">Certificate</th>
                <th className="p-4">State</th>
                <th className="p-4">Start Acre</th>
                <th className="p-4">End Acre</th>
                <th className="p-4">Acres</th>
              </tr>
            </thead>

            <tbody>
              {allocations.map((allocation: AcreageAllocation) => (
                <tr
                  key={allocation.id}
                  className="border-t border-white/10"
                >
                  <td className="p-4 text-yellow-400">
                    {allocation.certificateNumber}
                  </td>

                  <td className="p-4">
                    {allocation.stateName}
                  </td>

                  <td className="p-4">
                    {allocation.startingAcre.toLocaleString()}
                  </td>

                  <td className="p-4">
                    {allocation.endingAcre.toLocaleString()}
                  </td>

                  <td className="p-4">
                    {allocation.acresAssigned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}