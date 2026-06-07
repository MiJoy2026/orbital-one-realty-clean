import { prisma } from "../../../lib/prisma";

export default async function AdminDashboardPage() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const allOrders = await prisma.order.findMany();
  const properties = await prisma.property.findMany();

  const totalRevenue = allOrders.reduce(
    (sum, order) => sum + order.amountPaid,
    0
  );

  const availableCount = properties.filter(
    (property) => property.status === "Available"
  ).length;

  const soldCount = properties.filter(
    (property) => property.status === "Sold"
  ).length;

  const averageSale =
    allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Admin Dashboard
        </h1>

        <p className="mt-4 text-gray-300">
          Orbital One Realty business overview.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400/40 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Total Revenue</p>
            <p className="mt-2 text-4xl font-black text-yellow-400">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Total Orders</p>
            <p className="mt-2 text-4xl font-black">{allOrders.length}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <p className="text-sm uppercase text-gray-400">Average Sale</p>
            <p className="mt-2 text-4xl font-black">
              ${averageSale.toFixed(2)}
            </p>
          </div>

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

        <div className="mt-12 rounded-2xl border border-white/20 bg-white/5 p-6">
          <h2 className="text-2xl font-black text-yellow-400">
            Recent Orders
          </h2>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-4">Certificate</th>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-white/10">
                    <td className="p-4 font-bold text-yellow-400">
                      {order.certificateNumber}
                    </td>
                    <td className="p-4">{order.deedName}</td>
                    <td className="p-4">{order.propertyId}</td>
                    <td className="p-4">${order.amountPaid.toFixed(2)}</td>
                    <td className="p-4">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <p className="mt-6 text-gray-400">No recent orders yet.</p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/admin/orders"
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            View Orders
          </a>

          <a
            href="/admin/properties"
            className="rounded-xl border border-yellow-400 px-6 py-3 font-black text-yellow-400"
          >
            Manage Properties
          </a>
        </div>
      </div>
    </main>
  );
}