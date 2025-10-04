"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Routes } from "@/lib/routes";
import CartItems from "@/components/cart/CartItems";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  const { cart, setItemQuantity, removeFromCart, clearCart, subtotal, totalQuantity } =
    useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-full px-20 lg:px-30 py-6 bg-gray-100 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <Link
          href={Routes.home()}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-full px-20 lg:px-30 py-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">
        <span>Shopping Cart</span>
        <span className="ml-4 text-gray-500 text-base font-bold">
          {totalQuantity} {totalQuantity === 1 ? "ITEM" : "ITEMS"} IN CART
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 overflow-y-auto pr-2">
          <CartItems
            cart={cart}
            setItemQuantity={setItemQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky" style={{ top: "var(--header-h)" }}>
            <CartSummary subtotal={subtotal} totalQuantity={totalQuantity} />
          </div>
        </div>
      </div>
    </div>
  );
}
