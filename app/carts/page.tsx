"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Routes } from "@/lib/routes";
import { useEffect, useState } from "react";
import CartSummary from "../../components/cart/CartSummary";
import CartItems from "../../components/cart/CartItems";

export default function CartPage() {
  const {
    cart,
    setItemQuantity,
    removeFromCart,
    clearCart,
    totalQuantity,
    clearDiscount,
  } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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

  // Kiểm tra xem mặt hàng nào bạn đã chọn có hết hàng hoặc không có sẵn không.
  const hasOutOfStockItems = selectedCart.some((item) => {
    const maxInv = item.selectedVariant.availableQuantity ?? item.selectedVariant.quantityAvailable ?? Infinity;
    return item.status === "out_of_stock" || item.status === "unavailable" || maxInv <= 0;
  });

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

  // Loading
  if (initialLoading) {
    return (
      <div className="max-w-full px-20 lg:px-30 py-10 bg-gray-100">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          {/* Right skeleton */}
          <div className="lg:col-span-1">
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
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
                  alt="Giỏ Hàng Trống"
                  width={100}
                  height={100}
                  className="mb-6"
                />

                <h1 className="text-2xl font-bold mb-2">Giỏ hàng của bạn trống</h1>
                <p className="text-gray-500 mb-6">
                  Mua sắm ngay trên trang chủ!!!
                </p>

                <Link
                  href={Routes.products()}
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky" style={{ top: "var(--header-h)" }}>
              <CartSummary
                subtotal={selectedSubtotal}
                totalQuantity={selectedQuantity}
                isEmpty={selectedItems.size === 0}
                selectedItems={selectedItems}
                hasOutOfStockItems={hasOutOfStockItems}
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
        <span>Giỏ hàng</span>
        <span className="ml-4 text-gray-500 text-base font-bold">
          {totalQuantity} {totalQuantity === 1 ? "sản phẩm" : "sản phẩm"}
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

        </div>

        <div className="lg:col-span-1">
          <div className="sticky" style={{ top: "var(--header-h)" }}>
            <CartSummary
              subtotal={selectedSubtotal}
              totalQuantity={selectedQuantity}
              isEmpty={selectedItems.size === 0}
              selectedItems={selectedItems}
              hasOutOfStockItems={hasOutOfStockItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
