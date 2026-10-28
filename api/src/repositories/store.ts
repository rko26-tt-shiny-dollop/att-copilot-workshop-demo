import { InMemoryRepository } from "./InMemoryRepository.js";
import { buildSeedData } from "../seedData.js";
import type { Market } from "../models/market.js";
import type { DeviceOem } from "../models/deviceOem.js";
import type { Device } from "../models/device.js";
import type { Sim } from "../models/sim.js";
import type { RatePlan } from "../models/ratePlan.js";
import type { Subscriber } from "../models/subscriber.js";
import type { ActivationOrder } from "../models/activationOrder.js";
import type { ActivationOrderLine } from "../models/activationOrderLine.js";
import type { Provisioning } from "../models/provisioning.js";
import type { Cart, CartLine } from "../models/cart.js";

export interface Store {
  markets: InMemoryRepository<Market>;
  deviceOems: InMemoryRepository<DeviceOem>;
  devices: InMemoryRepository<Device>;
  sims: InMemoryRepository<Sim>;
  ratePlans: InMemoryRepository<RatePlan>;
  subscribers: InMemoryRepository<Subscriber>;
  activationOrders: InMemoryRepository<ActivationOrder>;
  activationOrderLines: InMemoryRepository<ActivationOrderLine>;
  provisionings: InMemoryRepository<Provisioning>;
  carts: InMemoryRepository<Cart>;
  cartLines: InMemoryRepository<CartLine>;
}

/** Build a fresh store from seed data (used by the app and by tests). */
export function createStore(): Store {
  const seed = buildSeedData();
  return {
    markets: new InMemoryRepository(seed.markets),
    deviceOems: new InMemoryRepository(seed.deviceOems),
    devices: new InMemoryRepository(seed.devices),
    sims: new InMemoryRepository(seed.sims),
    ratePlans: new InMemoryRepository(seed.ratePlans),
    subscribers: new InMemoryRepository(seed.subscribers),
    activationOrders: new InMemoryRepository(seed.activationOrders),
    activationOrderLines: new InMemoryRepository(seed.activationOrderLines),
    provisionings: new InMemoryRepository(seed.provisionings),
    carts: new InMemoryRepository<Cart>([]),
    cartLines: new InMemoryRepository<CartLine>([]),
  };
}
