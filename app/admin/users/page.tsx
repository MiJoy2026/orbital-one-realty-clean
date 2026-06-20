import AdminNav from "../../../components/AdminNav";
import { prisma } from "../../../lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orders: true,
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black uppercase text-yellow-400">
          Admin Users
        </h1>

        <AdminNav />

        <p className="mt-4 text-gray-300">
          Registered Orbital One Realty customer accounts.
        </p>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full border-collapse text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Registered</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="p-4 font-bold text-yellow-400">
                    {user.name || "Unnamed User"}
                  </td>

                  <td className="p-4">{user.email}</td>

                  <td className="p-4">{user.orders.length}</td>

                  <td className="p-4">
                    {user.createdAt.toLocaleDateString()}
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