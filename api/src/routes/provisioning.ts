import { Router, type Request, type Response } from "express";
import type { Store } from "../repositories/store.js";
import type { ProvisioningStatus } from "../models/provisioning.js";
import { crudRouter } from "./crud.js";
import { badRequest, sendError } from "../utils/errors.js";

const VALID_STATUSES: ProvisioningStatus[] = [
  "pending",
  "in_progress",
  "activated",
  "failed",
];

/**
 * Provisioning router. Extends the standard CRUD router with an optional
 * `?status=` filter on the list endpoint so NetOps can triage lines by state
 * (e.g. everything still `pending` or `failed`).
 */
export function provisioningRouter(store: Store): Router {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    try {
      const all = store.provisionings.getAll();
      const status = req.query.status;
      if (status === undefined) {
        res.json(all);
        return;
      }
      if (typeof status !== "string" || !VALID_STATUSES.includes(status as ProvisioningStatus)) {
        throw badRequest(
          `Invalid status '${String(status)}'. Expected one of: ${VALID_STATUSES.join(", ")}.`
        );
      }
      res.json(all.filter((p) => p.status === status));
    } catch (err) {
      sendError(res, err);
    }
  });

  router.use("/", crudRouter(store.provisionings, "Provisioning"));

  return router;
}
