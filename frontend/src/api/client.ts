const BASE = "/api";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
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
  deviceOems: () => getJson<import("./types").DeviceOem[]>("/device-oems"),
  createCart: (subscriberId: number) =>
    postJson<import("./types").CartView>("/carts", { subscriberId }),
  addCartLine: (cartId: number, deviceId: number, ratePlanId: number) =>
    postJson<import("./types").CartView>(`/carts/${cartId}/lines`, {
      deviceId,
      ratePlanId,
    }),
  checkoutCart: (cartId: number) =>
    postJson<import("./types").ActivationOrder>(`/carts/${cartId}/checkout`),
};
