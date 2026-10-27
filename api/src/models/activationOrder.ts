export type ActivationOrderStatus =
  | "draft"
  | "submitted"
  | "provisioning"
  | "completed"
  | "cancelled";

/**
 * A customer order to activate one or more wireless lines.
 * Wireless analog of a supply-chain "order".
 */
export interface ActivationOrder {
  id: number;
  orderNumber: string;
  subscriberId: number;
  marketId: number;
  status: ActivationOrderStatus;
  createdAt: string;
}
