export type SimType = "physical" | "esim";
export type SimStatus = "available" | "assigned" | "active" | "suspended";

/**
 * A SIM/eSIM identified by its ICCID. Inventory item assigned during activation.
 */
export interface Sim {
  id: number;
  iccid: string;
  type: SimType;
  status: SimStatus;
}
