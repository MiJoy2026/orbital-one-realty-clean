import AdminNav from "../../../components/AdminNav";
import { prisma } from "../../../lib/prisma";

export default async function AdminInventoryPage() {
  const inventories = await prisma.stateInventory.findMany({
    orderBy: {
      stateName: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          State Acreage Inventory
        </h1>

        <AdminNav />

        <p className="mt-4 text-gray-300">
          Rural acreage inventory across all Orbital One Realty lunar states.
        </p>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full border-collapse text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="p-4">State</th>
                <th className="p-4">Total Acres</th>
                <th className="p-4">Sold Acres</th>
                <th className="p-4">Available Acres</th>
              </tr>
            </thead>

            <tbody>
              {inventories.map((inventory) => {
                const availableAcres =
                  inventory.totalAcres - inventory.soldAcres;

                return (
                  <tr
                    key={inventory.id}
                    className="border-t border-white/10"
                  >
                    <td className="p-4 font-bold text-yellow-400">
                      {inventory.stateName}
                    </td>
                    <td className="p-4">
                      {inventory.totalAcres.toLocaleString()}
                    </td>
                    <td className="p-4">
                      {inventory.soldAcres.toLocaleString()}
                    </td>
                    <td className="p-4 text-green-400">
                      {availableAcres.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}