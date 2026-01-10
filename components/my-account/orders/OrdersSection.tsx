"use client";

import { forwardRef, useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import OrdersTab from "./OrdersTab";
import ReturnsTab from "./ReturnsTab";
import ReviewsTab from "./ReviewsTab";

const OrdersSection = forwardRef<HTMLDivElement>((props, ref) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"orders" | "returns" | "reviews">("orders");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "my-orders/reviews") {
      setActiveTab("reviews");
    } else if (section === "my-orders/returns") {
      setActiveTab("returns");
    } else if (section === "my-orders") {
      setActiveTab("orders");
    }
    setInitialLoading(false);
  }, [searchParams]);

  if (initialLoading) {
    return (
      <div
        ref={ref}
        className="flex flex-col justify-center items-center h-[250px] text-gray-500"
      >
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="bg-white rounded-lg p-6 shadow-sm scroll-mt-[var(--header-h)]"
    >
      {/* Tiêu đề */}
      <div className="flex items-center gap-3 mb-4">
        <Package className="h-6 w-6 text-gray-600" />
        <h3 className="text-2xl font-semibold">Đơn hàng của tôi</h3>
      </div>

      <div className="flex gap-6 mb-5 text-lg relative pb-2">
        <button
          onClick={() => {
            setActiveTab("orders");
            router.push("/users?section=my-orders");
          }}
          className={`pb-2 cursor-pointer transition ${
            activeTab === "orders"
              ? "font-semibold border-b-2 border-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Tất cả đơn hàng
        </button>
        <button
          onClick={() => {
            setActiveTab("returns");
            router.push("/users?section=my-orders/returns");
          }}
          className={`pb-2 cursor-pointer transition ${
            activeTab === "returns"
              ? "font-semibold border-b-2 border-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Trả hàng
        </button>
        <button
          onClick={() => {
            setActiveTab("reviews");
            router.push("/users?section=my-orders/reviews");
          }}
          className={`pb-2 cursor-pointer transition ${
            activeTab === "reviews"
              ? "font-semibold border-b-2 border-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Đã đánh giá
        </button>
      </div>

      {activeTab === "orders" && <OrdersTab containerRef={ref as React.RefObject<HTMLDivElement>} />}
      {activeTab === "returns" && <ReturnsTab containerRef={ref as React.RefObject<HTMLDivElement>} />}
      {activeTab === "reviews" && <ReviewsTab containerRef={ref as React.RefObject<HTMLDivElement>} />}
    </div>
  );
});

OrdersSection.displayName = "OrdersSection";
export default OrdersSection;
