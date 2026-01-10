"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { getMyOrders, cancelOrder } from "@/services/orderService";
import { useRouter } from "next/navigation";
import { Routes } from "@/lib/routes";
import CancelOrderDialog from "../../dialog/CancelOrderDialog";
import AddToCartOrderDialog from "@/components/dialog/AddToCartOrderDialog";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/services/productService";
import { ProductVariants } from "@/types/productVariants";
import Pagination from "./Pagination";
import { ORDER_STATUS_API_MAP, ORDER_STATUS_DISPLAY, ORDER_STATUS_OPTIONS, ORDER_STATUS_COLORS } from "./orderStatusMap";

interface OrdersTabProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const OrdersTab = ({ containerRef }: OrdersTabProps) => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; orderCode: string } | null>(null);
  const { addToCart, openDrawer } = useCart();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedOrderForBuy, setSelectedOrderForBuy] = useState<Order | null>(null);
  const [buyAgainLoading, setBuyAgainLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let statusParam: string | undefined = undefined;
      if (selectedStatus !== "Tất cả trạng thái") {
        statusParam = ORDER_STATUS_API_MAP[selectedStatus.toUpperCase()];
      }
      const result = await getMyOrders({
        search: searchTerm || undefined,
        page: currentPage,
        limit: 10,
        status: statusParam,
      });
      setOrders(result.data || []);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.totalItems);
    } catch (err) {
      console.error("❌ Failed to fetch orders:", err);
      setOrders([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    setIsOpen(false);
  };

  const handleCancelOrder = async (reason: string) => {
    if (!selectedOrder?.id) return;
    try {
      await cancelOrder(String(selectedOrder.id), reason);
      await fetchOrders();
      setCancelDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
  };

  const handleBuyAgain = async () => {
    if (!selectedOrderForBuy) return;
    try {
      setBuyAgainLoading(true);
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
      await Promise.all(
        (selectedOrderForBuy.items || []).map(async (item: any) => {
          if (!item.productId) return;
          const product = await getProductById(item.productId);
          const variantId = item.productVariantId;
          const selectedVariant = product?.variants?.find((v: ProductVariants) => String(v.id) === String(variantId));
          if (!product || !selectedVariant) return;
          addToCart({ product, selectedVariant, quantity: item.quantity ?? 1 } as any, { autoOpenDrawer: false });
        })
      );
      await delay(1200);
      openDrawer();
      setBuyDialogOpen(false);
      setSelectedOrderForBuy(null);
    } catch (err) {
      console.error("buy again error", err);
    } finally {
      setBuyAgainLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center border border-gray-300 hover:border-gray-800 rounded-md px-3 py-3 flex-1 h-[50px]">
          <Search className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng"
            className="outline-none flex-1 text-gray-700 placeholder-gray-400 text-base"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between gap-2 border border-gray-300 hover:border-gray-800 rounded-md px-3 py-3 text-lg w-[200px] h-[50px] cursor-pointer"
          >
            <span className="truncate text-base">{selectedStatus}</span>
            {isOpen ? <ChevronUp className="h-4 w-4 text-gray-600" /> : <ChevronDown className="h-4 w-4 text-gray-600" />}
          </button>
          {isOpen && (
            <div className="absolute left-0 mt-2 w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-[400px] overflow-y-auto">
              {ORDER_STATUS_OPTIONS.map((status) => (
                <div
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedStatus === status ? "bg-gray-200 font-medium" : ""}`}
                >
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        {orders.length === 0 && !loading ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">Không có đơn hàng nào.</p>
          </div>
        ) : (
          <>
            {orders.map((order, index) => (
              <div key={index} className="border border-gray-300 rounded-md p-4 mb-4 bg-white flex flex-col gap-4">
                <div className="flex justify-between pr-50">
                  <p className="font-bold">
                    <span className="text-black">Mã đơn hàng: </span>
                    <span className="text-blue-600 tracking-wide ml-3">{order.orderCode}</span>
                  </p>
                  <p>
                    <span className="text-black">Ngày đặt đơn: </span>
                    <span className="font-semibold">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "Ngày không xác định"}</span>
                  </p>
                  <p className="text-black">
                    {order.items?.length || 0} sản phẩm ({Number(order.grandTotal || 0).toLocaleString("en-US")}đ)
                  </p>
                </div>
                <p className="leading-relaxed whitespace-normal break-all w-full text-black text-justify">
                  <span className="mr-3">Địa chỉ giao hàng:</span>{" "}
                  {`${order.addressLine || ""}${order.wardName ? ", " + order.wardName : ""}${order.districtName ? ", " + order.districtName : ""}${order.provinceName ? ", " + order.provinceName : ""}`}
                </p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold w-fit ${
                      ORDER_STATUS_COLORS[order.status || ""] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ORDER_STATUS_DISPLAY[order.status || ""] || order.status}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        localStorage.setItem("selectedOrder", JSON.stringify(order));
                        router.push(Routes.orderDetail(String(order.id)));
                      }}
                      variant="outline"
                      className="border-blue-500 rounded-full text-blue-600 px-3 py-5 hover:bg-white hover:text-blue-800 hover:border-blue-800 transition font-semibold w-[140px]"
                    >
                      Xem chi tiết
                    </Button>
                    {order.status === "pending" && (
                      <Button
                        onClick={() => {
                          setSelectedOrder({ id: String(order.id), orderCode: order.orderCode ?? "" });
                          setCancelDialogOpen(true);
                        }}
                        className="bg-red-600 rounded-full text-white px-3 py-5 hover:bg-red-700 transition font-semibold w-[140px]"
                      >
                        Hủy đơn
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <CancelOrderDialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} onConfirm={handleCancelOrder} orderCode={selectedOrder?.orderCode || ""} />

      {selectedOrderForBuy && (
        <AddToCartOrderDialog
          open={buyDialogOpen}
          onOpenChange={setBuyDialogOpen}
          items={(selectedOrderForBuy.items || []).map((item: any) => ({
            id: item.id,
            productId: item.productId ?? "",
            imageUrl: item.thumbnailUrl ?? "/placeholder.png",
            productName: item.productName ?? "",
            sku: item.sku ?? "",
            colors: item.colors ?? "",
            size: item.size ?? "",
            quantity: item.quantity ?? 1,
            originalPrice: item.originalPrice ?? 0,
            finalPrice: item.finalPrice ?? 0,
          }))}
          onBuyAgain={handleBuyAgain}
          isLoading={buyAgainLoading}
        />
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} containerRef={containerRef} />
    </>
  );
};

export default OrdersTab;
