"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Routes } from "@/lib/routes";

export default function OrderSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    // đảm bảo chỉ chạy ở client
    localStorage.removeItem("checkoutSelectedItems");
    localStorage.removeItem("checkoutDiscount");
  }, []);

  const handleCopy = useCallback(() => {
    if (!orderCode) return;

    navigator.clipboard
      .writeText(orderCode)
      .then(() => toast.success("Mã đơn hàng đã được sao chép!"))
      .catch(() => toast.error("Không thể sao chép mã đơn hàng"));
  }, [orderCode]);

  if (!orderCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 text-center">
      <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Đặt Hàng Thành Công
      </h1>

      <p className="text-gray-700 max-w-lg leading-relaxed mb-8">
        Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua số{" "}
        <span className="font-semibold">1900 12 34 56</span> hoặc email{" "}
        <span className="font-semibold">cskh.glassesshop@gmail.com</span>. Bạn
        cũng có thể theo dõi đơn hàng bằng mã đơn hàng bên dưới.
      </p>

      <div className="flex items-center justify-center mb-6">
        <span className="text-gray-700 mr-2 font-medium">Mã Đơn Hàng</span>
        <span className="bg-gray-100 px-4 py-2 rounded-md font-semibold text-gray-800 text-lg">
          {orderCode}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="ml-2 text-gray-600 hover:text-black transition cursor-pointer"
          title="Sao chép mã đơn hàng"
          aria-label="Sao chép mã đơn hàng"
        >
          <Copy size={20} />
        </button>
      </div>

      <Button
        onClick={() => router.push(Routes.home())}
        className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-6 rounded-lg text-lg"
      >
        VỀ TRANG CHỦ
      </Button>
    </div>
  );
}
