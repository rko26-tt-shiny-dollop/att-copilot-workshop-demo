export type CartStatus = "open" | "checked_out";

/** A subscriber's Add-a-Line service cart, checked out into an ActivationOrder. */
export interface Cart {
  id: number;
  subscriberId: number;
  status: CartStatus;
  createdAt: string;
}

/** A device + rate plan pending activation in a cart. */
export interface CartLine {
  id: number;
  cartId: number;
  deviceId: number;
  ratePlanId: number;
}
