/**
 * A handset/device model in the carrier catalog.
 * Wireless analog of a supply-chain "product".
 */
export interface Device {
  id: number;
  oemId: number;
  sku: string;
  model: string;
  category: "smartphone" | "tablet" | "wearable" | "hotspot";
  retailPrice: number;
  imageUrl?: string;
}
