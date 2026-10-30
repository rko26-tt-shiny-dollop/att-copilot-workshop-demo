import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useFetch } from "../api/useFetch";
import type { Device, DeviceOem, RatePlan } from "../api/types";
import { useCart } from "../cart/CartContext";

interface CatalogData {
  devices: Device[];
  ratePlans: RatePlan[];
  oems: DeviceOem[];
}

const loadCatalog = async (): Promise<CatalogData> => {
  const [devices, ratePlans, oems] = await Promise.all([
    api.devices(),
    api.ratePlans(),
    api.deviceOems(),
  ]);
  return { devices, ratePlans, oems };
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const planSummary = (plan: RatePlan): string => {
  const data = plan.dataGb === "unlimited" ? "Unlimited data" : `${plan.dataGb}GB data`;
  return `$${plan.monthlyPrice}/mo · ${data} · ${plan.hotspotGb}GB hotspot`;
};

export default function AddALine() {
  const { data, loading, error } = useFetch<CatalogData>(loadCatalog);
  const { cart, busy, addLine, checkout } = useCart();
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) return <p className="text-slate-500">Loading catalog…</p>;
  if (error || !data) return <p className="text-red-600">{error}</p>;

  const { devices, ratePlans, oems } = data;
  const oemName = new Map(oems.map((oem) => [oem.id, oem.name]));
  const deviceById = new Map(devices.map((device) => [device.id, device]));
  const planById = new Map(ratePlans.map((plan) => [plan.id, plan]));
  const planId = selectedPlanId ?? ratePlans[0]?.id ?? null;
  const lines = cart?.lines ?? [];

  const dueToday = lines.reduce(
    (sum, line) => sum + (deviceById.get(line.deviceId)?.retailPrice ?? 0),
    0
  );
  const monthly = lines.reduce(
    (sum, line) => sum + (planById.get(line.ratePlanId)?.monthlyPrice ?? 0),
    0
  );

  const handleAdd = async (deviceId: number) => {
    if (planId === null) return;
    setActionError(null);
    try {
      await addLine(deviceId, planId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not add line");
    }
  };

  const handleCheckout = async () => {
    setActionError(null);
    try {
      await checkout();
      navigate("/orders");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Checkout failed");
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-bold">Add a Line</h1>
      <p className="mt-1 text-slate-600">
        Select a device and rate plan, add to the service cart, then review and
        check out to create an activation order.
      </p>
      {actionError && <p className="mt-3 text-red-600">{actionError}</p>}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">1. Choose a device</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {devices.map((device) => {
                const added = lines.some((line) => line.deviceId === device.id);
                return (
                  <li
                    key={device.id}
                    data-testid="add-a-line-device"
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-carrier-50" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{device.model}</div>
                      <div className="text-sm text-slate-500">
                        {oemName.get(device.oemId) ?? "Unknown OEM"} · {device.category} ·
                        SKU {device.sku}
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      {currency.format(device.retailPrice)}
                    </div>
                    {added ? (
                      <button
                        type="button"
                        disabled
                        className="rounded-md bg-carrier-50 px-4 py-1.5 text-sm font-semibold text-carrier-700"
                      >
                        Added
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy || planId === null}
                        onClick={() => handleAdd(device.id)}
                        className="rounded-md bg-carrier-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-carrier-600 disabled:opacity-50"
                      >
                        Add
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">2. Choose a rate plan</h2>
            <div className="mt-4 space-y-3" role="radiogroup" aria-label="Rate plan">
              {ratePlans.map((plan) => {
                const selected = plan.id === planId;
                return (
                  <label
                    key={plan.id}
                    className={`block cursor-pointer rounded-lg border px-4 py-3 ${
                      selected
                        ? "border-carrier-500 bg-carrier-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rate-plan"
                      value={plan.id}
                      checked={selected}
                      onChange={() => setSelectedPlanId(plan.id)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-slate-900">{plan.name}</span>
                    <span className="text-slate-700"> — {planSummary(plan)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Service Cart</h2>
          {lines.length === 0 ? (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
              Your cart is empty.
            </p>
          ) : (
            <ul
              data-testid="cart-lines"
              className="mt-4 divide-y divide-slate-100 border-t border-slate-100 text-sm"
            >
              {lines.flatMap((line) => {
                const device = deviceById.get(line.deviceId);
                const plan = planById.get(line.ratePlanId);
                return [
                  <li key={`${line.id}-device`} className="flex justify-between py-2">
                    <span>{device?.model ?? `Device ${line.deviceId}`}</span>
                    <span>{currency.format(device?.retailPrice ?? 0)}</span>
                  </li>,
                  <li key={`${line.id}-plan`} className="flex justify-between py-2">
                    <span>{plan?.name ?? `Plan ${line.ratePlanId}`}</span>
                    <span>{currency.format(plan?.monthlyPrice ?? 0)}/mo</span>
                  </li>,
                ];
              })}
            </ul>
          )}

          <div className="mt-4 space-y-2 border-t-2 border-slate-100 pt-4">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Due today</span>
              <span data-testid="due-today">{currency.format(dueToday)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Monthly</span>
              <span data-testid="monthly">{currency.format(monthly)}/mo</span>
            </div>
          </div>

          <button
            type="button"
            disabled={busy || lines.length === 0}
            onClick={handleCheckout}
            className="mt-4 w-full rounded-lg bg-carrier-500 py-3 font-semibold text-white hover:bg-carrier-600 disabled:opacity-50"
          >
            Review &amp; check out
          </button>
        </aside>
      </div>
    </section>
  );
}
