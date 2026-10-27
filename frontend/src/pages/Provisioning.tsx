import { api } from "../api/client";
import { useFetch } from "../api/useFetch";
import type { Provisioning } from "../api/types";

const statusColor: Record<string, string> = {
  activated: "bg-green-100 text-green-700",
  in_progress: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-600",
  failed: "bg-red-100 text-red-700",
};

export default function ProvisioningPage() {
  const { data, loading, error } = useFetch<Provisioning[]>(api.provisionings);

  if (loading) return <p className="text-slate-500">Loading provisioning…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Provisioning Status</h1>
      <div className="space-y-3">
        {data?.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
          >
            <div>
              <div className="font-semibold">Line #{p.orderLineId}</div>
              <div className="text-sm text-slate-600">{p.notes}</div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                statusColor[p.status] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
