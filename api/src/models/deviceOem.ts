/**
 * A device manufacturer (OEM) that supplies handsets to the carrier.
 * Wireless analog of a supply-chain "supplier".
 */
export interface DeviceOem {
  id: number;
  name: string;
  country: string;
}
