"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product, ProductImageSet } from "@/types/product";

export type CartItem = {
  product: Product;
  selected: ProductImageSet;
  size: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity: number }) => void;
  setItemQuantity: (
    key: { slug: string; imageSetId: string; size: string },
    quantity: number
  ) => void;
  removeFromCart: (key: {
    slug: string;
    imageSetId: string;
    size: string;
  }) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;

  // 👇 thêm discount
  discountCode: string | null;
  discountAmount: number;
  applyDiscount: (code: string, amount: number) => void;
  clearDiscount: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function makeKey(slug: string, imageSetId: string, size: string) {
  return `${slug}__${imageSetId}__${size}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 👇 state cho discount
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart: CartContextType["addToCart"] = (item) => {
    setCart((prev) => {
      const key = makeKey(item.product.slug, item.selected.id, item.size);
      const idx = prev.findIndex(
        (i) => makeKey(i.product.slug, i.selected.id, i.size) === key
      );

      const maxInv =
        item.selected.sizes.find((s) => s.size === item.size)?.inventory ??
        Number.POSITIVE_INFINITY;

      if (idx >= 0) {
        const updated = [...prev];
        const nextQty = Math.min(updated[idx].quantity + item.quantity, maxInv);
        updated[idx] = { ...updated[idx], quantity: nextQty };
        return updated;
      } else {
        const clampedQty = Math.max(1, Math.min(item.quantity, maxInv));
        return [...prev, { ...item, quantity: clampedQty }];
      }
    });
  };

  const setItemQuantity: CartContextType["setItemQuantity"] = (key, quantity) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) =>
          makeKey(i.product.slug, i.selected.id, i.size) ===
          makeKey(key.slug, key.imageSetId, key.size)
      );
      if (idx < 0) return prev;

      const item = prev[idx];
      const maxInv =
        item.selected.sizes.find((s) => s.size === item.size)?.inventory ??
        Number.POSITIVE_INFINITY;

      const nextQty = Math.max(0, Math.min(quantity, maxInv));
      const updated = [...prev];

      if (nextQty === 0) {
        updated.splice(idx, 1);
      } else {
        updated[idx] = { ...item, quantity: nextQty };
      }
      return updated;
    });
  };

  const removeFromCart: CartContextType["removeFromCart"] = (key) => {
    setCart((prev) =>
      prev.filter(
        (i) =>
          makeKey(i.product.slug, i.selected.id, i.size) !==
          makeKey(key.slug, key.imageSetId, key.size)
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalQuantity = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [cart]
  );

  // 👇 hàm apply & clear discount
  const applyDiscount = (code: string, amount: number) => {
    setDiscountCode(code);
    setDiscountAmount(amount);
  };

  const clearDiscount = () => {
    setDiscountCode(null);
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        setItemQuantity,
        removeFromCart,
        clearCart,
        totalQuantity,
        subtotal,
        discountCode,
        discountAmount,
        applyDiscount,
        clearDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
