"use client";

import { forwardRef, useEffect, useState, useRef } from "react";
import {
  Loader2,
  Package,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Calendar,
  X,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { getMyOrders } from "@/services/userService";
import { useRouter } from "next/navigation";
import { Routes } from "@/lib/routes";
import CancelOrderDialog from "../dialog/CancelOrderDialog";
import { cancelOrder } from "@/services/orderService";

import AddToCartOrderDialog from "@/components/dialog/AddToCartOrderDialog";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/services/productService";
import { ProductVariants } from "@/types/productVariants";

const OrdersSection = forwardRef<HTMLDivElement>((props, ref) => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    orderCode: string;
  } | null>(null);

  const { addToCart, openDrawer } = useCart();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedOrderForBuy, setSelectedOrderForBuy] = useState<Order | null>(
    null
  );
  const [buyAgainLoading, setBuyAgainLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchSearch = searchTerm
      ? order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchStatus =
      selectedStatus === "All Status"
        ? true
        : order.status?.toUpperCase() ===
          selectedStatus.toUpperCase().replace(/\s+/g, "_");

    const orderDate = order.createdAt ? new Date(order.createdAt) : null;
    const matchDate =
      (!startDate || (orderDate && orderDate >= new Date(startDate))) &&
      (!endDate || (orderDate && orderDate <= new Date(endDate)));

    return matchSearch && matchStatus && matchDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);

    setTimeout(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleCancelOrder = async (reason: string) => {
    if (!selectedOrder?.id) return;

    try {
      await cancelOrder(String(selectedOrder.id), reason);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                status: "CANCELLED",
                cancelReason: reason,
              }
            : order
        )
      );
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
          const selectedVariant = product?.variants?.find(
            (v: ProductVariants) => String(v.id) === String(variantId)
          );
          if (!product || !selectedVariant) return;

          addToCart(
            { product, selectedVariant, quantity: item.quantity ?? 1 } as any,
            { autoOpenDrawer: false }
          );
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
  if (loading) {
    return (
      <div
        ref={ref}
        className="flex flex-col justify-center items-center h-[250px] text-gray-500"
      >
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        ref={ref}
        className="bg-white rounded-lg p-6 shadow-sm scroll-mt-[var(--header-h)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-6 w-6 text-gray-600" />
          <h3 className="text-2xl font-semibold">My Orders</h3>
        </div>
        <p className="text-gray-700 mb-6 text-center">
          You currently have no orders. Find your perfect pair from over 6000
          styles below
        </p>
        <div className="grid grid-cols-2 mt-4">
          <div className="text-center border-r border-gray-500 pr-4">
            <Image
              src="/eyeglasses.jpg"
              alt="Eyeglasses"
              width={80}
              height={40}
              className="mx-auto mb-3"
            />
            <p className="font-normal mb-5">Browse Eyeglasses</p>
            <div className="flex justify-center gap-3">
              <Button className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base">
                Men
              </Button>
              <Button className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base">
                Women
              </Button>
            </div>
          </div>

          <div className="text-center pl-4">
            <Image
              src="/sunglasses.jpg"
              alt="Sunglasses"
              width={80}
              height={40}
              className="mx-auto mb-3"
            />
            <p className="mb-5">Browse Sunglasses</p>
            <div className="flex justify-center gap-3">
              <Button className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base">
                Men
              </Button>
              <Button className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base">
                Women
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Có đơn hàng
  return (
    <div
      ref={ref}
      className="bg-white rounded-lg p-6 shadow-sm scroll-mt-[var(--header-h)]"
    >
      {/* Tiêu đề */}
      <div className="flex items-center gap-3 mb-4">
        <Package className="h-6 w-6 text-gray-600" />
        <h3 className="text-2xl font-semibold">My Orders</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-5 text-lg relative pb-5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gray-300">
        <button className="font-semibold border-b-2 border-black pb-2">
          Orders
        </button>
        <button className="text-gray-500 hover:text-black">Returns</button>
        <button className="text-gray-500 hover:text-black">Exchanges</button>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center border border-gray-300 hover:border-gray-800 rounded-md px-3 py-3 flex-1 h-[50px]">
          <Search className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search for order code"
            className="outline-none flex-1 text-gray-700 placeholder-gray-400 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dropdown trạng thái */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between gap-2 border border-gray-300 hover:border-gray-800 rounded-md px-3 py-3 text-lg w-[200px] h-[50px] cursor-pointer"
          >
            <span className="truncate text-base">{selectedStatus}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {isOpen && (
            <div className="absolute left-0 mt-2 w-[180px] bg-white border border-gray-200 rounded-md shadow-lg z-20">
              {[
                "All Status",
                "PENDING",
                "PENDING PAYMENT",
                "PAID",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "COMPLETED",
                "CANCELLED",
                "REFUNDED",
              ].map((status) => (
                <div
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    selectedStatus === status ? "bg-gray-200 font-medium" : ""
                  }`}
                >
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bộ chọn ngày */}
        <div className="flex items-center border border-gray-300 hover:border-gray-800 rounded-md px-3 py-2 text-gray-500 text-base h-[50px] gap-2">
          {/* Start Date */}
          <div className="flex items-center flex-1 relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="outline-none bg-transparent w-full text-gray-700 pr-5"
              style={{
                colorScheme: "light",
              }}
            />
            {startDate ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setStartDate("");
                  setEndDate("");
                }}
                className="absolute right-0 text-gray-400 transition z-10 bg-white cursor-pointer"
                type="button"
                title="Clear dates"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Calendar className="absolute right-0 h-4 w-4 text-gray-400 pointer-events-none" />
            )}
          </div>

          <span className="text-gray-400">→</span>

          {/* End Date */}
          <div className="flex items-center flex-1 relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              max={new Date().toISOString().split("T")[0]}
              disabled={!startDate}
              className="outline-none bg-transparent w-full text-gray-700 leading-none disabled:opacity-50 disabled:cursor-not-allowed pr-5"
              style={{
                colorScheme: "light",
              }}
            />
            {endDate ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEndDate("");
                }}
                className="absolute right-0 text-gray-400 transition z-10 bg-white"
                type="button"
                title="Clear end date"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Calendar className="absolute right-0 h-4 w-4 text-gray-400 pointer-events-none cursor-pointer" />
            )}
          </div>
        </div>

        {/* CSS để ẩn calendar icon mặc định */}
        <style jsx>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            opacity: 0;
            position: absolute;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: pointer;
          }
          input[type="date"]::-webkit-datetime-edit-text,
          input[type="date"]::-webkit-datetime-edit-month-field,
          input[type="date"]::-webkit-datetime-edit-day-field,
          input[type="date"]::-webkit-datetime-edit-year-field {
            color: inherit;
          }
        `}</style>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No orders found matching your filters.</p>
        </div>
      ) : (
        <>
          {currentOrders.map((order, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-md p-4 mb-4 bg-white flex flex-col gap-4"
            >
              {/* Dòng thông tin chính */}
              <div className="flex justify-between pr-50">
                <p className="font-bold">
                  <span className="text-black">Order code: </span>
                  <span className="text-blue-600 tracking-wide ml-3">
                    {order.orderCode}
                  </span>
                </p>

                <p>
                  <span className="text-black">Order Date: </span>
                  <span className="font-semibold">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                      : "Invalid Date"}
                  </span>
                </p>

                <p className="text-black">
                  {order.items?.length || 0} items (
                  {Number(order.grandTotal || 0).toLocaleString("en-US")}đ)
                </p>
              </div>

              {/* Địa chỉ giao hàng */}
              <p className="leading-relaxed whitespace-normal break-all w-full text-black text-justify">
                <span className="mr-3">Delivery Address:</span>{" "}
                {`${order.addressLine || ""}${
                  order.wardName ? ", " + order.wardName : ""
                }${order.districtName ? ", " + order.districtName : ""}${
                  order.provinceName ? ", " + order.provinceName : ""
                }`}
              </p>

              {/* Hàng chứa trạng thái + nút */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold w-fit ${
                    order.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : order.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : order.status === "PAID"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "PROCESSING"
                      ? "bg-purple-100 text-purple-800"
                      : order.status === "SHIPPED"
                      ? "bg-indigo-100 text-indigo-800"
                      : order.status === "DELIVERED"
                      ? "bg-teal-100 text-teal-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status === "PENDING" && "PENDING"}
                  {order.status === "PAID" && "PAID"}
                  {order.status === "PROCESSING" && "PROCESSING"}
                  {order.status === "SHIPPED" && "SHIPPED"}
                  {order.status === "DELIVERED" && "DELIVERED"}
                  {order.status === "COMPLETED" && "COMPLETED"}
                  {order.status === "CANCELLED" && "CANCELLED"}
                  {![
                    "PENDING",
                    "PAID",
                    "PROCESSING",
                    "SHIPPED",
                    "DELIVERED",
                    "COMPLETED",
                    "CANCELLED",
                  ].includes(order.status || "") && order.status}
                </span>

                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => {
                      localStorage.setItem(
                        "selectedOrder",
                        JSON.stringify(order)
                      );
                      router.push(Routes.orderDetail(String(order.orderCode)));
                    }}
                    variant="outline"
                    className="border-blue-500 rounded-full text-blue-600 px-3 py-5 hover:bg-white hover:text-blue-800 hover:border-blue-800 transition font-semibold w-[140px]"
                  >
                    VIEW DETAILS
                  </Button>
                  {order.status === "PENDING" || order.status === "PAID" ? (
                    <Button
                      onClick={() => {
                        setSelectedOrder({
                          id: String(order.id),
                          orderCode: order.orderCode ?? "",
                        });
                        setCancelDialogOpen(true);
                      }}
                      className="bg-red-600 rounded-full text-white px-3 py-5 hover:bg-red-800 transition font-semibold w-[140px]"
                    >
                      CANCEL ORDER
                    </Button>
                  ) : order.status === "CANCELLED" ? (
                    <Button
                      disabled
                      className="bg-red-300 text-red-800 rounded-full px-3 py-5 font-semibold w-[140px]"
                    >
                      CANCELLED
                    </Button>
                  ) : null}
                  {(order.status === "CANCELLED" ||
                    order.status === "COMPLETED") && (
                    <Button
                      onClick={() => {
                        setSelectedOrderForBuy(order);
                        setBuyDialogOpen(true);
                      }}
                      variant="outline"
                      className="bg-blue-600 rounded-full text-white hover:text-white px-3 py-5 hover:bg-blue-800 transition font-semibold w-[140px]"
                    >
                      BUY AGAIN
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <CancelOrderDialog
            open={cancelDialogOpen}
            onClose={() => setCancelDialogOpen(false)}
            onConfirm={handleCancelOrder}
            orderCode={selectedOrder?.orderCode || ""}
          />

          {selectedOrderForBuy && (
            <AddToCartOrderDialog
              open={buyDialogOpen}
              onOpenChange={setBuyDialogOpen}
              items={(selectedOrderForBuy.items || []).map((item: any) => ({
                id: item.id,
                productId: item.productId ?? "",
                imageUrl: item.imageUrl ?? "/placeholder.png",
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

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`w-7 h-7 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                  currentPage === 1
                    ? "text-blue-300 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-800 cursor-pointer"
                }`}
                title="First page"
              >
                <ChevronsLeft className="!h-4 !w-4" />
              </button>

              {/* Prev */}
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`w-6 h-6 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                  currentPage === 1
                    ? "text-blue-300 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-800 cursor-pointer"
                }`}
                title="Previous page"
              >
                <ChevronLeft className="!h-4 !w-4" />
              </button>

              {(() => {
                const pages = [];
                const maxVisible = 4;

                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                          currentPage === i
                            ? "bg-blue-600 text-white font-semibold"
                            : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                } else {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        currentPage === 1
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                      }`}
                    >
                      1
                    </button>
                  );

                  if (currentPage > 1 && currentPage < totalPages) {
                    if (currentPage > 2) {
                      pages.push(
                        <span
                          key="ellipsis-start"
                          className="text-gray-400 px-1"
                        >
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={currentPage}
                        onClick={() => handlePageChange(currentPage)}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 text-white font-semibold transition"
                      >
                        {currentPage}
                      </button>
                    );

                    if (currentPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis-end" className="text-gray-400 px-1">
                          ...
                        </span>
                      );
                    }
                  } else if (currentPage === 1) {
                    if (totalPages > 2) {
                      pages.push(
                        <button
                          key={2}
                          onClick={() => handlePageChange(2)}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-100 cursor-pointer transition"
                        >
                          2
                        </button>
                      );
                    }

                    if (totalPages > 3) {
                      pages.push(
                        <span key="ellipsis" className="text-gray-400 px-1">
                          ...
                        </span>
                      );
                    }
                  } else if (currentPage === totalPages) {
                    if (totalPages > 3) {
                      pages.push(
                        <span key="ellipsis" className="text-gray-400 px-1">
                          ...
                        </span>
                      );
                    }

                    if (totalPages > 2) {
                      pages.push(
                        <button
                          key={totalPages - 1}
                          onClick={() => handlePageChange(totalPages - 1)}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-100 cursor-pointer transition"
                        >
                          {totalPages - 1}
                        </button>
                      );
                    }
                  }

                  if (totalPages > 1) {
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                          currentPage === totalPages
                            ? "bg-blue-600 text-white font-semibold"
                            : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                        }`}
                      >
                        {totalPages}
                      </button>
                    );
                  }
                }

                return pages;
              })()}

              {/* Next */}
              <button
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`w-6 h-6 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                  currentPage === totalPages
                    ? "text-blue-300 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-800 cursor-pointer"
                }`}
                title="Next page"
              >
                <ChevronRight className="!h-4 !w-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`w-7 h-7 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                  currentPage === totalPages
                    ? "text-blue-300 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-800 cursor-pointer"
                }`}
                title="Last page"
              >
                <ChevronsRight className="!h-4 !w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
});

OrdersSection.displayName = "OrdersSection";
export default OrdersSection;
