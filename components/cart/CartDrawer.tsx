"use client";

import { X, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Routes } from "@/lib/routes";
import { useCart } from "@/context/CartContext";
import ConfirmPopover from "@/components/ui-common/ConfirmPopover";
import { useEffect, useState, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { cart, removeFromCart, setItemQuantity } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const [editingQuantities, setEditingQuantities] = useState<
    Map<string, number | string>
  >(new Map());

  const lastSyncedQuantities = useRef<Map<string, number>>(new Map());

  const [syncingItems, setSyncingItems] = useState<Set<string>>(new Set());

  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const requestIds = useRef<Map<string, number>>(new Map());

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Lấy số lượng hiện tại
  const getCurrentQuantity = (key: string, item: any): number => {
    const editing = editingQuantities.get(key);
    if (typeof editing === "number") return editing;
    return item.quantity;
  };

  const debouncedSetItemQuantity = (
    cartItemId: string,
    quantity: number,
    key: string
  ) => {
    const existingTimer = debounceTimers.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set syncing state
    setSyncingItems((prev) => new Set(prev).add(key));

    // Set new timer - đợi 2 giây không có thao tác mới gửi request
    const timer = setTimeout(async () => {
      const currentRequestId = (requestIds.current.get(key) || 0) + 1;
      requestIds.current.set(key, currentRequestId);

      try {
        await setItemQuantity(cartItemId, quantity);

        if (requestIds.current.get(key) === currentRequestId) {
          lastSyncedQuantities.current.set(key, quantity);

          setEditingQuantities((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
        }
      } catch (error) {
        console.error(`Failed to update quantity for ${cartItemId}:`, error);

        // Chỉ rollback nếu đây là request mới nhất
        if (requestIds.current.get(key) === currentRequestId) {
          // Rollback về số lượng đã sync thành công lần cuối
          const lastSynced = lastSyncedQuantities.current.get(key);
          if (lastSynced !== undefined) {
            setEditingQuantities((prev) => {
              const next = new Map(prev);
              next.set(key, lastSynced);
              return next;
            });
          }
        }
      } finally {
        // Chỉ clear syncing state nếu đây là request mới nhất
        if (requestIds.current.get(key) === currentRequestId) {
          setSyncingItems((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
          debounceTimers.current.delete(key);
        }
      }
    }, 2000);

    debounceTimers.current.set(key, timer);
  };

  useEffect(() => {
    return () => {
      debounceTimers.current.forEach((timer: NodeJS.Timeout) =>
        clearTimeout(timer)
      );
      debounceTimers.current.clear();
    };
  }, []);

  useEffect(() => {
    cart.forEach((item) => {
      const key =
        item.cartItemId || `${item.product.slug}__${item.selectedVariant.id}`;
      if (!lastSyncedQuantities.current.has(key)) {
        lastSyncedQuantities.current.set(key, item.quantity);
      }
    });
  }, [cart]);

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
            <div className="text-center py-10 text-gray-500">
              Giỏ hàng trống
            </div>
          ) : (
            cart.map((item, index) => {
              const key =
                item.cartItemId ||
                `${item.product.slug}__${item.selectedVariant.id}`;
              const isRemoving = removingItems.has(key);
              const currentQuantity = getCurrentQuantity(key, item);
              const maxInv =
                item.selectedVariant.availableQuantity ??
                item.selectedVariant.quantityAvailable ??
                99;
              const isOutOfStock =
                item.status === "out_of_stock" || item.status === "unavailable";
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
                  <div className="flex-1 flex flex-col gap-2 leading-tight justify-center">
                    {/* Product Name */}
                    <Link
                      href={productUrl}
                      onClick={onClose}
                      className="font-medium text-base hover:text-gray-800 transition block"
                    >
                      {item.product.name}
                    </Link>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-md w-fit overflow-hidden h-8">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.cartItemId || isOutOfStock) return;
                              const current = getCurrentQuantity(key, item);
                              if (current <= 1) return;
                              const newQty = current - 1;
                              setEditingQuantities((prev) =>
                                new Map(prev).set(key, newQty)
                              );
                              debouncedSetItemQuantity(
                                item.cartItemId,
                                newQty,
                                key
                              );
                            }}
                            disabled={
                              currentQuantity <= 1 ||
                              isRemoving ||
                              !item.cartItemId ||
                              isOutOfStock
                            }
                            variant="ghost"
                            className="w-6 h-full p-0 text-gray-500 hover:bg-transparent group"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full group-hover:bg-gray-100 group-active:bg-gray-300 transition">
                              -
                            </span>
                          </Button>

                          <input
                            type="text"
                            value={editingQuantities.get(key) ?? item.quantity}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (isOutOfStock) return;

                              const val = e.target.value;
                            
                              if (val === "") {
                                setEditingQuantities((prev) =>
                                  new Map(prev).set(key, "")
                                );
                                return;
                              }

                              if (!/^\d+$/.test(val)) return;

                              const num = parseInt(val, 10);
                              const maxAllowed = Math.min(99, maxInv);

                              if (num >= 0 && num <= maxAllowed) {
                                setEditingQuantities((prev) =>
                                  new Map(prev).set(key, num)
                                );
                              } else if (num > maxAllowed) {
                                setEditingQuantities((prev) =>
                                  new Map(prev).set(key, maxAllowed)
                                );
                              }
                            }}
                            onBlur={(e) => {
                              e.stopPropagation();
                              if (isOutOfStock) return;

                              const currentVal = editingQuantities.get(key);

                              if (
                                currentVal === "" ||
                                currentVal === undefined
                              ) {
                                setEditingQuantities((prev) => {
                                  const next = new Map(prev);
                                  next.delete(key);
                                  return next;
                                });
                                return;
                              }

                              if (typeof currentVal === "number") {
                                let finalQty = currentVal;
                                const maxAllowed = Math.min(99, maxInv);

                                if (currentVal < 1) {
                                  finalQty = 1;
                                } else if (currentVal > maxAllowed) {
                                  finalQty = maxAllowed;
                                }

                                const originalQty = item.quantity;
                                if (
                                  finalQty !== originalQty &&
                                  item.cartItemId
                                ) {

                                  setEditingQuantities((prev) =>
                                    new Map(prev).set(key, finalQty)
                                  );
                                  debouncedSetItemQuantity(
                                    item.cartItemId,
                                    finalQty,
                                    key
                                  );
                                } else {
                                  setEditingQuantities((prev) => {
                                    const next = new Map(prev);
                                    next.delete(key);
                                    return next;
                                  });
                                }
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={
                              isRemoving || !item.cartItemId || isOutOfStock
                            }
                            className="w-8 text-center text-sm font-medium border-0 focus:outline-none focus:ring-0 bg-transparent"
                          />
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.cartItemId || isOutOfStock) return;
                              const current = getCurrentQuantity(key, item);
                              if (current >= maxInv) return;
                              const newQty = current + 1;
                              setEditingQuantities((prev) =>
                                new Map(prev).set(key, newQty)
                              );
                              debouncedSetItemQuantity(
                                item.cartItemId,
                                newQty,
                                key
                              );
                            }}
                            disabled={
                              currentQuantity >= maxInv ||
                              isRemoving ||
                              !item.cartItemId ||
                              isOutOfStock
                            }
                            variant="ghost"
                            className="
    w-6 h-full p-0
    text-gray-500 hover:bg-transparent
    group
  "
                          >
                            <span
                              className="
      flex items-center justify-center
      w-5 h-5
      rounded-full
      transition
      group-hover:bg-gray-100
      group-active:bg-gray-300
    "
                            >
                              +
                            </span>
                          </Button>
                        </div>

                        {/* Final Price */}
                        <div className="text-right">
                          {item.selectedVariant.originalPrice ? (
                            Number(item.selectedVariant.finalPrice) <
                            Number(item.selectedVariant.originalPrice) ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-400 line-through">
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
                        </div>
                      </div>

                      {/* Row 2: Delete Button + Total Price */}
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
                            className="text-red-500 drop-shadow-none hover:bg-blue-50 hover:text-red-700 text-xs flex items-center gap-1 h-7 px-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </ConfirmPopover>

                        {/* Total Price */}
                        <div className="text-base font-semibold">
                          {(
                            Number(item.selectedVariant.finalPrice) *
                            currentQuantity
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
                XEM GIỎ HÀNG ({totalQuantity} SẢN PHẨM)
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
