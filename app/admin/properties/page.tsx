import PropertyStatusButton from "../../../components/PropertyStatusButton";
import { prisma } from "../../../lib/prisma";

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: {
      id: "asc",
    },
  });

  const availableCount = properties.filter(
    (property) => property.status === "Available"
  ).length;

  const soldCount = properties.filter(
    (property) => property.status === "Sold"
  ).length;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Admin Properties
        </h1>

        <p className="mt-4 text-gray-300">
          Manage Orbital One Realty property inventory.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Total Properties</p>
            <p className="mt-2 text-4xl font-black">{properties.length}</p>
          </div>

          <div className="rounded-2xl border border-green-500 bg-green-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">Available</p>
            <p className="mt-2 text-4xl font-black text-green-400">
              {availableCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500 bg-red-950/30 p-6">
            <p className="text-sm uppercase text-gray-400">Sold</p>
            <p className="mt-2 text-4xl font-black text-red-400">
              {soldCount}
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full border-collapse text-left">
            <thead className="bg-white/10">
              <tr>
                   <th className="p-4">Property ID</th>
                   <th className="p-4">State</th>
                   <th className="p-4">Type</th>
                   <th className="p-4">Size</th>
                   <th className="p-4">Price</th>
                   <th className="p-4">Status</th>
                   <th className="p-4">Actions</th>
                </tr>
                  </thead>

                <tbody>
                 {properties.map((property) => (
                  <tr key={property.id} className="border-t border-white/10">
                    <td className="p-4 font-bold text-yellow-400">
                    {property.id}
                </td>

                 <td className="p-4">{property.state}</td>

                 <td className="p-4">{property.type}</td>

                 <td className="p-4">{property.size}</td>

                 <td className="p-4">
                  ${property.price.toFixed(2)}
                </td>

                 <td className="p-4">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                  property.status === "Sold"
                    ? "bg-red-600 text-white"
                    : "bg-green-500 text-black"
          }`}
        >
          {property.status}
        </span>
      </td>

      <td className="p-4">
        <div className="flex gap-2">
          <PropertyStatusButton
            propertyId={property.id}
            status="Available"
          />

          <PropertyStatusButton
            propertyId={property.id}
            status="Sold"
          />
         </div>
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