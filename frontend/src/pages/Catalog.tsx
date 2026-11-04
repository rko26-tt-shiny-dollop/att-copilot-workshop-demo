import { api } from "../api/client";
import { useFetch } from "../api/useFetch";
import type { Device } from "../api/types";

export default function Catalog() {
  const { data, loading, error } = useFetch<Device[]>(api.devices);

  if (loading) return <p className="text-slate-500">Loading devices…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Device Catalog</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((device) => (
          <div
            key={device.id}
            data-testid="device-card"
            className="rounded-xl bg-white p-5 shadow-sm"
          >
            <div className="text-xs uppercase tracking-wide text-carrier-500">
              {device.category}
            </div>
            <h2 className="mt-1 font-semibold text-slate-900">{device.model}</h2>
            <div className="mt-1 text-sm text-slate-500">SKU: {device.sku}</div>
            <div className="mt-3 text-lg font-bold text-slate-900">
              ${device.retailPrice.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
