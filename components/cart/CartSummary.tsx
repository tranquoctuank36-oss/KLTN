"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Routes } from "@/lib/routes";
import { useRouter } from "next/navigation";

type Props = {
  subtotal: number;
  totalQuantity: number;
  isEmpty?: boolean;
  selectedItems?: Set<string>;
};

export default function CartSummary({
  subtotal,
  totalQuantity,
  isEmpty = false,
  selectedItems = new Set(),
}: Props) {
  const { discountCode, discountAmount, applyDiscount, clearDiscount, cart } =
    useCart();
  const [couponInput, setCouponInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isEmpty) {
      setCouponInput("");
      setError("");
      clearDiscount();
    }
  }, [isEmpty, clearDiscount]);

  const coupons: Record<string, number> = {
    VIP15: 0.15,
    SALE10: 0.1,
  };

  const handleApply = () => {
    const code = couponInput.trim().toUpperCase();
    if (coupons[code]) {
      const discount = subtotal * coupons[code];
      applyDiscount(code, discount);
      setError("");
    } else {
      setError("That coupon is not valid for this order.");
      clearDiscount();
    }
  };

  const handleCheckout = () => {
    localStorage.setItem(
      "checkoutSelectedItems",
      JSON.stringify(Array.from(selectedItems))
    );

    if (discountCode && discountAmount > 0) {
      localStorage.setItem(
        "checkoutDiscount",
        JSON.stringify({
          code: discountCode,
          amount: discountAmount,
        })
      );
    }
    router.push(Routes.checkouts());
  };

  const grandTotal = subtotal - discountAmount;

  return (
    <div className="rounded-lg p-6 h-fit bg-white">
      <div className="flex items-center mb-5 mt-5">
        <input
          type="text"
          placeholder="Coupon"
          value={couponInput}
          onChange={(e) => {
            setCouponInput(e.target.value);
            setError("");
          }}
          disabled={isEmpty}
          className={`flex-1 border rounded-l-md px-3 py-3 font-semibold text-gray-600 focus:outline-none ${
            isEmpty
              ? "bg-gray-100 cursor-not-allowed"
              : error
              ? "border-red-500 bg-red-50"
              : "border-gray-300 focus:border-blue-500 focus:border-r-gray-300"
          }`}
        />
        <Button
          onClick={handleApply}
          disabled={isEmpty}
          className={`rounded-l-none text-white px-6 py-6 ${
            isEmpty
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-500 hover:bg-gray-800"
          }`}
        >
          <span className="text-xl">Apply</span>
        </Button>
      </div>

      {error && <p className="text-xs text-red-500 mb-5">{error}</p>}

      <hr className="my-5" />

      <div className="space-y-2 text-sm font-medium text-gray-500">
        <div className="flex justify-between">
          <span>Subtotal ({totalQuantity} items):</span>
          <span>{subtotal.toLocaleString("en-US")}đ</span>
        </div>

        {discountCode && discountAmount > 0 && (
          <div className="flex justify-between text-red-600 font-semibold">
            <span>Discount ({discountCode}):</span>
            <span>-{discountAmount.toLocaleString("en-US")}đ</span>
          </div>
        )}
      </div>

      <hr className="my-5" />

      <div className="flex justify-between items-center text-lg font-bold mb-2">
        <span>Grand total:</span>
        <span>{grandTotal.toLocaleString("en-US")}đ</span>
      </div>

      <ul className="space-y-2 text-sm text-blue-500 font-semibold mb-6">
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-500 mt-1" /> Free shipping and
          returns
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-500 mt-1" /> 100% money-back
          guarantee
        </li>
      </ul>

      <Button
        onClick={handleCheckout}
        disabled={isEmpty}
        className={`w-full h-12 text-lg font-bold text-white ${
          isEmpty
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        Proceed to Checkout
      </Button>

      {cart.length > 0 && (
        <Link href={Routes.home()}>
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-2 border-blue-600 hover:border-blue-700 hover:bg-white hover:text-blue-700 w-full h-12 text-lg font-bold mb-5 mt-3"
          >
            Continue shopping
          </Button>
        </Link>
      )}
    </div>
  );
}
