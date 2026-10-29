/**
 * Add-a-Line / Service Cart — acceptance specification
 * ----------------------------------------------------
 * These acceptance tests define the service-cart ("Add-a-Line") feature: a
 * subscriber assembles a cart of device + rate-plan lines and checks out to
 * create an activation order.
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

describe("Add-a-Line service cart (acceptance-test-first starter)", () => {
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

  it("creates order lines matching the cart lines on checkout", async () => {
    const app = createApp();
    const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
    await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 1, ratePlanId: 1 });
    await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 2, ratePlanId: 2 });
    const order = await request(app).post(`/api/carts/${cart.body.id}/checkout`);
    const lines = await request(app).get(
      `/api/activation-orders/${order.body.id}/lines`
    );
    expect(order.body.subscriberId).toBe(1);
    expect(lines.body).toHaveLength(2);
    expect(lines.body[1]).toMatchObject({ deviceId: 2, ratePlanId: 2 });
  });

  it("rejects a cart for an unknown subscriber", async () => {
    const res = await request(createApp())
      .post("/api/carts")
      .send({ subscriberId: 9999 });
    expect(res.status).toBe(404);
  });

  it("rejects a line with an unknown device", async () => {
    const app = createApp();
    const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
    const res = await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 9999, ratePlanId: 1 });
    expect(res.status).toBe(404);
  });

  it("rejects a line for an unknown cart", async () => {
    const res = await request(createApp())
      .post("/api/carts/9999/lines")
      .send({ deviceId: 1, ratePlanId: 1 });
    expect(res.status).toBe(404);
  });

  it("rejects checkout of an empty cart", async () => {
    const app = createApp();
    const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
    const res = await request(app).post(`/api/carts/${cart.body.id}/checkout`);
    expect(res.status).toBe(400);
  });

  it("remove a cart line decrements lineCount", async () => {
    const app = createApp();
    const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
    await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 1, ratePlanId: 1 });
    const added = await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 2, ratePlanId: 2 });
    const lineId = added.body.lines[1].id;
    const res = await request(app).delete(
      `/api/carts/${cart.body.id}/lines/${lineId}`
    );
    expect(res.status).toBe(200);
    expect(res.body.lineCount).toBe(1);
    expect(res.body.lines.map((l: { id: number }) => l.id)).not.toContain(lineId);
  });

  it("rejects removing a line that is not in the cart", async () => {
    const app = createApp();
    const cartA = await request(app).post("/api/carts").send({ subscriberId: 1 });
    const cartB = await request(app).post("/api/carts").send({ subscriberId: 1 });
    const added = await request(app)
      .post(`/api/carts/${cartA.body.id}/lines`)
      .send({ deviceId: 1, ratePlanId: 1 });
    const lineId = added.body.lines[0].id;
    const res = await request(app).delete(
      `/api/carts/${cartB.body.id}/lines/${lineId}`
    );
    expect(res.status).toBe(404);
    const unknown = await request(app).delete(
      `/api/carts/${cartA.body.id}/lines/9999`
    );
    expect(unknown.status).toBe(404);
  });

  it("rejects removing a line from a checked-out cart", async () => {
    const app = createApp();
    const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
    const added = await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 1, ratePlanId: 1 });
    await request(app).post(`/api/carts/${cart.body.id}/checkout`);
    const res = await request(app).delete(
      `/api/carts/${cart.body.id}/lines/${added.body.lines[0].id}`
    );
    expect(res.status).toBe(400);
  });

  it("removes a line from a cart and decrements the count", async () => {
    const app = createApp();
    const cart = await request(app).post("/api/carts").send({ subscriberId: 1 });
    const line = await request(app)
      .post(`/api/carts/${cart.body.id}/lines`)
      .send({ deviceId: 1, ratePlanId: 1 });
    const res = await request(app).delete(
      `/api/carts/${cart.body.id}/lines/${line.body.lineId}`
      );
    expect(res.status).toBe(200);
    expect(res.body.lineCount).toBe(0);
  });
});
