"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Routes } from "@/lib/routes";
import { useParams, useRouter } from "next/navigation";
import { cancelOrder, getOrderByCode } from "@/services/orderService";
import { getProductById } from "@/services/productService";
import { Order } from "@/types/order";
import AddToCartOrderDialog from "@/components/dialog/AddToCartOrderDialog";
import { useCart } from "@/context/CartContext";
import { ProductVariants } from "@/types/productVariants";
import CancelOrderDialog from "@/components/dialog/CancelOrderDialog";

function OrderItem({ item }: { item: any }) {
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

  return (
    <div
      key={item.id}
      className="flex justify-between items-center pb-4 border-b last:border-b-0"
    >
      <div className="flex gap-4">
        <div className="w-25 h-25 rounded bg-gray-100 flex items-center justify-center">
          <Image
            src={item.imageUrl || "/placeholder.png"}
            alt={item.productName || "Ảnh Sản Phẩm"}
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
            <span className="font-semibold">Color:</span> {item.colors}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">Quantity:</span> {item.quantity}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {item.originalPrice &&
          Number(item.originalPrice) > Number(item.finalPrice) && (
            <p className="text-gray-400 line-through text-sm">
              {Number(item.originalPrice)?.toLocaleString("en-US")}đ
            </p>
          )}
        <p className="font-semibold text-base text-black">
          {Number(item.finalPrice)?.toLocaleString("en-US")}đ
        </p>
      </div>
    </div>
  );
}

export default function OrderTrackingDetailPage() {
  const { addToCart, openDrawer } = useCart();
  const params = useParams();
  const orderCode = params.orderCode as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [buyAgainLoading, setBuyAgainLoading] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

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
      if (!orderCode) {
        setLoading(false);
        return;
      }

      try {
        const orderData = await getOrderByCode(orderCode);

        if (!orderData) {
          setLoading(false);
          return;
        }

        setOrder(orderData);
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderCode]);

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
      <div className="mx-auto">
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
          {/* Order Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">
              Order code:{" "}
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
                  order.status === "PENDING"
                    ? "border-blue-500 border hover:bg-white text-blue-600 hover:text-blue-800 hover:border-blue-800"
                    : "bg-blue-600 text-white hover:bg-blue-800 text-white hover:text-white"
                }`}
              >
                BUY AGAIN
              </Button>
              {selectedOrder && (
                <AddToCartOrderDialog
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                  items={selectedOrder.items.map((item: any, idx: number) => ({
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

              {order.status === "PENDING" || order.status === "PAID" ? (
                <Button
                  onClick={() => setCancelDialogOpen(true)}
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
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Shipping Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-base mb-3">
                Shipping Information
              </h3>
              <div className="text-sm black space-y-1">
                <p className="font-medium">{order.recipientName || "--"}</p>
                <p>{order.recipientPhone || "--"}</p>
                <p className="text-black whitespace-normal break-all w-full text-black text-justify">
                  {order.addressLine || "không có"} - {order.name},{" "}
                  {order.name}, {order.name}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-base mb-1">Phương thức thanh toán</h3>
              <div className="text-sm text-gray-700">
                <p className="mb-3 text-black">
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery (COD)"
                    : order.paymentMethod === "VNPAY"
                    ? "VNPay"
                    : order.paymentMethod}
                </p>
                <p
                  className={`${
                    order.paymentMethod === "VNPAY"
                      ? order.status === "PAID"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                      : order.paymentMethod === "COD"
                      ? order.status === "COMPLETED"
                        ? "text-green-600 font-semibold"
                        : "text-black font-semibold"
                      : "text-black font-semibold"
                  }`}
                >
                  {order.paymentMethod === "COD"
                    ? order.status === "COMPLETED"
                      ? "✓ Payment successful"
                      : `Please pay ${Number(order.grandTotal)?.toLocaleString(
                          "en-US"
                        )}đ upon delivery.`
                    : order.paymentMethod === "VNPAY"
                    ? order.status === "PAID"
                      ? "✓ Payment successful"
                      : "✕ Payment failed"
                    : order.paymentStatus || "--"}
                </p>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-base mb-3">Phương thức vận chuyển</h3>
              <p className="text-sm text-black">
                {order.shippingInfo || "Không có thông tin vận chuyển"}
              </p>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="mb-8">
            
          </div>

          {/* Cart Items */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">
              Thông tin giỏ hàng
            </h3>

            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <OrderItem key={item.id || index} item={item} />
              ))}
            </div>

            {/* Price Summary */}
            <div className="mt-6 space-y-2 border-t border-gray-800 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-800 text-base">Tổng</span>
                <span className="font-semibold text-lg text-gray-800">
                  {Number(order.subtotal)?.toLocaleString("en-US") || "--"}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800 text-base">Giảm giá</span>
                <span className="font-semibold text-lg text-gray-800">
                  {Number(order.discountFee)?.toLocaleString("en-US") || "--"}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800 text-base">Phí vận chuyển</span>
                <span className="font-semibold text-lg text-gray-800">
                  {Number(order.shippingFee)?.toLocaleString("en-US") || "--"}đ
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-400">
                <span>Thành tiền</span>
                <span className="text-blue-600">
                  {Number(order.grandTotal)?.toLocaleString("en-US") || "--"}đ
                </span>
              </div>
            </div>
          </div>
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
