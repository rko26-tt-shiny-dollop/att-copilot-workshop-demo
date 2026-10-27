import type { Market } from "./models/market.js";
import type { DeviceOem } from "./models/deviceOem.js";
import type { Device } from "./models/device.js";
import type { Sim } from "./models/sim.js";
import type { RatePlan } from "./models/ratePlan.js";
import type { Subscriber } from "./models/subscriber.js";
import type { ActivationOrder } from "./models/activationOrder.js";
import type { ActivationOrderLine } from "./models/activationOrderLine.js";
import type { Provisioning } from "./models/provisioning.js";

export interface SeedData {
  markets: Market[];
  deviceOems: DeviceOem[];
  devices: Device[];
  sims: Sim[];
  ratePlans: RatePlan[];
  subscribers: Subscriber[];
  activationOrders: ActivationOrder[];
  activationOrderLines: ActivationOrderLine[];
  provisionings: Provisioning[];
}

/**
 * Deterministic in-memory seed data for the wireless activation demo.
 * IMEI/ICCID values below are synthetic but pass Luhn validation.
 */
export function buildSeedData(): SeedData {
  const markets: Market[] = [
    { id: 1, code: "ATL", name: "Atlanta Metro", region: "Southeast" },
    { id: 2, code: "DFW", name: "Dallas–Fort Worth", region: "South Central" },
    { id: 3, code: "LAX", name: "Los Angeles", region: "West" },
    { id: 4, code: "NYC", name: "New York Metro", region: "Northeast" },
  ];

  const deviceOems: DeviceOem[] = [
    { id: 1, name: "Apple", country: "USA" },
    { id: 2, name: "Samsung", country: "South Korea" },
    { id: 3, name: "Google", country: "USA" },
  ];

  const devices: Device[] = [
    { id: 1, oemId: 1, sku: "APL-IP15-128", model: "iPhone 15 128GB", category: "smartphone", retailPrice: 799, imageUrl: "/devices/iphone15.png" },
    { id: 2, oemId: 1, sku: "APL-IP15P-256", model: "iPhone 15 Pro 256GB", category: "smartphone", retailPrice: 1099, imageUrl: "/devices/iphone15pro.png" },
    { id: 3, oemId: 2, sku: "SAM-S24-128", model: "Galaxy S24 128GB", category: "smartphone", retailPrice: 799, imageUrl: "/devices/galaxys24.png" },
    { id: 4, oemId: 2, sku: "SAM-A15-128", model: "Galaxy A15 128GB", category: "smartphone", retailPrice: 199, imageUrl: "/devices/galaxya15.png" },
    { id: 5, oemId: 3, sku: "GOO-PX8-128", model: "Pixel 8 128GB", category: "smartphone", retailPrice: 699, imageUrl: "/devices/pixel8.png" },
    { id: 6, oemId: 2, sku: "SAM-WATCH6", model: "Galaxy Watch 6", category: "wearable", retailPrice: 299, imageUrl: "/devices/watch6.png" },
    { id: 7, oemId: 3, sku: "GOO-HOTSPOT", model: "Nighthawk M6 Hotspot", category: "hotspot", retailPrice: 399, imageUrl: "/devices/hotspot.png" },
  ];

  const sims: Sim[] = [
    { id: 1, iccid: "89014103211111111112", type: "physical", status: "assigned" },
    { id: 2, iccid: "89012609876543210121", type: "esim", status: "active" },
    { id: 3, iccid: "89014103222233344457", type: "physical", status: "available" },
    { id: 4, iccid: "89014405555666677884", type: "esim", status: "available" },
  ];

  const ratePlans: RatePlan[] = [
    { id: 1, code: "UNL-PREM", name: "Unlimited Premium", monthlyPrice: 85, dataGb: "unlimited", hotspotGb: 60, features: ["5G+", "60GB hotspot", "HD streaming", "International day pass"] },
    { id: 2, code: "UNL-EXTRA", name: "Unlimited Extra", monthlyPrice: 75, dataGb: "unlimited", hotspotGb: 30, features: ["5G", "30GB hotspot", "HD streaming"] },
    { id: 3, code: "UNL-START", name: "Unlimited Starter", monthlyPrice: 65, dataGb: "unlimited", hotspotGb: 5, features: ["5G", "5GB hotspot", "SD streaming"] },
    { id: 4, code: "DATA-15", name: "15GB Shareable", monthlyPrice: 50, dataGb: 15, hotspotGb: 15, features: ["5G", "Shareable data"] },
  ];

  const subscribers: Subscriber[] = [
    { id: 1, accountNumber: "AC-100001", firstName: "Jordan", lastName: "Rivera", email: "jordan.rivera@example.com", marketId: 1 },
    { id: 2, accountNumber: "AC-100002", firstName: "Priya", lastName: "Nair", email: "priya.nair@example.com", marketId: 2 },
    { id: 3, accountNumber: "AC-100003", firstName: "Marcus", lastName: "Lee", email: "marcus.lee@example.com", marketId: 3 },
  ];

  const activationOrders: ActivationOrder[] = [
    { id: 1, orderNumber: "AO-5001", subscriberId: 1, marketId: 1, status: "completed", createdAt: "2026-01-12T15:04:00.000Z" },
    { id: 2, orderNumber: "AO-5002", subscriberId: 2, marketId: 2, status: "provisioning", createdAt: "2026-02-03T18:22:00.000Z" },
    { id: 3, orderNumber: "AO-5003", subscriberId: 3, marketId: 3, status: "submitted", createdAt: "2026-02-20T13:45:00.000Z" },
  ];

  const activationOrderLines: ActivationOrderLine[] = [
    { id: 1, orderId: 1, deviceId: 1, simId: 1, ratePlanId: 1, imei: "353280110876548", phoneNumber: "404-555-0101", quantity: 1 },
    { id: 2, orderId: 2, deviceId: 3, simId: 2, ratePlanId: 2, imei: "356721055667787", phoneNumber: "214-555-0144", quantity: 1 },
    { id: 3, orderId: 3, deviceId: 5, simId: 3, ratePlanId: 3, imei: "354418099001121", phoneNumber: "310-555-0190", quantity: 1 },
  ];

  const provisionings: Provisioning[] = [
    { id: 1, orderLineId: 1, status: "activated", activatedAt: "2026-01-12T15:20:00.000Z", notes: "Line active on network." },
    { id: 2, orderLineId: 2, status: "in_progress", activatedAt: null, notes: "eSIM profile pushed; awaiting device check-in." },
    { id: 3, orderLineId: 3, status: "pending", activatedAt: null, notes: "Queued for provisioning." },
  ];

  return {
    markets,
    deviceOems,
    devices,
    sims,
    ratePlans,
    subscribers,
    activationOrders,
    activationOrderLines,
    provisionings,
  };
}
