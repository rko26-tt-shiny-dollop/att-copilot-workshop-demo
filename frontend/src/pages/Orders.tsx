import { api } from "../api/client";
import { useFetch } from "../api/useFetch";
import type { ActivationOrder } from "../api/types";

const statusColor: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  provisioning: "bg-amber-100 text-amber-700",
  submitted: "bg-blue-100 text-blue-700",
  draft: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const { data, loading, error } = useFetch<ActivationOrder[]>(
    api.activationOrders
  );

  if (loading) return <p className="text-slate-500">Loading orders…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Activation Orders</h1>
      <table className="w-full overflow-hidden rounded-xl bg-white text-left text-sm shadow-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3">Order #</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((order) => (
            <tr key={order.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-mono">{order.orderNumber}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    statusColor[order.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
