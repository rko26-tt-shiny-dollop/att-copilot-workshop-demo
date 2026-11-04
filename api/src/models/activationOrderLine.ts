/**
 * A single line on an activation order: a device + SIM + rate plan to activate.
 * Wireless analog of a supply-chain "order detail".
 */
export interface ActivationOrderLine {
  id: number;
  orderId: number;
  deviceId: number;
  simId: number;
  ratePlanId: number;
  imei: string;
  phoneNumber: string;
  quantity: number;
}
