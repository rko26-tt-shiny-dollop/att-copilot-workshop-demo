const BASE = "/api";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  devices: () => getJson<import("./types").Device[]>("/devices"),
  ratePlans: () => getJson<import("./types").RatePlan[]>("/rate-plans"),
  subscribers: () => getJson<import("./types").Subscriber[]>("/subscribers"),
  activationOrders: () =>
    getJson<import("./types").ActivationOrder[]>("/activation-orders"),
  provisionings: () =>
    getJson<import("./types").Provisioning[]>("/provisionings"),
};
