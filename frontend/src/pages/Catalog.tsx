import { useMemo, useState } from "react";
import { api } from "../api/client";
import { useFetch } from "../api/useFetch";
import type { Device } from "../api/types";
import "./Catalog.css";

type CategoryFilter = Device["category"] | "all";

export default function Catalog() {
  const { data, loading, error } = useFetch<Device[]>(api.devices);
  const [selected, setSelected] = useState<CategoryFilter>("all");

  const categories = useMemo(
    () => Array.from(new Set((data ?? []).map((d) => d.category))),
    [data]
  );

  if (loading) return <p className="text-slate-500">Loading devices…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const devices = data ?? [];
  const visible =
    selected === "all" ? devices : devices.filter((d) => d.category === selected);
  const options: CategoryFilter[] = ["all", ...categories];

  const formatPrice = (device: any) => `$${device.retailPrice.toFixed(2)}`;

  return (
    <section>
      <h1 className="catalog-heading mb-4 text-2xl font-bold">Device Catalog</h1>
      <div
        role="group"
        aria-label="Filter by category"
        data-testid="category-filter"
        className="mb-4 flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const active = option === selected;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(option)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize shadow-sm transition-colors ${
                active
                  ? "bg-carrier-500 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="text-slate-500">No devices in this category.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((device) => (
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
              {formatPrice(device)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
