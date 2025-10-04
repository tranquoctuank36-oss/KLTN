"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Routes } from "@/lib/routes";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Props = {
  subtotal: number;
  totalQuantity: number;
};

export default function CartSummary({ subtotal, totalQuantity }: Props) {
  const { discountCode, discountAmount, applyDiscount, clearDiscount } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [error, setError] = useState("");

  // ✅ Giả lập danh sách coupon hợp lệ
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

  const grandTotal = subtotal - discountAmount;

  return (
    <div className="rounded-lg p-6 h-fit shadow-sm bg-white">
      {/* Coupon */}
      <div className="flex mb-2 mt-5">
        <input
          type="text"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
          placeholder="Coupon"
          className={`flex-1 border rounded-l-md px-3 py-2 font-semibold text-gray-600 focus:outline-none ${
            error ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:border-r-gray-300"
          }`}
        />
        <Button
          onClick={handleApply}
          className="rounded-l-none bg-gray-500 hover:bg-gray-800 text-white px-6 py-6"
        >
          <span className="text-xl">Apply</span>
        </Button>
      </div>

      {/* Error message */}
      {error && <p className="text-xs text-red-500 mb-5">{error}</p>}

      <hr className="my-5" />

      <div className="space-y-2 text-sm font-medium text-gray-500">
        <div className="flex justify-between">
          <span>Subtotal ({totalQuantity} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {discountCode && discountAmount > 0 && (
          <div className="flex justify-between text-red-600 font-semibold">
            <span>Discount ({discountCode})</span>
            <span>- ${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping & Handling</span>
          <span>$0</span>
        </div>
      </div>

      <hr className="my-5" />

      <div className="flex justify-between items-center text-lg font-bold mb-2">
        <span>Grand total:</span>
        <span>${grandTotal.toFixed(2)}</span>
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

      {/* Buttons */}
      <Link href={Routes.checkouts()}>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white/100 w-full h-12 text-lg font-bold mb-5">
          Proceed to Checkout
        </Button>
      </Link>

      <div className="flex items-center mb-5">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="px-3 text-xs text-gray-500">Fast checkout with</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <Link href={Routes.checkouts()}>
        <Button className="bg-[#FFC439] hover:bg-[#F7B600] w-full h-12 flex items-center justify-center gap-2 font-semibold rounded-md">
          <span className="text-[22px] font-extrabold">
            <span className="text-[#003087]">Pay</span>
            <span className="text-[#009CDE]">Pal</span>
          </span>
          <span className="text-black text-[16px] font-semibold">
            Thanh toán
          </span>
        </Button>
      </Link>
    </div>
  );
}
