import { api } from "../api/client";
import { useFetch } from "../api/useFetch";
import type { RatePlan } from "../api/types";

export default function Plans() {
  const { data, loading, error } = useFetch<RatePlan[]>(api.ratePlans);

  if (loading) return <p className="text-slate-500">Loading rate plans…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Rate Plans</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.map((plan) => (
          <div key={plan.id} className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">{plan.name}</h2>
            <div className="mt-1 text-2xl font-bold text-carrier-700">
              ${plan.monthlyPrice}
              <span className="text-sm font-normal text-slate-500">/mo</span>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Data: {plan.dataGb === "unlimited" ? "Unlimited" : `${plan.dataGb} GB`}
            </div>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
