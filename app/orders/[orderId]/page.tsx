"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Routes } from "@/lib/routes";
import { useParams, useRouter } from "next/navigation";
import { cancelOrder, getOrderById } from "@/services/orderService";
import { getProductById } from "@/services/productService";
import { Order } from "@/types/order";
import AddToCartOrderDialog from "@/components/dialog/AddToCartOrderDialog";
import { useCart } from "@/context/CartContext";
import { ProductVariants } from "@/types/productVariants";
import CancelOrderDialog from "@/components/dialog/CancelOrderDialog";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";
import CreateReviewForm from "@/components/review/CreateReviewForm";
import { getMyReviews } from "@/services/reviewService";
import CreateReturnForm from "@/components/order/CreateReturnForm";

type OrderItemProps = {
  item: any;
  orderStatus: string;
  onReviewClick?: (item: any) => void;
  isReviewed?: boolean;
};

function OrderItem({
  item,
  orderStatus,
  onReviewClick,
  isReviewed,
}: OrderItemProps) {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSlug() {
      if (item.productId) {
        const product = await getProductById(item.productId);
        setSlug(product?.slug || null);
      }
    }
    fetchSlug();
  }, [item.productId]);

  const variantId = item.productVariantId;
  const productUrl =
    slug && variantId
      ? Routes.product(slug, variantId)
      : slug
      ? Routes.product(slug)
      : "#";

  const canAction = orderStatus === "delivered" || orderStatus === "completed";

  return (
    <div className="flex justify-between items-start pb-4 border-b last:border-b-0">
      {/* LEFT */}
      <div className="flex gap-4">
        <div className="w-25 h-25 rounded bg-gray-100 flex items-center justify-center">
          <Image
            src={item.thumbnailUrl || "/placeholder.png"}
            alt={item.productName}
            width={200}
            height={200}
            className="object-contain mix-blend-multiply"
          />
        </div>

        <div className="mt-2">
          <Link
            href={productUrl}
            className="font-medium text-lg hover:font-bold transition"
          >
            {item.productName}
          </Link>

          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">Màu sắc:</span> {item.colors}
          </p>

          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">Số lượng:</span> {item.quantity}
          </p>

          {/* ACTIONS */}
          {canAction && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {/* Review */}
              {isReviewed ? (
                <button
                  type="button"
                  onClick={() => onReviewClick?.(item)}
                  className="text-blue-600 underline hover:text-blue-800 transition font-semibold text-sm cursor-pointer"
                >
                  Cập nhật đánh giá
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onReviewClick?.(item)}
                  className="text-blue-600 underline hover:text-blue-800 transition font-semibold text-sm cursor-pointer"
                >
                  Đánh giá
                </button>
              )}


            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 mt-2">
        {item.originalPrice &&
          Number(item.originalPrice) > Number(item.finalPrice) && (
            <p className="text-gray-400 line-through text-sm">
              {Number(item.originalPrice).toLocaleString("en-US")}đ
            </p>
          )}
        <p className="font-semibold text-base text-black">
          {Number(item.finalPrice).toLocaleString("en-US")}đ
        </p>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { addToCart, openDrawer } = useCart();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [reviewedItemIds, setReviewedItemIds] = useState<Set<string>>(
    new Set()
  );
  const [reviewsData, setReviewsData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [buyAgainLoading, setBuyAgainLoading] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [showReviewFormForItemId, setShowReviewFormForItemId] = useState<
    string | null
  >(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const returnFormRef = useRef<HTMLDivElement>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);

  const scrollToFormWithOffset = (offset = 120) => {
    const element = returnFormRef.current;
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  const handleBuyAgain = async () => {
    if (!selectedOrder) return;
    try {
      setBuyAgainLoading(true);

      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

      await Promise.all(
        selectedOrder.items.map(async (item: any) => {
          if (!item.productId) return;

          const product = await getProductById(item.productId);
          const variantId = item.productVariantId;
          const selectedVariant = product?.variants?.find(
            (v: ProductVariants) => String(v.id) === String(variantId)
          );

          if (!product || !selectedVariant) return;

          addToCart(
            {
              product,
              selectedVariant,
              quantity: item.quantity ?? 1,
            } as any,
            { autoOpenDrawer: false }
          );
        })
      );

      await delay(1500);
      openDrawer();
      setDialogOpen(false);
    } catch (err) {
      console.error("buy again error", err);
    } finally {
      setBuyAgainLoading(false);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    if (!order?.id) return;
    try {
      await cancelOrder(String(order.id), reason);

      setOrder((prev: any) =>
        prev
          ? {
              ...prev,
              status: "CANCELLED",
              cancelReason: reason,
            }
          : prev
      );
      setCancelDialogOpen(false);
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const orderData = await getOrderById(orderId);

        if (!orderData) {
          setLoading(false);
          return;
        }

        setOrder(orderData);

        try {
          const reviewsResponse = await getMyReviews();
          if (reviewsResponse?.data) {
            // Lấy tất cả ID mặt hàng trong đơn hàng đã được xem xét.
            const reviewedIds = new Set<string>(
              reviewsResponse.data
                .filter((review: any) => review.orderItem?.id)
                .map((review: any) => review.orderItem.id as string)
            );

            // Đối chiếu với các mặt hàng trong đơn hàng hiện tại
            const currentOrderReviewedIds = new Set<string>(
              orderData.items
                ?.filter((item: any) => reviewedIds.has(item.id))
                .map((item: any) => item.id as string) || []
            );

            setReviewedItemIds(currentOrderReviewedIds);

            // Lưu dữ liệu đánh giá theo ID mặt hàng
            const reviewsMap = new Map<string, any>();
            reviewsResponse.data.forEach((review: any) => {
              if (review.orderItem?.id) {
                reviewsMap.set(review.orderItem.id, review);
              }
            });
            setReviewsData(reviewsMap);
          }
        } catch (err) {
          console.error("Error loading reviews:", err);
        }
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );

  if (!order)
    return (
      <div className="text-center py-10 text-gray-600">Không tìm thấy đơn hàng.</div>
    );

  return (
    <div className="max-w-full px-20 lg:px-30 py-10 bg-gray-100 min-h-screen">
      <div className="mx-auto" ref={pageTopRef}>
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 transition cursor-pointer"
            aria-label="Trở lại"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">
              Mã Đơn Hàng:{" "}
              <span className="font-bold text-blue-600 uppercase ml-3">
                {order.orderCode}
              </span>
            </h2>

            <div className="flex gap-2 shrink-0 items-center justify-end">
              <Button
                onClick={() => {
                  setSelectedOrder(order);
                  setDialogOpen(true);
                }}
                variant="outline"
                className={`px-3 py-5 transition font-semibold w-[140px] rounded-full ${
                  order.status === "pending"
                    ? "border-blue-500 border hover:bg-white text-blue-600 hover:text-blue-800 hover:border-blue-800"
                    : "bg-blue-600 text-white hover:bg-blue-800 text-white hover:text-white"
                }`}
              >
                Mua lại
              </Button>
              {selectedOrder && (
                <AddToCartOrderDialog
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                  items={selectedOrder.items.map((item: any, idx: number) => ({
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

              {order.status === "pending" ||
              order.status === "awaiting_payment" ? (
                <Button
                  onClick={() => setCancelDialogOpen(true)}
                  className="bg-red-600 rounded-full text-white px-3 py-5 hover:bg-red-700 transition font-semibold w-[140px]"
                >
                  Hủy đơn
                </Button>
              ) : null}

              {order.status === "delivered" ? (
                <Button
                  onClick={() => {
                    setShowReturnForm(true);
                    setTimeout(() => {
                      scrollToFormWithOffset();
                    }, 0);
                  }}
                  className="bg-orange-600 rounded-full text-white px-3 py-5 hover:bg-orange-700 transition font-semibold w-[140px]"
                >
                  Trả hàng
                </Button>
              ) : null}
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-base mb-3">
                Thông tin nhận hàng
              </h3>
              <div className="text-sm black space-y-1">
                <p className="font-medium">{order.recipientName || "--"}</p>
                <p>{order.recipientPhone || "--"}</p>
                <p className="text-black whitespace-normal break-all w-full text-justify">
                  {`${order.addressLine || ""}${
                    order.wardName ? ", " + order.wardName : ""
                  }${order.districtName ? ", " + order.districtName : ""}${
                    order.provinceName ? ", " + order.provinceName : ""
                  }`}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-base mb-1">Phương thức thanh toán</h3>
              <div className="text-sm text-gray-700">
                <p className="mb-3 text-black">
                  {order.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng (COD)"
                    : order.paymentMethod === "VNPAY"
                    ? "VNPay"
                    : order.paymentMethod}
                </p>
                <p
                  className={`${
                    order.paymentMethod === "VNPAY"
                      ? order.status === "awaiting_payment"
                        ? "text-red-600 font-semibold"
                        : "text-green-600 font-semibold"
                      : order.paymentMethod === "COD"
                      ? order.status === "completed"
                        ? "text-green-600 font-semibold"
                        : "text-black font-semibold"
                      : "text-black font-semibold"
                  }`}
                >
                  {order.paymentMethod === "COD"
                    ? order.status === "completed"
                      ? "✓ Thanh Toán Thành Công"
                      : `Vui lòng thanh toán ${Number(order.grandTotal)?.toLocaleString(
                          "en-US"
                        )}đ khi nhận hàng.`
                    : order.paymentMethod === "VNPAY"
                    ? order.status === "awaiting_payment"
                      ? "✕ Thanh toán chưa hoàn tất"
                      : "✓ Thanh toán thành công"
                    : order.paymentStatus || "--"}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-base mb-3">Thông tin vận chuyển</h3>
              <div className="text-sm text-black space-y-2">
                {order.trackingCode && (
                  <div className="mt-2 pt-2">
                    <p className="font-semibold text-gray-700">Mã vận đơn:</p>
                    <a
                      href={`https://tracking.ghn.dev/?order_code=${order.trackingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition cursor-pointer"
                    >
                      {order.trackingCode}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="mb-8">
            <OrderStatusTimeline status={order.status || "pending"} />
          </div>

          {/* Cart Items */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">
              Thông tin đơn hàng
            </h3>

            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div key={item.id || index}>
                  <OrderItem
                    item={item}
                    isReviewed={reviewedItemIds.has(item.id)}
                    orderStatus={order.status}
                    onReviewClick={(selectedItem: any) => {
                      setShowReviewFormForItemId((prev) =>
                        prev === selectedItem.id ? null : selectedItem.id
                      );
                    }}
                  />
                  {/* Review Form */}
                  {showReviewFormForItemId === item.id && (
                    <div className="mt-4 mb-4">
                      <CreateReviewForm
                        orderItem={{
                          id: item.id,
                          productName: item.productName,
                          thumbnailUrl: item.thumbnailUrl,
                          colors: item.colors,
                        }}
                        existingReview={reviewsData.get(item.id)}
                        onSuccess={async () => {
                          try {
                            const reviewsResponse = await getMyReviews();
                            if (reviewsResponse?.data) {
                              const reviewedIds = new Set<string>(
                                reviewsResponse.data
                                  .filter((review: any) => review.orderItem?.id)
                                  .map(
                                    (review: any) =>
                                      review.orderItem.id as string
                                  )
                              );

                              const currentOrderReviewedIds = new Set<string>(
                                order.items
                                  ?.filter((item: any) =>
                                    reviewedIds.has(item.id)
                                  )
                                  .map((item: any) => item.id as string) || []
                              );

                              setReviewedItemIds(currentOrderReviewedIds);

                              const reviewsMap = new Map<string, any>();
                              reviewsResponse.data.forEach((review: any) => {
                                if (review.orderItem?.id) {
                                  reviewsMap.set(review.orderItem.id, review);
                                }
                              });
                              setReviewsData(reviewsMap);
                            }
                          } catch (err) {
                            console.error("Error reloading reviews:", err);
                          }

                          setShowReviewFormForItemId(null);
                        }}
                        onCancel={() => {
                          setShowReviewFormForItemId(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-800 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-800 text-base">Tổng:</span>
                <span className="font-semibold text-lg text-gray-800">
                  {Number(order.subtotal || 0).toLocaleString("en-US")}đ
                </span>
              </div>
              {Number(order.voucherOrderDiscount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-800 text-base">Giảm giá:</span>
                  <span className="font-semibold text-lg text-red-600">
                    -{" "}
                    {Number(order.voucherOrderDiscount || 0).toLocaleString(
                      "en-US"
                    )}
                    đ
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-800 text-base">Phí vận chuyển:</span>
                <span
                  className={`font-semibold ${
                    Number(order.voucherShippingDiscount || 0) > 0
                      ? "text-green-600 text-sx"
                      : "text-gray-800 text-lg"
                  }`}
                >
                  {Number(order.voucherShippingDiscount || 0) > 0
                    ? "Miễn phí vận chuyển"
                    : `${Number(order.shippingFee || 0).toLocaleString(
                        "en-US"
                      )}đ`}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-400">
                <span>Thành tiền:</span>
                <span className="text-blue-600">
                  {Number(order.grandTotal || 0).toLocaleString("en-US")}đ
                </span>
              </div>
            </div>
          </div>

          {/* Return Form */}
          {showReturnForm && (
            <div ref={returnFormRef} className="mt-6 border border-orange-200 rounded-lg p-6 bg-orange-50">
              <CreateReturnForm
                orderItem={{
                  id: order.id,
                  productName: "Chi tiết đơn hàng",
                  thumbnailUrl: order.items?.[0]?.thumbnailUrl || "/placeholder.png",
                  colors: "",
                }}
                orderId={order.id}
                paymentMethod={order.paymentMethod}
                onSuccess={() => {
                  setShowReturnForm(false);
                  setTimeout(() => {
                    pageTopRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 0);
                }}
                onCancel={() => {
                  setShowReturnForm(false);
                  setTimeout(() => {
                    pageTopRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 0);
                }}
              />
            </div>
          )}
        </div>

        <CancelOrderDialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          onConfirm={handleCancelOrder}
          orderCode={order.orderCode}
        />
      </div>
    </div>
  );
}
