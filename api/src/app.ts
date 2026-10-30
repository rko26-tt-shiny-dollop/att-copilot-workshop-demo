import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createStore, type Store } from "./repositories/store.js";
import { crudRouter } from "./routes/crud.js";
import { activationRouter } from "./routes/activation.js";
import { provisioningRouter } from "./routes/provisioning.js";
import { swaggerDocument } from "./swagger.js";

/** Build the Express app. A store can be injected for tests. */
export function createApp(store: Store = createStore()): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "wireless-activation-api" });
  });

  app.use("/api/markets", crudRouter(store.markets, "Market"));
  app.use("/api/device-oems", crudRouter(store.deviceOems, "DeviceOem"));
  app.use("/api/devices", crudRouter(store.devices, "Device"));
  app.use("/api/sims", crudRouter(store.sims, "Sim"));
  app.use("/api/rate-plans", crudRouter(store.ratePlans, "RatePlan"));
  app.use("/api/subscribers", crudRouter(store.subscribers, "Subscriber"));
  app.use("/api/activation-orders", activationRouter(store));
  app.use("/api/provisionings", provisioningRouter(store));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  return app;
}
