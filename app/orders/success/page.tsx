"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Routes } from "@/lib/routes";

export const dynamic = 'force-dynamic';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    localStorage.removeItem("checkoutSelectedItems");
    localStorage.removeItem("checkoutDiscount");
  }, []);

  const handleCopy = () => {
    if (!orderCode) return;
    navigator.clipboard.writeText(orderCode);
    toast.success("Order code copied!");
  };

  if (!orderCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading order information...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 text-center">
      <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Order Successful
      </h1>

      <p className="text-gray-700 max-w-lg leading-relaxed mb-8">
        If you have any questions, please contact us at{" "}
        <span className="font-semibold">1900 12 34 56</span> or email{" "}
        <span className="font-semibold">cskh.glassesshop@gmail.com</span>. You
        can also track your order using the order code below.
      </p>

      <div className="flex items-center justify-center mb-6">
        <span className="text-gray-700 mr-2 font-medium">Order Code</span>
        <span className="bg-gray-100 px-4 py-2 rounded-md font-semibold text-gray-800 text-lg">
          {orderCode}
        </span>
        <button
          onClick={handleCopy}
          className="ml-2 text-gray-600 hover:text-black transition cursor-pointer"
          title="Copy order code"
        >
          <Copy size={20} />
        </button>
      </div>

      <Button
        onClick={() => router.push(Routes.home())}
        className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-6 rounded-lg text-lg"
      >
        RETURN TO HOMEPAGE
      </Button>
    </div>
  );
}
