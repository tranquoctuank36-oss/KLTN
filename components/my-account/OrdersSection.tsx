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
import CancelOrderDialog from "../dialog/CancelOrderDialog";
import { cancelOrder } from "@/services/orderService";

import AddToCartOrderDialog from "@/components/dialog/AddToCartOrderDialog";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/services/productService";
import { ProductVariants } from "@/types/productVariants";
import { getMyReviews } from "@/services/reviewService";
import { Review } from "@/types/review";
import CreateReviewForm from "@/components/CreateReviewForm";

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
  const [productSlugs, setProductSlugs] = useState<{ [key: string]: string }>({});
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);

  // Sync activeTab with URL params on mount and when URL changes
  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "my-orders/reviews") {
      setActiveTab("reviews");
      fetchReviews();
    } else if (section === "my-orders") {
      setActiveTab("orders");
    }
  }, [searchParams]);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const result = await getMyReviews();
      
      // Sort reviews by updatedAt or createdAt (newest first)
      const sortedReviews = (result.data || []).sort((a: Review, b: Review) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      setReviews(sortedReviews);
    
      const slugs: { [key: string]: string } = {};
      await Promise.all(
        sortedReviews.map(async (review: Review) => {
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
    } finally {
      setReviewsLoading(false);
    }
  }, []);

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
          "HOÀN TẤT": "completed",
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
        limit: itemsPerPage,
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
              <Button className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base">
                Nam
              </Button>
              <Button className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base">
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
              <Button className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base">
                Nam
              </Button>
              <Button className="w-24 h-10 border rounded-full hover:bg-gray-700 hover:text-white border-gray-500 text-gray-900 text-base">
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
      <div className="flex gap-6 mb-5 text-lg relative pb-5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gray-300">
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
          onClick={() => setActiveTab("returns")}
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
          Đánh giá
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
                "Hoàn tất",
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
                    {order.status === "completed" && "Hoàn tất"}
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
                        Hủy đơn hàng
                      </Button>
                    )}
                    {/* {(order.status === "cancelled" ||
                      order.status === "completed") && (
                      <Button
                        onClick={() => {
                          setSelectedOrderForBuy(order);
                          setBuyDialogOpen(true);
                        }}
                        variant="outline"
                        className="bg-blue-600 rounded-full text-white hover:text-white px-3 py-5 hover:bg-blue-700 transition font-semibold w-[140px]"
                      >
                        BUY AGAIN
                      </Button>
                    )} */}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      )}

      {/* Reviews tab content */}
      {activeTab === "reviews" && (
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

      {/* Lightbox Modal */}
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
