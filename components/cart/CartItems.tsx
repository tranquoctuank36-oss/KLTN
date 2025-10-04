"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import ConfirmPopover from "@/components/ConfirmPopover";
import { CartItem } from "@/context/CartContext";

type Props = {
  cart: CartItem[];
  setItemQuantity: (
    key: { slug: string; imageSetId: string; size: string },
    quantity: number
  ) => void;
  removeFromCart: (key: { slug: string; imageSetId: string; size: string }) => void;
  clearCart: () => void;
};

export default function CartItems({
  cart,
  setItemQuantity,
  removeFromCart,
  clearCart,
}: Props) {
  return (
    <div className="rounded-lg lg:col-span-2 space-y-6 bg-gray-100">
      {cart.map((item) => {
        const key = `${item.product.slug}__${item.selected.id}__${item.size}`;
        const maxInv =
          item.selected.sizes.find((s) => s.size === item.size)?.inventory ??
          Infinity;

        return (
          <div
            key={key}
            className="relative flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-md shadow-sm bg-white min-h-[140px]"
          >
            <div className="flex items-start gap-4 flex-1">
              <Image
                src={item.selected.images.find((i) => i.id === "front")?.url || ""}
                alt={item.product.name}
                width={260}
                height={130}
                className="object-contain rounded-md"
              />

              <div className="flex-1 w-full pt-1">
                <h2 className="font-bold text-xl">{item.product.name}</h2>
                <p className="text-sm pt-2">
                  <span className="text-gray-600 font-bold">Color:</span>{" "}
                  <span className="text-gray-500">{item.selected.label}</span>
                </p>
                <p className="text-sm pt-2">
                  <span className="text-gray-600 font-bold">Size:</span>{" "}
                  <span className="text-gray-500">{item.size}</span>
                </p>
                <p className="text-sm pt-2">
                  <span className="text-gray-600 font-bold">Price:</span>{" "}
                  <span className="text-gray-500">${item.product.price}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="font-semibold text-lg text-gray-800">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>

              <div className="flex items-center border rounded-md">
                <Button
                  onClick={() =>
                    setItemQuantity(
                      {
                        slug: item.product.slug,
                        imageSetId: item.selected.id,
                        size: item.size,
                      },
                      item.quantity - 1
                    )
                  }
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 p-0 hover:bg-white text-gray-400"
                  variant="ghost"
                >
                  -
                </Button>
                <span className="w-10 text-center font-medium">{item.quantity}</span>
                <Button
                  onClick={() =>
                    setItemQuantity(
                      {
                        slug: item.product.slug,
                        imageSetId: item.selected.id,
                        size: item.size,
                      },
                      item.quantity + 1
                    )
                  }
                  disabled={item.quantity >= maxInv}
                  className="w-8 h-8 p-0 hover:bg-white text-gray-400"
                  variant="ghost"
                >
                  +
                </Button>
              </div>
            </div>

            <ConfirmPopover
              title={item.product.name}
              onConfirm={() =>
                removeFromCart({
                  slug: item.product.slug,
                  imageSetId: item.selected.id,
                  size: item.size,
                })
              }
            >
              <Button
                variant="ghost"
                className="absolute bottom-2 right-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </ConfirmPopover>
          </div>
        );
      })}

      <div className="flex justify-end">
        <ConfirmPopover title="all items in your cart" onConfirm={clearCart}>
          <Button variant="outline" className="border-none text-red-600 hover:bg-red-50">
            Clear Cart
          </Button>
        </ConfirmPopover>
      </div>
    </div>
  );
}
