"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import PaypalCheckoutButton from "./PaypalCheckoutButton";

type PaymentMethodsProps = {
  value: string; // "card" | "paypal"
  onChange: (method: string) => void;
  submitted?: boolean;
};

export default function PaymentMethods({
  value,
  onChange,
  submitted = false,
}: PaymentMethodsProps) {
  if (!value) {
    onChange("paypal");
  }
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 pt-8 pb-10">
      <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
      {/* PayPal */}
      <div
        className={`border rounded-lg p-4 cursor-pointer ${
          value === "paypal" ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onClick={() => onChange("paypal")}
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === "paypal"}
            onChange={() => onChange("paypal")}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-semibold text-lg text-[#003087]">PayPal</span>
        </label>

        {value === "paypal" && (
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-base mb-4 font-semibold">
              Click the button to be redirected to PayPal & complete your
              purchase.
            </p>
            
            <PaypalCheckoutButton/>
          </div>
        )}
      </div>

      {/* Error nếu submit mà chưa chọn */}
      {submitted && !value && (
        <p className="text-xs text-red-500 mt-2">
          Please select a payment method
        </p>
      )}
    </div>
  );
}
