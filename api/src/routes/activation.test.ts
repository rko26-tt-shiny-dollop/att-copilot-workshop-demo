import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { createStore } from "../repositories/store.js";

describe("activation-orders API", () => {
  it("lists activation orders", async () => {
    const res = await request(createApp()).get("/api/activation-orders");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("returns an order with its lines", async () => {
    const res = await request(createApp()).get("/api/activation-orders/1");
    expect(res.status).toBe(200);
    expect(res.body.orderNumber).toBe("AO-5001");
    expect(Array.isArray(res.body.lines)).toBe(true);
  });

  it("404s for an unknown order", async () => {
    const res = await request(createApp()).get("/api/activation-orders/9999");
    expect(res.status).toBe(404);
  });

  it("rejects an activation line with an invalid IMEI", async () => {
    const app = createApp(createStore());
    const res = await request(app)
      .post("/api/activation-orders/3/lines")
      .send({ deviceId: 1, simId: 3, ratePlanId: 1, imei: "353280110876540" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/IMEI/);
  });

  it("accepts an activation line with a valid IMEI", async () => {
    const app = createApp(createStore());
    const res = await request(app)
      .post("/api/activation-orders/3/lines")
      .send({
        deviceId: 1,
        simId: 3,
        ratePlanId: 1,
        imei: "356721055667787",
        phoneNumber: "404-555-0188",
        quantity: 1,
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeGreaterThan(0);
  });
});
