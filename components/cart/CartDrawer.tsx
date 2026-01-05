"use client";

import { X, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Routes } from "@/lib/routes";
import { useCart } from "@/context/CartContext";
import ConfirmPopover from "@/components/ConfirmPopover";
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { cart, removeFromCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleRemove = (cartItemId: string) => {
    if (!cartItemId) {
      console.error("Cannot remove item: no cartItemId");
      return;
    }

    setRemovingItems((prev) => new Set(prev).add(cartItemId));

    setTimeout(() => {
      removeFromCart(cartItemId);
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[100] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-500">
          <h2 className="text-xl font-bold">Giỏ hàng của tôi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Giỏ hàng trống</div>
          ) : (
            cart.map((item, index) => {
              
              const key = item.cartItemId || `${item.product.slug}__${item.selectedVariant.id}`;
              const isRemoving = removingItems.has(key);
              const productUrl = item.selectedVariant.id
                ? Routes.product(item.product.slug, item.selectedVariant.id)
                : Routes.product(item.product.slug);

              return (
                <div
                  key={key}
                  className={`flex gap-4 pb-4 border-b last:border-b-0 transition-all duration-300 ${
                    isRemoving
                      ? "opacity-0 scale-95 -translate-x-4"
                      : isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4"
                  }`}
                  style={{
                    transitionDelay: isRemoving ? "0ms" : `${index * 50}ms`,
                  }}
                >
                  <div className="w-30 h-30 rounded bg-gray-100 flex items-center justify-center">
                    <Image
                      src={
                        item.selectedVariant.images?.[0]?.publicUrl ||
                        "/placeholder.png"
                      }
                      alt={item.product.name}
                      width={100}
                      height={100}
                      className="object-contain rounded transition  mix-blend-multiply"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 justify-between flex flex-col">
                    <Link
                      href={productUrl}
                      onClick={onClose}
                      className="font-medium text-lg hover:text-lg transition block"
                    >
                      {item.product.name}
                    </Link>

                    <span className="text-sm">Quantity: {item.quantity}</span>

                    <div className="flex items-center justify-between">
                      <ConfirmPopover
                        title={`${item.product.brand?.name} ${item.product.name}`}
                        onConfirm={() => {
                          if (item.cartItemId) {
                            handleRemove(item.cartItemId);
                          }
                        }}
                      >
                        <Button
                          disabled={isRemoving || !item.cartItemId}
                          className="text-red-500 drop-shadow-none hover:bg-blue-50 hover:text-red-700 text-xs mt-2 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </ConfirmPopover>

                      {/* Price */}
                      <div className="text-right">
                        {item.selectedVariant.originalPrice ? (
                          Number(item.selectedVariant.finalPrice) <
                          Number(item.selectedVariant.originalPrice) ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400 line-through">
                                {Number(
                                  item.selectedVariant.originalPrice
                                ).toLocaleString("en-US")}
                                đ
                              </span>
                              <span className="text-sm font-semibold text-red-500">
                                {Number(
                                  item.selectedVariant.finalPrice
                                ).toLocaleString("en-US")}
                                đ
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-800">
                              {Number(
                                item.selectedVariant.finalPrice
                              ).toLocaleString("en-US")}
                              đ
                            </div>
                          )
                        ) : (
                          <div className="text-sm font-medium text-gray-800">
                            {Number(
                              item.selectedVariant.finalPrice
                            ).toLocaleString("en-US")}
                            đ
                          </div>
                        )}

                        <div className="text-lg font-normal">
                          {(
                            Number(item.selectedVariant.finalPrice) *
                            item.quantity
                          ).toLocaleString("en-US")}
                          đ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-500 p-6">
            <Link href={Routes.cart()} onClick={onClose}>
              <Button className="w-full h-12 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700">
                XEM GIỎ HÀNG ({totalQuantity} MỤC)
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
