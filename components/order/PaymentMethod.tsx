"use client";
import { PaymentMethodType } from "@/types/payment";
import Image from "next/image";
import { useEffect } from "react";

type PaymentMethodsProps = {
  value: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
};

export default function PaymentMethods({
  value,
  onChange,
}: PaymentMethodsProps) {
  useEffect(() => {
    if (!value) {
      onChange("COD");
    }
  }, [value, onChange]);
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 pt-8 pb-10">
      <h2 className="text-2xl font-bold mb-4">3. Thanh toán</h2>

      <div className="space-y-4">
        {/* COD */}
        <div
          className={`border rounded-lg p-4 cursor-pointer ${
            value === "COD"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onClick={() => onChange("COD")}
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="payment"
              checked={value === "COD"}
              onChange={() => onChange("COD")}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold text-lg text-gray-800">
              Thanh toán khi nhận hàng (COD)
            </span>
          </label>

          {value === "COD" && (
            <div className="mt-4 pl-7 text-gray-600 text-base font-medium">
              Thanh toán cho nhân viên giao hàng khi nhận hàng.
            </div>
          )}
        </div>

        {/* VNPAY */}
        <div
          className={`border rounded-lg p-4 pt-2 cursor-pointer ${
            value === "VNPAY" ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onClick={() => onChange("VNPAY")}
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={value === "VNPAY"}
              onChange={() => onChange("VNPAY")}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500"
            />
            <Image
              src="/vnpay_logo.png"
              alt="Logo VNPAY"
              width={60}
              height={30}
              className="object-contain"
            />
          </label>

          {value === "VNPAY" && (
            <p className="mt-4 pl-7 text-gray-600 text-base font-semibold">
              Bạn sẽ được chuyển hướng đến cổng thanh toán VNPAY để hoàn tất thanh toán của bạn.
            </p>
          )}
        </div>
      </div>

      {/* Error nếu submit mà chưa chọn */}
      {!value && (
        <p className="text-xs text-red-500 mt-2">
          Vui lòng chọn phương thức thanh toán.
        </p>
      )}
    </div>
  );
}
