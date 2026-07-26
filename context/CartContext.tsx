"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCartItems,
} from "@/lib/actions/cart";
import type { CartItemData } from "@/lib/actions/cart";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const result = await fetchCart();
      if ("items" in result) setItems(result.items);
      setLoading(false);
    };
    init();
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty: number = 1) => {
      addToCart(item.id, qty).then((result) => {
        if ("items" in result) setItems(result.items);
      });
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    removeFromCart(id).then((result) => {
      if ("items" in result) setItems(result.items);
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    updateCartItem(id, qty).then((result) => {
      if ("items" in result) setItems(result.items);
    });
  }, []);

  const clearCart = useCallback(() => {
    clearCartItems().then(() => setItems([]));
  }, []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
