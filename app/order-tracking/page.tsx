"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Routes } from "@/lib/routes";
import { getOrderByCode } from "@/services/orderService";
import LoginDialog from "@/components/dialog/LoginDialog";
import FloatingInput from "@/components/FloatingInput";
import { useRouter } from "next/navigation";

const MIN_LOADING_TIME = 600;

export default function OrderTrackingPage() {
  const [orderCode, setOrderCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const router = useRouter();

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    router.push(`${Routes.users()}?section=my-orders`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const startTime = Date.now();
    let orderFound = false;
    let errorMsg: string | null = null;

    try {
      const orderData = await getOrderByCode(orderCode.trim());
      console.log("📦 Full API Response:", orderData);
      if (orderData) {
        orderFound = true;
      } else {
        errorMsg = "Incorrect Order ID";
      }
    } catch (err: any) {
      console.log("❌ API Error:", err);

      if (err?.response?.status === 404) {
        errorMsg = "Mã đơn hàng không tồn tại.";
      } else {
        errorMsg = "Có lỗi xảy ra. Vui lòng thử lại.";
      }
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setLoading(false);

      if (errorMsg) {
        setError(errorMsg);
      } else if (orderFound) {
        router.push(Routes.orderTrackingDetail(orderCode.trim()));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-30">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">THEO DÕI ĐƠN HÀNG</h1>
          <p className="text-black">
            Theo dõi đơn hàng của bạn dễ dàng chỉ với mã đơn hàng
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <FloatingInput
              id="orderCode"
              label="Mã ĐƠn Hàng"
              type="text"
              placeholder=""
              required
              value={orderCode}
              onChange={(val) => {
                setOrderCode(val);
                setError(null);
              }}
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-[150px] bg-blue-600 hover:bg-blue-800 text-white h-12 text-base font-semibold flex items-center justify-center mx-auto"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="!w-6 !h-6 animate-spin" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  <span>TÌM KIẾM</span>
                </div>
              )}
            </Button>

            {!loading && error && (
              <p className="text-red-600 text-sm flex items-center justify-center">
                {error}
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Hoặc{" "}
              <button
                onClick={() => setLoginOpen(true)}
                className="text-blue-600 font-semibold underline hover:no-underline cursor-pointer"
              >
                Đăng Nhập
              </button>{" "}
              để theo dõi nhanh hơn.
            </p>
          </div>
        </div>
      </div>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
