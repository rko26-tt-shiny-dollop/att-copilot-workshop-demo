export type ProvisioningStatus =
  | "pending"
  | "in_progress"
  | "activated"
  | "failed";

/**
 * The network provisioning/activation record for an order line.
 * Wireless analog of a supply-chain "delivery".
 */
export interface Provisioning {
  id: number;
  orderLineId: number;
  status: ProvisioningStatus;
  activatedAt: string | null;
  notes: string;
}
