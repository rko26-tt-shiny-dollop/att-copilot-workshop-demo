/**
 * A geographic market/region a wireless carrier operates in.
 * Wireless analog of a supply-chain "branch".
 */
export interface Market {
  id: number;
  code: string;
  name: string;
  region: string;
}
