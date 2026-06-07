import AdminOrderSearch from "../../../components/AdminOrderSearch";
import AdminNav from "../../../components/AdminNav";
import { prisma } from "../../../lib/prisma";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const orders = await prisma.order.findMany({
  where: search
    ? {
        OR: [
          { certificateNumber: { contains: search, mode: "insensitive" } },
          { deedName: { contains: search, mode: "insensitive" } },
          { propertyId: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : undefined,
  orderBy: {
    createdAt: "desc",
  },
});

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Admin Orders
        </h1>
        <AdminNav />
        <p className="mt-4 text-gray-300">
          View recorded Orbital One Realty purchases.
        </p>
        
        <AdminOrderSearch />

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full border-collapse text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="p-4">Certificate</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Property</th>
                <th className="p-4">State</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Email</th>
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
                  <td className="p-4">
                    {order.propertyId} / {order.propertyType}
                  </td>
                  <td className="p-4">{order.lunarState}</td>
                  <td className="p-4">${order.amountPaid.toFixed(2)}</td>
                  <td className="p-4">{order.paymentStatus}</td>
                  <td className="p-4">{order.email || "N/A"}</td>
                  <td className="p-4">
                    {order.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <p className="mt-8 text-gray-400">
            No orders have been recorded yet.
          </p>
        )}
      </div>
    </main>
  );
}