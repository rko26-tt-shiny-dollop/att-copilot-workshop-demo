import { Router, type Request, type Response } from "express";
import type { Store } from "../repositories/store.js";
import { badRequest, notFound, sendError } from "../utils/errors.js";
import { isValidImei, isValidIccid } from "../utils/identifiers.js";

/**
 * Activation-order routes with domain validation.
 *
 * In addition to standard CRUD on orders, this exposes the order's lines and
 * validates device/SIM identifiers (IMEI/ICCID) before an activation line is
 * accepted — the core safety check in the wireless activation workflow.
 */
export function activationRouter(store: Store): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    res.json(store.activationOrders.getAll());
  });

  router.get("/:id", (req: Request, res: Response) => {
    try {
      const order = store.activationOrders.getById(Number(req.params.id));
      if (!order) throw notFound("ActivationOrder", req.params.id);
      const lines = store.activationOrderLines.find(
        (line) => line.orderId === order.id
      );
      res.json({ ...order, lines });
    } catch (err) {
      sendError(res, err);
    }
  });

  router.get("/:id/lines", (req: Request, res: Response) => {
    try {
      const order = store.activationOrders.getById(Number(req.params.id));
      if (!order) throw notFound("ActivationOrder", req.params.id);
      res.json(
        store.activationOrderLines.find((line) => line.orderId === order.id)
      );
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post("/:id/lines", (req: Request, res: Response) => {
    try {
      const order = store.activationOrders.getById(Number(req.params.id));
      if (!order) throw notFound("ActivationOrder", req.params.id);

      const { deviceId, simId, ratePlanId, imei, phoneNumber, quantity } =
        req.body ?? {};

      if (imei !== undefined && !isValidImei(String(imei))) {
        throw badRequest("Invalid IMEI: must be 15 digits and pass Luhn check");
      }

      const sim =
        simId !== undefined ? store.sims.getById(Number(simId)) : undefined;
      if (simId !== undefined && !sim) {
        throw notFound("Sim", simId);
      }
      if (sim && !isValidIccid(sim.iccid)) {
        throw badRequest("Assigned SIM has an invalid ICCID");
      }

      const line = store.activationOrderLines.create({
        orderId: order.id,
        deviceId: Number(deviceId),
        simId: Number(simId),
        ratePlanId: Number(ratePlanId),
        imei: String(imei ?? ""),
        phoneNumber: String(phoneNumber ?? ""),
        quantity: Number(quantity ?? 1),
      });

      res.status(201).json(line);
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
}
