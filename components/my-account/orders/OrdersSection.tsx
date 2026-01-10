"use client";

import { forwardRef, useEffect, useState, useRef, useCallback } from "react";
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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { getMyOrders } from "@/services/orderService";
import { useRouter, useSearchParams } from "next/navigation";
import { Routes } from "@/lib/routes";
import CancelOrderDialog from "../../dialog/CancelOrderDialog";
import ConfirmPopover from "../../ui-common/ConfirmPopover";
import { cancelOrder } from "@/services/orderService";

import AddToCartOrderDialog from "@/components/dialog/AddToCartOrderDialog";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/services/productService";
import { ProductVariants } from "@/types/productVariants";
import { getMyReviews } from "@/services/reviewService";
import { Review } from "@/types/review";
import CreateReviewForm from "@/components/review/CreateReviewForm";
import { getMyReturns, cancelReturnRequest } from "@/services/returnService";
import { ReturnRequest } from "@/types/return";

const OrdersSection = forwardRef<HTMLDivElement>((props, ref) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");

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
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [activeTab, setActiveTab] = useState<"orders" | "returns" | "reviews">("orders");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [productSlugs, setProductSlugs] = useState<{ [key: string]: string }>({});
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnsCurrentPage, setReturnsCurrentPage] = useState(1);
  const [returnsTotalPages, setReturnsTotalPages] = useState(0);
  const [returnsSearchTerm, setReturnsSearchTerm] = useState("");
  const [returnsSearchInput, setReturnsSearchInput] = useState("");
  const [returnsSelectedStatus, setReturnsSelectedStatus] = useState("Tất cả trạng thái");
  const [returnsDropdownOpen, setReturnsDropdownOpen] = useState(false);
  const returnsDropdownRef = useRef<HTMLDivElement>(null);
  const returnsSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync activeTab with URL params on mount and when URL changes
  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "my-orders/reviews") {
      setActiveTab("reviews");
      fetchReviews();
    } else if (section === "my-orders/returns") {
      setActiveTab("returns");
      fetchReturns();
    } else if (section === "my-orders") {
      setActiveTab("orders");
    }
  }, [searchParams]);

  const fetchReturns = useCallback(async () => {
    try {
      setReturnsLoading(true);
      
      let statusParam: string | undefined = undefined;
      if (returnsSelectedStatus !== "Tất cả trạng thái") {
        const statusMap: Record<string, string> = {
          "YÊU CẦU": "requested",
          "ĐÃ DUYỆT": "approved",
          "CHỜ HÀNG HOÀN": "waiting_item",
          "ĐÃ NHẬN": "received_at_warehouse",
          "QC PASS": "qc_pass",
          "QC FAIL": "qc_fail",
          "HOÀN THÀNH": "completed",
          "TỪ CHỐI": "rejected",
          "ĐÃ HỦY": "canceled",
        };
        statusParam = statusMap[returnsSelectedStatus.toUpperCase()];
      }
      
      const result = await getMyReturns({
        search: returnsSearchTerm || undefined,
        page: returnsCurrentPage,
        limit: 10,
        status: statusParam,
      });
      
      setReturns(result.data || []);
      setReturnsTotalPages(result.meta.totalPages);
    } catch (err) {
      console.error("❌ Failed to fetch returns:", err);
      setReturns([]);
      setReturnsTotalPages(0);
    } finally {
      setReturnsLoading(false);
    }
  }, [returnsSearchTerm, returnsCurrentPage, returnsSelectedStatus]);

  useEffect(() => {
    if (activeTab === "returns") {
      fetchReturns();
    }
  }, [activeTab, fetchReturns]);

  // Debounce returns search
  useEffect(() => {
    if (returnsSearchTimeoutRef.current) {
      clearTimeout(returnsSearchTimeoutRef.current);
    }
    returnsSearchTimeoutRef.current = setTimeout(() => {
      setReturnsSearchTerm(returnsSearchInput);
      setReturnsCurrentPage(1);
    }, 500);
    return () => {
      if (returnsSearchTimeoutRef.current) {
        clearTimeout(returnsSearchTimeoutRef.current);
      }
    };
  }, [returnsSearchInput]);

  // Click outside for returns dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (returnsDropdownRef.current && !returnsDropdownRef.current.contains(e.target as Node)) {
        setReturnsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const result = await getMyReviews({
        page: reviewsCurrentPage,
        limit: 10,
      });
      
      setReviews(result.data || []);
      setReviewsTotalPages(result.meta?.totalPages || 0);
    
      const slugs: { [key: string]: string } = {};
      await Promise.all(
        (result.data || []).map(async (review: Review) => {
          if (review.orderItem?.productId) {
            try {
              const product = await getProductById(review.orderItem.productId);
              if (product?.slug) {
                slugs[review.orderItem.productId] = product.slug;
              }
            } catch (err) {
              console.error("Error fetching product slug:", err);
            }
          }
        })
      );
      setProductSlugs(slugs);
    } catch (err) {
      console.error("❌ Failed to fetch reviews:", err);
      setReviews([]);
      setReviewsTotalPages(0);
    } finally {
      setReviewsLoading(false);
    }
  }, [reviewsCurrentPage]);

  // Fetch reviews when page changes
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, fetchReviews]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      let statusParam: string | undefined = undefined;
      if (selectedStatus !== "Tất cả trạng thái") {
        // Convert display status to API format
        const statusMap: Record<string, string> = {
          "CHỜ XÁC NHẬN": "pending",
          "ĐANG XỬ LÝ": "processing",
          "ĐANG GIAO": "shipping",
          "ĐÃ GIAO": "delivered",
          "HOÀN THÀNH": "completed",
          "ĐÃ HỦY": "cancelled",
          "YÊU CẦU TRẢ HÀNG": "return_requested",
          "ĐANG TRẢ HÀNG": "returning",
          "ĐÃ TRẢ HÀNG": "returned",
        };
        statusParam = statusMap[selectedStatus.toUpperCase()];
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

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1); // Reset to page 1 when searching
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

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

  const currentOrders = orders;

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

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to page 1 when filter changes
    setIsOpen(false);
  };

  const handleCancelOrder = async (reason: string) => {
    if (!selectedOrder?.id) return;

    try {
      await cancelOrder(String(selectedOrder.id), reason);

      // Refetch orders to get updated list
      await fetchOrders();
      
      setCancelDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
  };

  const handleCancelReturn = async (returnId: string) => {
    try {
      await cancelReturnRequest(returnId);
      // Refetch returns to get updated list
      await fetchReturns();
    } catch (err) {
      console.error("Failed to cancel return request:", err);
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
  // Show initial loading state only on first load
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!loading && initialLoading) {
      setInitialLoading(false);
    }
  }, [loading, initialLoading]);

  if (initialLoading && loading) {
    return (
      <div
        ref={ref}
        className="flex flex-col justify-center items-center h-[250px] text-gray-500"
      >
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
      </div>
    );
  }

  // Only show empty state when no orders AND no active filters/search
  const hasActiveFilters = searchTerm !== "" || selectedStatus !== "Tất cả trạng thái";
  
  if (orders.length === 0 && !loading && !hasActiveFilters) {
    return (
      <div
        ref={ref}
        className="bg-white rounded-lg p-6 shadow-sm scroll-mt-[var(--header-h)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-6 w-6 text-gray-600" />
          <h3 className="text-2xl font-semibold">Đơn hàng của tôi</h3>
        </div>
        <p className="text-gray-700 mb-6 text-center">
          Bạn hiện tại không có đơn hàng nào. Tìm kiếm cặp kính hoàn hảo của bạn từ hơn 6000 kiểu dáng dưới đây
        </p>
        <div className="grid grid-cols-2 mt-4">
          <div className="text-center border-r border-gray-500 pr-4">
            <Image
              src="/eyeglasses.jpg"
              alt="Gọng kính"
              width={80}
              height={40}
              className="mx-auto mb-3"
            />
            <p className="font-normal mb-5">Xem Gọng kính</p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => router.push("/products?productTypes=gong-kinh&genders=nam")}
                className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base"
              >
                Nam
              </Button>
              <Button
                onClick={() => router.push("/products?productTypes=gong-kinh&genders=nu")}
                className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base"
              >
                Nữ
              </Button>
            </div>
          </div>

          <div className="text-center pl-4">
            <Image
              src="/sunglasses.jpg"
              alt="Kính mát"
              width={80}
              height={40}
              className="mx-auto mb-3"
            />
            <p className="mb-5">Xem Kính mát</p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => router.push("/products?productTypes=kinh-mat&genders=nam")}
                className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base"
              >
                Nam
              </Button>
              <Button
                onClick={() => router.push("/products?productTypes=kinh-mat&genders=nu")}
                className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base"
              >
                Nữ
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
        <h3 className="text-2xl font-semibold">Đơn hàng của tôi</h3>
      </div>

      {/* Tabs */}
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
            fetchReturns();
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
            fetchReviews();
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

      {/* Bộ lọc - Only show for orders tab */}
      {activeTab === "orders" && (
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
            <div className="absolute left-0 mt-2 w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-[400px] overflow-y-auto">
              {[
                "Tất cả trạng thái",
                "Chờ xác nhận",
                "Đang xử lý",
                "Đang giao",
                "Đã giao",
                "Hoàn thành",
                "Đã hủy",
                "Yêu cầu trả hàng",
                "Đang trả hàng",
                "Đã trả hàng",
              ].map((status) => (
                <div
                  key={status}
                  onClick={() => handleStatusChange(status)}
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
      </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "orders" && (
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
            {currentOrders.map((order, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-md p-4 mb-4 bg-white flex flex-col gap-4"
              >
                {/* Dòng thông tin chính */}
                <div className="flex justify-between pr-50">
                  <p className="font-bold">
                    <span className="text-black">Mã đơn hàng: </span>
                    <span className="text-blue-600 tracking-wide ml-3">
                      {order.orderCode}
                    </span>
                  </p>

                  <p>
                    <span className="text-black">Ngày đặt đơn: </span>
                    <span className="font-semibold">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                        : "Ngày không xác định"}
                    </span>
                  </p>

                  <p className="text-black">
                    {order.items?.length || 0} sản phẩm (
                    {Number(order.grandTotal || 0).toLocaleString("en-US")}đ)
                  </p>
                </div>

                {/* Địa chỉ giao hàng */}
                <p className="leading-relaxed whitespace-normal break-all w-full text-black text-justify">
                  <span className="mr-3">Địa chỉ giao hàng:</span>{" "}
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
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : order.status === "processing"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "shipping"
                        ? "bg-indigo-100 text-indigo-800"
                        : order.status === "delivered"
                        ? "bg-teal-100 text-teal-800"
                        : order.status === "return_requested" || order.status === "returning" || order.status === "returned"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status === "pending" && "Chờ xác nhận"}
                    {order.status === "processing" && "Đang xử lý"}
                    {order.status === "shipping" && "Đang giao"}
                    {order.status === "delivered" && "Đã giao"}
                    {order.status === "completed" && "Hoàn thành"}
                    {order.status === "cancelled" && "Đã hủy"}
                    {order.status === "return_requested" && "Yêu cầu trả hàng"}
                    {order.status === "returning" && "Đang trả hàng"}
                    {order.status === "returned" && "Đã trả hàng"}
                    {![
                      "pending",
                      "processing",
                      "shipping",
                      "delivered",
                      "completed",
                      "cancelled",
                      "return_requested",
                      "returning",
                      "returned",
                    ].includes(order.status || "") && order.status}
                  </span>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        localStorage.setItem(
                          "selectedOrder",
                          JSON.stringify(order)
                        );
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
                          setSelectedOrder({
                            id: String(order.id),
                            orderCode: order.orderCode ?? "",
                          });
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
      )}

      {/* Returns tab content */}
      {activeTab === "returns" && (
        <>
          {/* Bộ lọc cho returns */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center border border-gray-300 hover:border-gray-800 rounded-md px-3 py-3 flex-1 h-[50px]">
              <Search className="h-5 w-5 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã trả hàng"
                className="outline-none flex-1 text-gray-700 placeholder-gray-400 text-base"
                value={returnsSearchInput}
                onChange={(e) => setReturnsSearchInput(e.target.value)}
              />
            </div>

            {/* Dropdown trạng thái cho returns */}
            <div className="relative" ref={returnsDropdownRef}>
              <button
                onClick={() => setReturnsDropdownOpen(!returnsDropdownOpen)}
                className="flex items-center justify-between gap-2 border border-gray-300 hover:border-gray-800 rounded-md px-3 py-3 text-lg w-[200px] h-[50px] cursor-pointer"
              >
                <span className="truncate text-base">{returnsSelectedStatus}</span>
                {returnsDropdownOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </button>

              {returnsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-[400px] overflow-y-auto">
                  {[
                    "Tất cả trạng thái",
                    "Yêu cầu",
                    "Đã duyệt",
                    "Chờ hàng hoàn",
                    "Đã nhận",
                    "QC Pass",
                    "QC Fail",
                    "Hoàn thành",
                    "Từ chối",
                    "Đã hủy",
                  ].map((status) => (
                    <div
                      key={status}
                      onClick={() => {
                        setReturnsSelectedStatus(status);
                        setReturnsCurrentPage(1);
                        setReturnsDropdownOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        returnsSelectedStatus === status ? "bg-gray-200 font-medium" : ""
                      }`}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        <div className="relative min-h-[200px]">
          {returnsLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          
          {returns.length === 0 && !returnsLoading ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">Bạn chưa có yêu cầu trả hàng nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((returnRequest) => (
                <div
                  key={returnRequest.id}
                  className="border border-gray-300 rounded-md p-6 bg-white"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        <span className="text-gray-800">Mã trả hàng: </span>
                        <Link
                          href={Routes.orderDetail(returnRequest.orderId)}
                          className="text-orange-600 uppercase hover:underline cursor-pointer"
                        >
                          {returnRequest.returnCode}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Mã đơn hàng: </span>
                        <Link
                          href={Routes.orderDetail(returnRequest.orderId)}
                          className="text-blue-600 hover:underline"
                        >
                          {returnRequest.orderCode}
                        </Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ngày tạo: {new Date(returnRequest.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                          returnRequest.status === "requested"
                            ? "bg-yellow-100 text-yellow-800"
                            : returnRequest.status === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : returnRequest.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : returnRequest.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : returnRequest.status === "waiting_item"
                            ? "bg-orange-100 text-orange-800"
                            : returnRequest.status === "received_at_warehouse"
                            ? "bg-teal-100 text-teal-800"
                            : returnRequest.status === "qc_pass"
                            ? "bg-emerald-100 text-emerald-800"
                            : returnRequest.status === "qc_fail"
                            ? "bg-rose-100 text-rose-800"
                            : returnRequest.status === "canceled"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {returnRequest.status === "requested" && "Yêu cầu"}
                        {returnRequest.status === "approved" && "Đã duyệt"}
                        {returnRequest.status === "waiting_item" && "Chờ hàng hoàn"}
                        {returnRequest.status === "received_at_warehouse" && "Đã nhận"}
                        {returnRequest.status === "qc_pass" && "QC Pass"}
                        {returnRequest.status === "qc_fail" && "QC Fail"}
                        {returnRequest.status === "completed" && "Hoàn thành"}
                        {returnRequest.status === "rejected" && "Từ chối"}
                        {returnRequest.status === "canceled" && "Đã hủy"}
                        {![
                          "requested",
                          "approved",
                          "waiting_item",
                          "received_at_warehouse",
                          "qc_pass",
                          "qc_fail",
                          "completed",
                          "rejected",
                          "canceled",
                        ].includes(returnRequest.status || "") && returnRequest.status}
                      </span>
                      {/* Cancel Button - Only show for requested or approved status */}
                      {(returnRequest.status === "requested" || returnRequest.status === "approved") && (
                        <ConfirmPopover
                          title={returnRequest.returnCode}
                          description="Bạn có chắc chắn muốn hủy yêu cầu trả hàng với mã hàng"
                          onConfirm={() => handleCancelReturn(returnRequest.id)}
                          confirmText="Xác nhận"
                          cancelText="Đóng"
                        >
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-700 hover:text-red-700 rounded-full px-4 py-2 text-sm"
                          >
                            Hủy yêu cầu
                          </Button>
                        </ConfirmPopover>
                      )}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-4">
                    <p className="font-semibold text-gray-800 mb-1">Lý do trả hàng:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {returnRequest.reason}
                    </p>
                  </div>

                  {/* Customer Note */}
                  {returnRequest.customerNote && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-800 mb-1">Ghi chú:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {returnRequest.customerNote}
                      </p>
                    </div>
                  )}

                  {/* Refund Amount */}
                  {returnRequest.calculatedRefundAmount && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-800">
                        Số tiền hoàn:{" "}
                        <span className="text-green-600 text-lg">
                          {Number(returnRequest.calculatedRefundAmount).toLocaleString("en-US")}đ
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Images */}
                  {returnRequest.images && returnRequest.images.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-800 mb-2">Hình ảnh đính kèm:</p>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {returnRequest.images.map((image) => (
                          <div
                            key={image.id}
                            className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition"
                            onClick={() =>
                              setLightboxImage({
                                url: image.publicUrl,
                                alt: image.altText || "Ảnh trả hàng",
                              })
                            }
                          >
                            <Image
                              src={image.publicUrl}
                              alt={image.altText || "Ảnh trả hàng"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rejected Reason */}
                  {returnRequest.status === "rejected" && returnRequest.rejectedReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="font-semibold text-red-900 mb-1">Lý do từ chối:</p>
                      <p className="text-sm text-red-800">{returnRequest.rejectedReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {returnsTotalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => {
                setReturnsCurrentPage(1);
                setTimeout(() => {
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              disabled={returnsCurrentPage === 1}
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                returnsCurrentPage === 1 ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
              }`}
              title="Trang Đầu"
            >
              <ChevronsLeft className="!h-4 !w-4" />
            </button>

            <button
              onClick={() => {
                const newPage = Math.max(returnsCurrentPage - 1, 1);
                setReturnsCurrentPage(newPage);
                setTimeout(() => {
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              disabled={returnsCurrentPage === 1}
              className={`w-6 h-6 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                returnsCurrentPage === 1 ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
              }`}
              title="Trang Trước"
            >
              <ChevronLeft className="!h-4 !w-4" />
            </button>

            {(() => {
              const pages = [];
              const maxVisible = 4;

              if (returnsTotalPages <= maxVisible) {
                for (let i = 1; i <= returnsTotalPages; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => {
                        setReturnsCurrentPage(i);
                        setTimeout(() => {
                          if (ref && typeof ref !== "function" && ref.current) {
                            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }, 100);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        returnsCurrentPage === i ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
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
                    onClick={() => {
                      setReturnsCurrentPage(1);
                      setTimeout(() => {
                        if (ref && typeof ref !== "function" && ref.current) {
                          ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                      returnsCurrentPage === 1 ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                    }`}
                  >
                    1
                  </button>
                );

                if (returnsCurrentPage > 2) {
                  pages.push(<span key="ellipsis-start" className="text-gray-400 px-1">...</span>);
                }

                if (returnsCurrentPage > 1 && returnsCurrentPage < returnsTotalPages) {
                  pages.push(
                    <button
                      key={returnsCurrentPage}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 text-white font-semibold transition"
                    >
                      {returnsCurrentPage}
                    </button>
                  );
                }

                if (returnsCurrentPage < returnsTotalPages - 1) {
                  pages.push(<span key="ellipsis-end" className="text-gray-400 px-1">...</span>);
                }

                if (returnsTotalPages > 1) {
                  pages.push(
                    <button
                      key={returnsTotalPages}
                      onClick={() => {
                        setReturnsCurrentPage(returnsTotalPages);
                        setTimeout(() => {
                          if (ref && typeof ref !== "function" && ref.current) {
                            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }, 100);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        returnsCurrentPage === returnsTotalPages ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                      }`}
                    >
                      {returnsTotalPages}
                    </button>
                  );
                }
              }

              return pages;
            })()}

            <button
              onClick={() => {
                const newPage = Math.min(returnsCurrentPage + 1, returnsTotalPages);
                setReturnsCurrentPage(newPage);
                setTimeout(() => {
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              disabled={returnsCurrentPage === returnsTotalPages}
              className={`w-6 h-6 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                returnsCurrentPage === returnsTotalPages ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
              }`}
              title="Trang Tiếp Theo"
            >
              <ChevronRight className="!h-4 !w-4" />
            </button>

            <button
              onClick={() => {
                setReturnsCurrentPage(returnsTotalPages);
                setTimeout(() => {
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              disabled={returnsCurrentPage === returnsTotalPages}
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                returnsCurrentPage === returnsTotalPages ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
              }`}
              title="Trang Cuối"
            >
              <ChevronsRight className="!h-4 !w-4" />
            </button>
          </div>
        )}
        </>
      )}

      {/* Reviews tab content */}
      {activeTab === "reviews" && (
        <>
        <div className="relative min-h-[200px]">
          {reviewsLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          
          {reviews.length === 0 && !reviewsLoading ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">Bạn chưa có đánh giá nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id}>
                  <div
                    className="border border-gray-300 rounded-md p-6 bg-white flex flex-col gap-4"
                  >
                    {/* Header: Avatar + Name + Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                          {review.nameDisplay?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">  
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-base">{review.nameDisplay}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-base ${
                                    i < review.rating ? "text-yellow-500" : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(review.updatedAt || review.createdAt).toLocaleString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit"
                            })} 
                            {/* | Màu: {review.orderItem?.colors || "N/A"} */}
                          </p>
                        </div>
                      </div>
                      
                      {/* Update Review Link - Top Right */}
                      <span
                        onClick={() => setEditingReviewId(prev => prev === review.id ? null : review.id)}
                        className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition font-semibold text-sm whitespace-nowrap"
                      >
                        Cập nhật
                      </span>
                    </div>

                    {/* Review Content */}
                    <div className="pl-13">
                      <p className="text-gray-800 text-sm leading-relaxed mb-3">
                        {review.comment || ""}
                      </p>

                      {/* Review Image */}
                      {review.image?.publicUrl && (
                        <div className="mt-3 mb-3">
                          <Image
                            src={review.image.publicUrl}
                            alt="Ảnh Đánh Giá"
                            width={120}
                            height={120}
                            className="rounded-md object-cover border cursor-pointer hover:opacity-80 transition"
                            onClick={() => setLightboxImage({ url: review.image!.publicUrl, alt: "Ảnh Đánh Giá" })}
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      {review.orderItem && (
                        <Link
                          href={
                            productSlugs[review.orderItem.productId] && review.orderItem.productVariantId
                              ? Routes.product(productSlugs[review.orderItem.productId], review.orderItem.productVariantId)
                              : productSlugs[review.orderItem.productId]
                              ? Routes.product(productSlugs[review.orderItem.productId])
                              : "#"
                          }
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-md mt-3 hover:bg-gray-100 transition cursor-pointer"
                        >
                          {review.orderItem.thumbnailUrl && (
                            <div className="w-16 h-16 rounded bg-white flex items-center justify-center flex-shrink-0 border">
                              <Image
                                src={review.orderItem.thumbnailUrl}
                                alt={review.orderItem.productName || "Sản Phẩm"}
                                width={60}
                                height={60}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1 text-xs text-gray-600">
                            <p className="font-medium text-sm text-gray-800">
                              {review.orderItem.productName}
                            </p>
                            <p className="mt-1">Màu sắc: {review.orderItem.colors}</p>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Edit Review Form */}
                  {editingReviewId === review.id && review.orderItem && (
                    <div className="mt-4 mb-4">
                      <CreateReviewForm
                        orderItem={{
                          id: review.orderItem.id,
                          productName: review.orderItem.productName,
                          thumbnailUrl: review.orderItem.thumbnailUrl,
                          colors: review.orderItem.colors,
                        }}
                        existingReview={review}
                        onSuccess={async () => {
                          await fetchReviews();
                          setEditingReviewId(null);
                        }}
                        onCancel={() => {
                          setEditingReviewId(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination for reviews */}
        {reviewsTotalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => {
                setReviewsCurrentPage(1);
                setTimeout(() => {
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              disabled={reviewsCurrentPage === 1}
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                reviewsCurrentPage === 1 ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
              }`}
              title="Trang Đầu"
            >
              <ChevronsLeft className="!h-4 !w-4" />
            </button>

            <button
              onClick={() => {
                const newPage = Math.max(reviewsCurrentPage - 1, 1);
                setReviewsCurrentPage(newPage);
                setTimeout(() => {
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              disabled={reviewsCurrentPage === 1}
              className={`w-6 h-6 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                reviewsCurrentPage === 1 ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
              }`}
              title="Trang Trước"
            >
              <ChevronLeft className="!h-4 !w-4" />
            </button>

            {(() => {
              const pages = [];
              const maxVisible = 4;

              if (reviewsTotalPages <= maxVisible) {
                for (let i = 1; i <= reviewsTotalPages; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => {
                        setReviewsCurrentPage(i);
                        setTimeout(() => {
                          if (ref && typeof ref !== "function" && ref.current) {
                            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }, 100);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        reviewsCurrentPage === i ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
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
                    onClick={() => {
                      setReviewsCurrentPage(1);
                      setTimeout(() => {
                        if (ref && typeof ref !== "function" && ref.current) {
                          ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                      reviewsCurrentPage === 1 ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                    }`}
                  >
                    1
                  </button>
                );

                if (reviewsCurrentPage > 2) {
                  pages.push(<span key="ellipsis-start" className="text-gray-400 px-1">...</span>);
                }

                if (reviewsCurrentPage > 1 && reviewsCurrentPage < reviewsTotalPages) {
                  pages.push(
                    <button
                      key={reviewsCurrentPage}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-600 text-white font-semibold transition"
                    >
                      {reviewsCurrentPage}
                    </button>
                  );
                }

                if (reviewsCurrentPage < reviewsTotalPages - 1) {
                  pages.push(<span key="ellipsis-end" className="text-gray-400 px-1">...</span>);
                }

                if (reviewsTotalPages > 1) {
                  pages.push(
                    <button
                      key={reviewsTotalPages}
                      onClick={() => {
                        setReviewsCurrentPage(reviewsTotalPages);
                        setTimeout(() => {
                          if (ref && typeof ref !== "function" && ref.current) {
                            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }, 100);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        reviewsCurrentPage === reviewsTotalPages ? "bg-blue-600 text-white font-semibold" : "text-gray-600 hover:bg-blue-100 cursor-pointer"
                      }`}
                    >
                      {reviewsTotalPages}
                    </button>
                  );
                }
              }

              return pages;
            })()}

            <button
              onClick={() => {
                const newPage = Math.min(reviewsCurrentPage + 1, reviewsTotalPages);
                setReviewsCurrentPage(newPage);
                setTimeout(() => {
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              disabled={reviewsCurrentPage === reviewsTotalPages}
              className={`w-6 h-6 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                reviewsCurrentPage === reviewsTotalPages ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
              }`}
              title="Trang Tiếp Theo"
            >
              <ChevronRight className="!h-4 !w-4" />
            </button>

            <button
              onClick={() => {
                setReviewsCurrentPage(reviewsTotalPages);
                setTimeout(() => {
                  if (ref && typeof ref !== "function" && ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
              disabled={reviewsCurrentPage === reviewsTotalPages}
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-blue-400 hover:border-blue-800 ${
                reviewsCurrentPage === reviewsTotalPages ? "text-blue-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 cursor-pointer"
              }`}
              title="Trang Cuối"
            >
              <ChevronsRight className="!h-4 !w-4" />
            </button>
          </div>
        )}
        </>
      )}

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

      {/* Phân trang - Only show for orders tab */}
      {activeTab === "orders" && totalPages > 1 && (
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
                title="Trang Đầu"
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
                title="Trang Trước"
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
                title="Trang Tiếp Theo"
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
                title="Trang Cuối"
              >
                <ChevronsRight className="!h-4 !w-4" />
              </button>
            </div>
          )}

      {/* Fullscreen Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setLightboxImage(null)}
        >
          <Button
            className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-gray-200 transition-colors"
            onClick={() => setLightboxImage(null)}
            title="Đóng"
          >
            <X className="w-6 h-6 text-gray-800" />
          </Button>
          <div className="w-full h-full flex items-center justify-center p-8">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
});

OrdersSection.displayName = "OrdersSection";
export default OrdersSection;
