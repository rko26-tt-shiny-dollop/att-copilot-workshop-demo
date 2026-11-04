/**
 * A wireless rate plan the subscriber activates a line on.
 */
export interface RatePlan {
  id: number;
  code: string;
  name: string;
  monthlyPrice: number;
  dataGb: number | "unlimited";
  hotspotGb: number;
  features: string[];
}
