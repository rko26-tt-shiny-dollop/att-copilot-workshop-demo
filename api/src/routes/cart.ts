import { Router, type Request, type Response } from "express";
import type { Store } from "../repositories/store.js";
import type { Cart, CartLine } from "../models/cart.js";
import { badRequest, notFound, sendError } from "../utils/errors.js";

interface CartView extends Cart {
  lines: CartLine[];
  lineCount: number;
}

/** Add-a-Line service cart: build device + rate plan lines, then check out. */
export function cartRouter(store: Store): Router {
  const router = Router();

  const getCart = (id: string): Cart => {
    const cart = store.carts.getById(Number(id));
    if (!cart) throw notFound("Cart", id);
    return cart;
  };

  const toView = (cart: Cart): CartView => {
    const lines = store.cartLines.find((line) => line.cartId === cart.id);
    return { ...cart, lines, lineCount: lines.length };
  };

  router.post("/", (req: Request, res: Response) => {
    try {
      const { subscriberId } = req.body ?? {};
      if (!store.subscribers.getById(Number(subscriberId))) {
        throw notFound("Subscriber", subscriberId);
      }
      const cart = store.carts.create({
        subscriberId: Number(subscriberId),
        status: "open",
        createdAt: new Date().toISOString(),
      });
      res.status(201).json(toView(cart));
    } catch (err) {
      sendError(res, err);
    }
  });

  router.get("/:id", (req: Request, res: Response) => {
    try {
      res.json(toView(getCart(req.params.id)));
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post("/:id/lines", (req: Request, res: Response) => {
    try {
      const cart = getCart(req.params.id);
      if (cart.status !== "open") throw badRequest("Cart is already checked out");

      const { deviceId, ratePlanId } = req.body ?? {};
      if (!store.devices.getById(Number(deviceId))) {
        throw notFound("Device", deviceId);
      }
      if (!store.ratePlans.getById(Number(ratePlanId))) {
        throw notFound("RatePlan", ratePlanId);
      }

      store.cartLines.create({
        cartId: cart.id,
        deviceId: Number(deviceId),
        ratePlanId: Number(ratePlanId),
      });
      res.status(201).json(toView(cart));
    } catch (err) {
      sendError(res, err);
    }
  });

  router.delete("/:id/lines/:lineId", (req: Request, res: Response) => {
    try {
      const cart = getCart(req.params.id);
      if (cart.status !== "open") throw badRequest("Cart is already checked out");

      const line = store.cartLines.getById(Number(req.params.lineId));
      if (!line || line.cartId !== cart.id) {
        throw notFound("CartLine", req.params.lineId);
      }
      store.cartLines.delete(line.id);
      res.json(toView(cart));
    } catch (err) {
      sendError(res, err);
    }
  });

  router.post("/:id/checkout", (req: Request, res: Response) => {
    try {
      const cart = getCart(req.params.id);
      if (cart.status !== "open") throw badRequest("Cart is already checked out");

      const lines = store.cartLines.find((line) => line.cartId === cart.id);
      if (lines.length === 0) throw badRequest("Cannot check out an empty cart");

      const subscriber = store.subscribers.getById(cart.subscriberId);
      if (!subscriber) throw notFound("Subscriber", cart.subscriberId);

      const created = store.activationOrders.create({
        orderNumber: "",
        subscriberId: subscriber.id,
        marketId: subscriber.marketId,
        status: "submitted",
        createdAt: new Date().toISOString(),
      });
      // Matches the seed numbering scheme (id 1 → AO-5001).
      const order = store.activationOrders.update(created.id, {
        orderNumber: `AO-${5000 + created.id}`,
      });

      for (const line of lines) {
        store.activationOrderLines.create({
          orderId: created.id,
          deviceId: line.deviceId,
          simId: 0,
          ratePlanId: line.ratePlanId,
          imei: "",
          phoneNumber: "",
          quantity: 1,
        });
      }
      store.carts.update(cart.id, { status: "checked_out" });

      res.status(201).json(order);
    } catch (err) {
      sendError(res, err);
    }
  });

  return router;
}
