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
      get: { summary: "List provisioning records", responses: { "200": { description: "Provisioning list" } } },
    },
    "/api/carts": {
      post: {
        summary: "Create an Add-a-Line cart for a subscriber",
        responses: { "201": { description: "Created" }, "404": { description: "Subscriber not found" } },
      },
    },
    "/api/carts/{id}": {
      get: { summary: "Get a cart with its lines and line count", responses: { "200": { description: "Cart" }, "404": { description: "Not found" } } },
    },
    "/api/carts/{id}/lines": {
      post: {
        summary: "Add a device + rate plan line to a cart",
        responses: { "201": { description: "Updated cart" }, "400": { description: "Cart not open" }, "404": { description: "Not found" } },
      },
    },
    "/api/carts/{id}/lines/{lineId}": {
      delete: {
        summary: "Remove a line from a cart",
        responses: { "200": { description: "Updated cart" }, "400": { description: "Cart not open" }, "404": { description: "Not found" } },
      },
    },
    "/api/carts/{id}/checkout": {
      post: {
        summary: "Check out a cart into an activation order",
        responses: { "201": { description: "Activation order created" }, "400": { description: "Empty or closed cart" }, "404": { description: "Not found" } },
      },
    },
  },
};
