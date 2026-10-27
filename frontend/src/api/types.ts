export interface Device {
  id: number;
  oemId: number;
  sku: string;
  model: string;
  category: "smartphone" | "tablet" | "wearable" | "hotspot";
  retailPrice: number;
  imageUrl?: string;
}

export interface RatePlan {
  id: number;
  code: string;
  name: string;
  monthlyPrice: number;
  dataGb: number | "unlimited";
  hotspotGb: number;
  features: string[];
}

export interface Subscriber {
  id: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  marketId: number;
}

export interface ActivationOrder {
  id: number;
  orderNumber: string;
  subscriberId: number;
  marketId: number;
  status: string;
  createdAt: string;
}

export interface Provisioning {
  id: number;
  orderLineId: number;
  status: string;
  activatedAt: string | null;
  notes: string;
}
