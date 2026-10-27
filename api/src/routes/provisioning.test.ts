import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("provisionings API — status filter", () => {
  it("lists all provisionings without a filter", async () => {
    const res = await request(createApp()).get("/api/provisionings");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("filters provisionings by status", async () => {
    const res = await request(createApp()).get("/api/provisionings?status=activated");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((p: { status: string }) => p.status === "activated")).toBe(true);
  });

  it("rejects an invalid status with 400", async () => {
    const res = await request(createApp()).get("/api/provisionings?status=bogus");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid status");
  });

  it("still serves GET /:id", async () => {
    const res = await request(createApp()).get("/api/provisionings/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });
});
