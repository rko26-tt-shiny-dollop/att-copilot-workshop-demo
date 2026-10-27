/**
 * A customer account holder.
 * Wireless analog of a supply-chain "headquarters"/customer.
 */
export interface Subscriber {
  id: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  marketId: number;
}
