"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Routes } from "@/lib/routes";
import { useEffect, useRef, useState } from "react";
import CartSummary from "../../components/cart/CartSummary";
import CartItems from "../../components/cart/CartItems";
// import RecommendedProducts from "@/components/RecommendedProducts";

export default function CartPage() {
  const {
    cart,
    cartLoading,
    setItemQuantity,
    removeFromCart,
    clearCart,
    totalQuantity,
    clearDiscount,
  } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const selectedCart = cart.filter((item) => {
    const key = item.cartItemId || `${item.product.slug}__${item.selectedVariant.id}`;
    return selectedItems.has(key);
  });

  const selectedSubtotal = selectedCart.reduce((sum, item) => {
    const price = Number(item.selectedVariant.finalPrice) || 0;
    return sum + price * item.quantity;
  }, 0);

  const selectedQuantity = selectedCart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleSetItemQuantity = async (cartItemId: string, quantity: number) => {
    clearDiscount();
    await setItemQuantity(cartItemId, quantity);
  };

  const handleRemoveFromCart = async (cartItemId: string) => {
    const newSelected = new Set(selectedItems);
    newSelected.delete(cartItemId);
    setSelectedItems(newSelected);

    clearDiscount();

    setRemovingItems((prev) => new Set(prev).add(cartItemId));
    setTimeout(async () => {
      await removeFromCart(cartItemId);
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }, 300);
  };

  const handleClearCart = async () => {
    setSelectedItems(new Set());
    clearDiscount();
    const allKeys = cart.map(
      (item) => `${item.product.slug}__${item.selectedVariant.id}`
    );
    setRemovingItems(new Set(allKeys));
    
    setTimeout(() => {
      clearCart();
      setRemovingItems(new Set());
    }, 300);
  };

  if (cartLoading) {
    return (
      <div className="max-w-full px-20 lg:px-30 py-10 bg-gray-100">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-full px-20 lg:px-30 py-10 bg-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 overflow-y-auto">
            <div className="rounded-lg lg:col-span-2 space-y-6 bg-gray-100">
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6 bg-white rounded-md">
                <Image
                  src="/cart_empty_background.png"
                  alt="Empty Cart"
                  width={100}
                  height={100}
                  className="mb-6"
                />

                {/* Tiêu đề */}
                <h1 className="text-2xl font-bold mb-2">Your cart is empty.</h1>
                <p className="text-gray-500 mb-6">
                  Shop now on the home page!!!
                </p>

                <Link
                  href={Routes.home()}
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
            {/* <div className="mt-15">
              <RecommendedProducts />
            </div> */}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky" style={{ top: "var(--header-h)" }}>
              <CartSummary
                subtotal={selectedSubtotal}
                totalQuantity={selectedQuantity}
                isEmpty={selectedItems.size === 0}
                selectedItems={selectedItems}
              />
            </div>
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 overflow-y-auto">
          <CartItems
            cart={cart}
            setItemQuantity={handleSetItemQuantity}
            removeFromCart={handleRemoveFromCart}
            clearCart={handleClearCart}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            removingItems={removingItems}
          />

          {/* <div className="mt-15">
            <RecommendedProducts />
          </div> */}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky" style={{ top: "var(--header-h)" }}>
            <CartSummary
              subtotal={selectedSubtotal}
              totalQuantity={selectedQuantity}
              isEmpty={selectedItems.size === 0}
              selectedItems={selectedItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
