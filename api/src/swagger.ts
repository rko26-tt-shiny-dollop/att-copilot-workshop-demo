/** Minimal OpenAPI document served at /api-docs. */
export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Wireless Activation & Provisioning API",
    version: "1.0.0",
    description:
      "Wireless activation & provisioning API: device catalog, SIMs, rate plans, subscribers, activation orders, and provisioning.",
  },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/api/health": {
      get: { summary: "Health check", responses: { "200": { description: "OK" } } },
    },
    "/api/devices": {
      get: { summary: "List devices", responses: { "200": { description: "Device list" } } },
      post: { summary: "Create device", responses: { "201": { description: "Created" } } },
    },
    "/api/rate-plans": {
      get: { summary: "List rate plans", responses: { "200": { description: "Rate plan list" } } },
    },
    "/api/sims": {
      get: { summary: "List SIMs", responses: { "200": { description: "SIM list" } } },
    },
    "/api/subscribers": {
      get: { summary: "List subscribers", responses: { "200": { description: "Subscriber list" } } },
    },
    "/api/activation-orders": {
      get: { summary: "List activation orders", responses: { "200": { description: "Order list" } } },
    },
    "/api/activation-orders/{id}/lines": {
      get: { summary: "List lines for an order", responses: { "200": { description: "Line list" } } },
      post: {
        summary: "Add an activation line (validates IMEI/ICCID)",
        responses: { "201": { description: "Created" }, "400": { description: "Invalid identifier" } },
      },
    },
    "/api/provisionings": {
      get: {
        summary: "List provisioning records",
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            description: "Filter by provisioning status (pending, in_progress, activated, failed).",
            schema: { type: "string", enum: ["pending", "in_progress", "activated", "failed"] },
          },
        ],
        responses: {
          "200": { description: "Provisioning list" },
          "400": { description: "Invalid status filter" },
        },
      },
    },
  },
};
