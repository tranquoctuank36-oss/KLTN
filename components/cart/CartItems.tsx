"use client";

import { useEffect, useState, useRef } from "react";
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
  
  // Local state cho số lượng đang editing (optimistic update)
  const [editingQuantities, setEditingQuantities] = useState<
    Map<string, number | string>
  >(new Map());
  
  // Lưu số lượng đã sync thành công lần cuối (để rollback khi lỗi)
  const lastSyncedQuantities = useRef<Map<string, number>>(new Map());
  
  // Track items đang trong quá trình sync với server
  const [syncingItems, setSyncingItems] = useState<Set<string>>(new Set());
  
  // Debounce timers cho từng item
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Request IDs để xử lý race condition
  const requestIds = useRef<Map<string, number>>(new Map());

  // Lấy số lượng hiện tại (từ editing state hoặc cart data)
  const getCurrentQuantity = (key: string, item: CartItem): number => {
    const editing = editingQuantities.get(key);
    if (typeof editing === "number") return editing;
    return item.quantity;
  };

  // Debounced function to update quantity - xử lý race condition và error
  const debouncedSetItemQuantity = (
    cartItemId: string,
    quantity: number,
    key: string
  ) => {
    // Clear existing timer for this item
    const existingTimer = debounceTimers.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set syncing state (subtle indicator)
    setSyncingItems((prev) => new Set(prev).add(key));

    // Set new timer - đợi 2 giây không có thao tác mới gửi request
    const timer = setTimeout(async () => {
      // Tạo request ID mới để xử lý race condition
      const currentRequestId = (requestIds.current.get(key) || 0) + 1;
      requestIds.current.set(key, currentRequestId);

      try {
        // Gọi API để sync số lượng
        await setItemQuantity(cartItemId, quantity);
        
        // Kiểm tra xem có phải request mới nhất không (race condition check)
        if (requestIds.current.get(key) === currentRequestId) {
          // Sync thành công - lưu lại quantity đã sync
          lastSyncedQuantities.current.set(key, quantity);
          
          // Xóa editing state để hiển thị data từ server
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
          
          // TODO: Hiển thị toast/notification lỗi cho user
          // toast.error("Không thể cập nhật số lượng. Vui lòng thử lại.");
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
    }, 2000); // Debounce 2 giây

    debounceTimers.current.set(key, timer);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach((timer) => clearTimeout(timer));
      debounceTimers.current.clear();
    };
  }, []);

  // Khởi tạo lastSyncedQuantities từ cart data ban đầu
  useEffect(() => {
    cart.forEach((item) => {
      const key = item.cartItemId || `${item.product.slug}__${item.selectedVariant.id}`;
      if (!lastSyncedQuantities.current.has(key)) {
        lastSyncedQuantities.current.set(key, item.quantity);
      }
    });
  }, [cart]);

  useEffect(() => {
    if (cart.length > 0) {
      // Only auto-select items that are in stock
      const inStockKeys = new Set(
        cart
          .filter((item) => {
            const maxInv = item.selectedVariant.quantityAvailable ?? Infinity;
            const isOutOfStock = item.status === "out_of_stock" || item.status === "unavailable" || maxInv <= 0;
            return !isOutOfStock;
          })
          .map(
            (item) =>
              item.cartItemId ||
              `${item.product.slug}__${item.selectedVariant.id}`
          )
      );
      setSelected(inStockKeys);
      onSelectionChange?.(inStockKeys);
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
    // Count only in-stock items
    const inStockItems = cart.filter((item) => {
      const maxInv = item.selectedVariant.availableQuantity ?? item.selectedVariant.quantityAvailable ?? Infinity;
      const isOutOfStock = item.status === "out_of_stock" || item.status === "unavailable" || maxInv <= 0;
      return !isOutOfStock;
    });

    if (selected.size === inStockItems.length && inStockItems.length > 0) {
      setSelected(new Set());
      onSelectionChange?.(new Set());
    } else {
      // Only select in-stock items
      const inStockKeys = new Set(
        inStockItems.map(
          (item) =>
            item.cartItemId ||
            `${item.product.slug}__${item.selectedVariant.id}`
        )
      );
      setSelected(inStockKeys);
      onSelectionChange?.(inStockKeys);
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

  // Check if all in-stock items are selected
  const inStockItemsCount = cart.filter((item) => {
    const maxInv = item.selectedVariant.availableQuantity ?? item.selectedVariant.quantityAvailable ?? Infinity;
    const isOutOfStock = item.status === "out_of_stock" || item.status === "unavailable" || maxInv <= 0;
    return !isOutOfStock;
  }).length;
  const isAllSelected = inStockItemsCount > 0 && selected.size === inStockItemsCount;

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
            Chọn tất cả
          </span>
        </label>
      )}

      {cart.map((item, index) => {
        const key =
          item.cartItemId || `${item.product.slug}__${item.selectedVariant.id}`;
        const maxInv = item.selectedVariant.availableQuantity ?? item.selectedVariant.quantityAvailable ?? 99;
        // Check if item is out of stock or unavailable - prioritize item.status from API
        const isOutOfStock = item.status === "out_of_stock" || item.status === "unavailable";
        
        const isSelected = selected.has(key);
        const isRemoving = removingItems.has(key) || isClearing;
        const isSyncing = syncingItems.has(key);
        const currentQuantity = getCurrentQuantity(key, item);
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
            } ${isOutOfStock ? "opacity-60" : ""}`}
            style={{
              transitionDelay: isRemoving
                ? isClearing
                  ? `${index * 50}ms`
                  : "0ms"
                : `${index * 30}ms`,
            }}
          >
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute top-4 left-4 bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-semibold z-10">
                {item.status === "unavailable" ? "Không có sẵn" : "Hết hàng"}
              </div>
            )}

            {/* Checkbox */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleItem(key)}
                disabled={isRemoving || isOutOfStock}
                className="w-5 h-5 cursor-pointer accent-blue disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-4 flex-1 ml-8">
              <div className="relative">
                <Image
                  src={
                    item?.selectedVariant?.images?.[0]?.publicUrl ||
                    "/placeholder.png"
                  }
                  alt={item?.product?.name || "Ảnh Sản Phẩm"}
                  width={260}
                  height={130}
                  className={`object-contain rounded-md ${isOutOfStock ? "grayscale" : ""}`}
                />
              </div>

              <div className="flex flex-col justify-center">
                <Link href={productUrl}>
                  <h2 className="font-semibold text-lg hover:font-bold transition-all duration-200 cursor-pointer">
                    {item.product.name}
                  </h2>
                </Link>

                {/* <p className="text-sm pt-2">
                  <span className="text-gray-600 font-bold">Màu:</span>{" "}
                  <span className="text-gray-500">
                    {Array.isArray(item.selectedVariant.colors)
                      ? item.selectedVariant.colors
                          .map((c: { name: string }) => c.name)
                          .join(", ")
                      : "--"}
                  </span>
                </p> */}

                <p className="text-base pt-2">
                  <span className="text-gray-600">Giá:</span>{" "}
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

                <div className="flex items-center border rounded-md mt-3 w-fit overflow-hidden h-10 relative">
                  <Button
                    onClick={() => {
                      if (!item.cartItemId || isOutOfStock) return;
                      
                      // Lấy số lượng hiện tại từ editing state hoặc cart
                      const current = getCurrentQuantity(key, item);
                      
                      // Không cho giảm xuống dưới 1
                      if (current <= 1) return;
                      
                      const newQty = current - 1;
                      
                      // Update local state immediately (optimistic)
                      setEditingQuantities((prev) =>
                        new Map(prev).set(key, newQty)
                      );
                      
                      // Debounced API call
                      debouncedSetItemQuantity(item.cartItemId, newQty, key);
                    }}
                    disabled={
                      currentQuantity <= 1 || isRemoving || !item.cartItemId || isOutOfStock
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
                      if (isOutOfStock) return; // Don't allow changes if out of stock
                      
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
                      if (isOutOfStock) return; // Don't validate if out of stock
                      
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

                        // Update nếu khác với số lượng ban đầu trong cart
                        const originalQty = item.quantity;
                        if (finalQty !== originalQty && item.cartItemId) {
                          // Set editing state với giá trị cuối cùng
                          setEditingQuantities((prev) =>
                            new Map(prev).set(key, finalQty)
                          );
                          // Debounced API call
                          debouncedSetItemQuantity(item.cartItemId, finalQty, key);
                        } else {
                          // Clear editing state if no change
                          setEditingQuantities((prev) => {
                            const next = new Map(prev);
                            next.delete(key);
                            return next;
                          });
                        }
                      }
                    }}
                    disabled={isRemoving || !item.cartItemId || isOutOfStock}
                    className="w-10 flex items-center justify-center text-base font-medium text-center border-0 focus:outline-none focus:ring-0"
                  />
                  <Button
                    onClick={() => {
                      if (!item.cartItemId || isOutOfStock) return;
                      
                      // Lấy số lượng hiện tại từ editing state hoặc cart
                      const current = getCurrentQuantity(key, item);
                      
                      // Không cho tăng vượt max inventory
                      if (current >= maxInv) return;
                      
                      const newQty = current + 1;
                      
                      // Update local state immediately (optimistic)
                      setEditingQuantities((prev) =>
                        new Map(prev).set(key, newQty)
                      );
                      
                      // Debounced API call
                      debouncedSetItemQuantity(item.cartItemId, newQty, key);
                    }}
                    disabled={
                      currentQuantity >= maxInv || isRemoving || !item.cartItemId || isOutOfStock
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
                      Number(item.selectedVariant.originalPrice) * currentQuantity
                    ).toLocaleString("en-US")}
                    đ
                  </div>
                )}

              <div className="text-gray-800">
                {(
                  Number(item.selectedVariant.finalPrice) * currentQuantity
                ).toLocaleString("en-US")}
                đ
              </div>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center text-sm">
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
          title="Tất cả các sản phẩm trong giỏ hàng của bạn"
          description="Bạn có chắc chắn muốn xóa"
          confirmText="Xóa giỏ hàng"
          onConfirm={handleClearCart}
        >
          <Button
            variant="outline"
            disabled={isClearing}
            className="border-none italic text-red-600 hover:text-red-600 drop-shadow-none bg-gray-100 hover:bg-gray-100 hover:underline"
          >
            Xóa giỏ hàng
          </Button>
        </ConfirmPopover>
      </div>
    </div>
  );
}
