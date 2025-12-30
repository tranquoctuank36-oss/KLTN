"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmPopover from "@/components/ConfirmPopover";
import { CartItem } from "@/types/cart";
import Link from "next/link";
import { Routes } from "@/lib/routes";

type Props = {
  cart: CartItem[];
  setItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  selectedItems?: Set<string>;
  onSelectionChange?: (items: Set<string>) => void;
  removingItems: Set<string>;
};

export default function CartItems({
  cart,
  setItemQuantity,
  removeFromCart,
  clearCart,
  selectedItems = new Set(),
  onSelectionChange,
  removingItems,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const allKeys = new Set(
      cart.map(
        (item) =>
          item.cartItemId || `${item.product.slug}__${item.selectedVariant.id}`
      )
    );
    return allKeys;
  });
  const [isClearing, setIsClearing] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<
    Map<string, number | string>
  >(new Map());

  useEffect(() => {
    if (cart.length > 0) {
      const allKeys = new Set(
        cart.map(
          (item) =>
            item.cartItemId ||
            `${item.product.slug}__${item.selectedVariant.id}`
        )
      );
      setSelected(allKeys);
      onSelectionChange?.(allKeys);
    } else {
      // Khi cart rỗng, reset selected
      setSelected(new Set());
      onSelectionChange?.(new Set());
    }
  }, [cart.length, onSelectionChange]);

  const handleToggleItem = (itemKey: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
    } else {
      newSelected.add(itemKey);
    }
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleToggleAll = () => {
    if (selected.size === cart.length) {
      setSelected(new Set());
      onSelectionChange?.(new Set());
    } else {
      const allKeys = new Set(
        cart.map(
          (item) =>
            item.cartItemId ||
            `${item.product.slug}__${item.selectedVariant.id}`
        )
      );
      setSelected(allKeys);
      onSelectionChange?.(allKeys);
    }
  };

  const handleClearCart = async () => {
    setSelected(new Set());
    onSelectionChange?.(new Set());

    setIsClearing(true);

    setTimeout(async () => {
      await clearCart();
      setIsClearing(false);
    }, 400);
  };

  const isAllSelected = cart.length > 0 && selected.size === cart.length;

  return (
    <div className="rounded-lg lg:col-span-2 space-y-1 bg-gray-100">
      {cart.length > 0 && (
        <label className="flex items-center gap-3 p-4 bg-white rounded-md cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleToggleAll}
            disabled={isClearing}
            className="w-5 h-5 cursor-pointer accent-blue"
          />
          <span className="font-semibold text-base select-none">
            Select all
          </span>
        </label>
      )}

      {cart.map((item, index) => {
        const key =
          item.cartItemId || `${item.product.slug}__${item.selectedVariant.id}`;
        const maxInv = item.selectedVariant.availableQuantity ?? Infinity;
        const isSelected = selected.has(key);
        const isRemoving = removingItems.has(key) || isClearing;
        const finalPrice = Number(item.selectedVariant.finalPrice);
        const originalPrice = Number(item.selectedVariant.originalPrice);
        const isOnSale = finalPrice < originalPrice;

        const productUrl = item.product.id
          ? Routes.product(item.product.slug, item.selectedVariant.id)
          : Routes.product(item.product.slug);

        return (
          <div
            key={key}
            className={`relative flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-md bg-white min-h-[140px] transition-all duration-300 ${
              isRemoving
                ? "opacity-0 scale-95 -translate-x-4"
                : "opacity-100 scale-100 translate-x-0"
            }`}
            style={{
              transitionDelay: isRemoving
                ? isClearing
                  ? `${index * 50}ms`
                  : "0ms"
                : `${index * 30}ms`,
            }}
          >
            {/* Checkbox */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleItem(key)}
                disabled={isRemoving}
                className="w-5 h-5 cursor-pointer accent-blue"
              />
            </div>

            <div className="flex items-center gap-4 flex-1 ml-8">
              <Image
                src={
                  item?.selectedVariant?.images?.[0]?.publicUrl ||
                  "/placeholder.png"
                }
                alt={item?.product?.name || "Product image"}
                width={260}
                height={130}
                className="object-contain rounded-md"
              />

              <div className="flex flex-col justify-center">
                <h2 className="font-semibold text-xl transition">
                  {item.product.name}
                </h2>

                {/* <p className="text-sm pt-2">
                  <span className="text-gray-600 font-bold">Color:</span>{" "}
                  <span className="text-gray-500">
                    {Array.isArray(item.selectedVariant.colors)
                      ? item.selectedVariant.colors
                          .map((c: { name: string }) => c.name)
                          .join(", ")
                      : "--"}
                  </span>
                </p> */}

                <p className="text-base pt-2">
                  <span className="text-gray-600">Price:</span>{" "}
                  {isOnSale ? (
                    <>
                      {/* Original price (gạch ngang) */}
                      <span className="text-gray-400 line-through mr-2">
                        {originalPrice.toLocaleString("en-US")} đ
                      </span>

                      {/* Final price */}
                      <span className="text-red-600 font-bold">
                        {finalPrice.toLocaleString("en-US")} đ
                      </span>
                    </>
                  ) : (
                    /* Không sale → chỉ hiện final price */
                    <span className="text-gray-700 font-bold">
                      {finalPrice.toLocaleString("en-US")} đ
                    </span>
                  )}
                </p>

                <div className="flex items-center border rounded-md mt-3 w-fit overflow-hidden h-10">
                  <Button
                    onClick={() => {
                      if (item.cartItemId && item.quantity > 1) {
                        setItemQuantity(item.cartItemId, item.quantity - 1);
                      }
                    }}
                    disabled={
                      item.quantity <= 1 || isRemoving || !item.cartItemId
                    }
                    className="w-8 h-full text-xl p-0 hover:bg-white text-gray-400"
                    variant="ghost"
                  >
                    -
                  </Button>
                  <input
                    type="text"
                    value={editingQuantities.get(key) ?? item.quantity}
                    onChange={(e) => {
                      const val = e.target.value;

                      // Allow empty string temporarily for user to clear and type
                      if (val === "") {
                        setEditingQuantities((prev) =>
                          new Map(prev).set(key, "")
                        );
                        return;
                      }

                      // Only allow digits
                      if (!/^\d+$/.test(val)) return;

                      const num = parseInt(val, 10);
                      const maxAllowed = Math.min(99, maxInv);

                      // Allow any number during typing, will validate on blur
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
                    onBlur={() => {
                      const currentVal = editingQuantities.get(key);

                      // If empty or invalid, reset to current quantity
                      if (currentVal === "" || currentVal === undefined) {
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

                        // Update if different from current
                        if (finalQty !== item.quantity && item.cartItemId) {
                          setItemQuantity(item.cartItemId, finalQty);
                        }

                        // Clear editing state
                        setEditingQuantities((prev) => {
                          const next = new Map(prev);
                          next.delete(key);
                          return next;
                        });
                      }
                    }}
                    disabled={isRemoving || !item.cartItemId}
                    className="w-10 flex items-center justify-center text-base font-medium text-center border-0 focus:outline-none focus:ring-0"
                  />
                  <Button
                    onClick={() => {
                      if (item.cartItemId && item.quantity < maxInv) {
                        setItemQuantity(item.cartItemId, item.quantity + 1);
                      }
                    }}
                    disabled={
                      item.quantity >= maxInv || isRemoving || !item.cartItemId
                    }
                    className="w-8 h-full text-xl p-0 hover:bg-white text-gray-400"
                    variant="ghost"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 font-semibold text-xl">
              {item.selectedVariant.originalPrice &&
                Number(item.selectedVariant.originalPrice) > 0 &&
                Number(item.selectedVariant.originalPrice) >
                  Number(item.selectedVariant.finalPrice) && (
                  <div className="text-gray-400 line-through">
                    {(
                      Number(item.selectedVariant.originalPrice) * item.quantity
                    ).toLocaleString("en-US")}
                    đ
                  </div>
                )}

              <div className="text-gray-800">
                {(
                  Number(item.selectedVariant.finalPrice) * item.quantity
                ).toLocaleString("en-US")}
                đ
              </div>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center text-sm">
              <Link href={productUrl}>
                <Button
                  variant="ghost"
                  disabled={isRemoving}
                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent hover:bg-blue-50"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
              </Link>
              <span className="text-gray-500 px-2"> | </span>
              <ConfirmPopover
                title={`${item.product.name}`}
                onConfirm={() => {
                  if (item.cartItemId) {
                    removeFromCart(item.cartItemId);
                  }
                }}
              >
                <Button
                  variant="ghost"
                  disabled={isRemoving || !item.cartItemId}
                  className="text-red-600 hover:text-red-700 hover:bg-transparent hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </ConfirmPopover>
            </div>
          </div>
        );
      })}

      <div className="flex justify-end">
        <ConfirmPopover
          title="All items in your cart"
          description="Are you sure you want to clear"
          confirmText="Clear Cart"
          onConfirm={handleClearCart}
        >
          <Button
            variant="outline"
            disabled={isClearing}
            className="border-none italic text-red-600 hover:text-red-600 drop-shadow-none bg-gray-100 hover:bg-gray-100 hover:underline"
          >
            Clear Cart
          </Button>
        </ConfirmPopover>
      </div>
    </div>
  );
}
