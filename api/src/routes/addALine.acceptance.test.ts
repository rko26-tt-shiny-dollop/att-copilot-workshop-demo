/**
 * Add-a-Line / Service Cart — acceptance specification
 * ----------------------------------------------------
 * These acceptance tests define the service-cart ("Add-a-Line") feature that is
 * not yet implemented: a subscriber assembles a cart of device + rate-plan lines
 * and checks out to create an activation order. The suite is skipped until the
 * cart API exists.
 *
 * Acceptance criteria encoded below:
 *  - A cart can be created for a subscriber.
 *  - Devices + rate plans can be added as cart lines.
 *  - The cart reports a line count (drives the nav-bar badge).
 *  - Checking out a cart creates an ActivationOrder with matching lines.
 *
 * Target UI: docs/design/add-a-line.png
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe.skip("Add-a-Line service cart (acceptance-test-first starter)", () => {
  it("creates an empty cart for a subscriber", async () => {
    const res = await request(createApp())
      .post("/api/carts")
      .send({ subscriberId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeGreaterThan(0);
    expect(res.body.lineCount).toBe(0);
  });

  it("adds a device + rate plan line and updates the count", async () => {
    const app = createApp();
    const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
    const res = await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 1, ratePlanId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.lineCount).toBe(1);
  });

  it("checks out a cart into an activation order", async () => {
    const app = createApp();
    const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
    await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 1, ratePlanId: 1 });
    const res = await request(app).post(`/api/carts/${cart.body.id}/checkout`);
    expect(res.status).toBe(201);
    expect(res.body.orderNumber).toMatch(/^AO-/);
  });
});
