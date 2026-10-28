import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { ActivationOrder, CartView } from "../api/types";

const SUBSCRIBER_ID = 1;

interface CartContextValue {
  cart: CartView | null;
  busy: boolean;
  addLine: (deviceId: number, ratePlanId: number) => Promise<void>;
  checkout: () => Promise<ActivationOrder>;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Session-only Add-a-Line cart; there is no persistence across reloads. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [busy, setBusy] = useState(false);
  // Shared so concurrent first Adds reuse one cart instead of creating two.
  const cartPromise = useRef<Promise<CartView> | null>(null);

  const ensureCart = (): Promise<CartView> => {
    if (!cartPromise.current) {
      cartPromise.current = api.createCart(SUBSCRIBER_ID).catch((err: unknown) => {
        cartPromise.current = null;
        throw err;
      });
    }
    return cartPromise.current;
  };

  const addLine = async (deviceId: number, ratePlanId: number) => {
    setBusy(true);
    try {
      const current = await ensureCart();
      setCart(await api.addCartLine(current.id, deviceId, ratePlanId));
    } finally {
      setBusy(false);
    }
  };

  const checkout = async () => {
    if (!cart) throw new Error("Cart is empty");
    setBusy(true);
    try {
      const order = await api.checkoutCart(cart.id);
      cartPromise.current = null;
      setCart(null);
      return order;
    } finally {
      setBusy(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, busy, addLine, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
