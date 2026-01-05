"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createOrder } from "@/services/orderService";
import { Order } from "@/types/order";
import { PaymentMethodType } from "@/types/payment";
import Image from "next/image";
import Link from "next/link";
import { Routes } from "@/lib/routes";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { CalendarDays, DollarSign, Truck } from "lucide-react";

type Props = {
  shippingFee: number;
  grandTotal: number;
  discountCode: string | null;
  orderDiscount: number;
  shippingDiscount: number;
  paymentMethod: PaymentMethodType;
  orderData: Order;
  checkoutCart: any[];
  checkoutSubtotal: number;
  isFormValid: boolean;
  hasShippingError?: boolean;
};

export default function OrderSummary({
  shippingFee,
  grandTotal,
  discountCode,
  orderDiscount,
  shippingDiscount,
  paymentMethod,
  orderData,
  checkoutCart,
  checkoutSubtotal,
  isFormValid,
  hasShippingError = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { removeFromCart } = useCart();

  const handleOrder = async () => {
    const items = checkoutCart
      .filter((i) => i.selectedVariant?.id)
      .map((i) => ({
        variantId: i.selectedVariant!.id,
        quantity: i.quantity,
      }));

    const payload = {
      items,
      voucherCode: discountCode || undefined,
      customerNote: orderData.customerNote || "",
      recipientName: orderData.recipientName,
      recipientEmail: orderData.recipientEmail,
      recipientPhone: orderData.recipientPhone,
      addressLine: orderData.addressLine,
      toProvinceId: orderData.provinceId,
      toDistrictId: orderData.districtId,
      toWardId: orderData.wardId,
      paymentMethod,
    };

    try {
      const orderRes = await createOrder(payload);
      const createdOrder = orderRes?.data?.order || orderRes?.order || orderRes?.data || orderRes;
      const paymentUrl = orderRes?.data?.paymentUrl || orderRes?.paymentUrl;

      if (paymentMethod === "VNPAY") {
        if (!paymentUrl) {
          toast.error("Không tìm thấy URL thanh toán VNPAY!");
          throw new Error("Payment URL not found");
        }
        return {
          type: "VNPAY",
          orderCode: createdOrder.orderCode,
          paymentUrl: paymentUrl,
          items: checkoutCart,
        };
      } else {
        return {
          type: "COD",
          orderCode: createdOrder.orderCode,
          items: checkoutCart,
        };
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi đặt hàng!");
      throw err;
    }
  };

  const totalQuantity = checkoutCart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const displayGrandTotal = grandTotal;

  const isDisabled =
    !isFormValid || hasShippingError || loading || checkoutCart.length === 0;

  const getDisabledMessage = () => {
    if (hasShippingError) {
      return "Giao hàng không có sẵn cho địa chỉ này";
    }
    if (!isFormValid) {
      return "Vui lòng hoàn tất thông tin vận chuyển";
    }
    if (checkoutCart.length === 0) {
      return "Giỏ hàng của bạn đang trống";
    }
    return "";
  };

  return (
    <div
      className="sticky h-fit lg:col-span-1 flex flex-col gap-4"
      style={{ top: "var(--header-h)" }}
    >
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between border-b px-3 py-4">
          <h2 className="text-lg font-semibold">Giỏ hàng của tôi ({totalQuantity})</h2>
          <Link
            href={Routes.cart()}
            className="text-gray-800 underline text-base font-medium hover:no-underline"
          >
            Chỉnh sửa giỏ hàng
          </Link>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto px-3 py-4">
          {checkoutCart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <p className="text-base font-medium">
                Bạn chưa có sản phẩm nào trong giỏ hàng
              </p>
              <Link
                href={Routes.home()}
                className="mt-3 text-blue-600 font-semibold underline hover:no-underline"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <>
              {checkoutCart.map((item, index) => {
                const originalPrice = Number(
                  item.selectedVariant.originalPrice || 0
                );
                const finalPrice = Number(item.selectedVariant.finalPrice || 0);
                const isOnSale = originalPrice > finalPrice;

                return (
                  <div
                    key={`${item.product.slug}-${item.selectedVariant.id}-${index}`}
                    className={`flex gap-2 pb-4 ${
                      index !== checkoutCart.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="w-35 h-35 rounded bg-gray-100 flex items-center justify-center">
                      <Image
                        src={
                          item?.selectedVariant.images?.[0]?.publicUrl ||
                          "/placeholder.png"
                        }
                        alt={item.product.name}
                        width={200}
                        height={200}
                        className="object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex-1 pl-2 flex flex-col justify-center">
                      <p className="font-bold pb-1">{item.product.name}</p>

                      {/* PRICE */}
                      <div className="flex items-center gap-2 pb-2">
                        {isOnSale && (
                          <span className="text-gray-400 line-through">
                            {(originalPrice * item.quantity).toLocaleString(
                              "en-US"
                            )}{" "}
                            đ
                          </span>
                        )}

                        <span
                          className={`font-semibold ${
                            isOnSale ? "text-red-600" : "text-gray-800"
                          }`}
                        >
                          {(finalPrice * item.quantity).toLocaleString("en-US")}{" "}
                          đ
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 font-medium pb-2">
                        Số lượng:{" "}
                        <span className="font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="border-t px-3 py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              Tổng ({totalQuantity} sản phẩm):
            </span>
            <span className="font-medium">
              {checkoutSubtotal.toLocaleString("en-US")}đ
            </span>
          </div>

          {discountCode && orderDiscount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>
                Giảm giá (
                <span className="font-semibold">{discountCode}</span>):
              </span>
              <span>-{orderDiscount.toLocaleString("en-US")}đ</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className={`font-medium ${discountCode && shippingDiscount > 0 ? "text-green-600 font-semibold" : ""}`}>
              {discountCode && shippingDiscount > 0 ? (
                "Miễn phí vận chuyển"
              ) : !shippingFee || shippingFee === 0 || isNaN(shippingFee) ? (
                "0đ"
              ) : (
                `${shippingFee.toLocaleString("en-US")}đ`
              )}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t font-bold text-xl">
            <span>Thanh tiền:</span>
            <span className="text-gray-900">
              {displayGrandTotal.toLocaleString("en-US")}đ
            </span>
          </div>

          <Button
            className={`w-full bg-blue-600 text-white h-12 text-lg font-bold mb-5 mt-5 ${
              isDisabled ? "cursor-not-allowed opacity-70" : "hover:bg-blue-700"
            }`}
            disabled={isDisabled}
            title={getDisabledMessage()}
            onClick={async () => {
              if (isDisabled) return;
              setLoading(true);

              try {
                const [result] = await Promise.all([
                  handleOrder(),
                  new Promise((resolve) => setTimeout(resolve, 3000)),
                ]);

                localStorage.removeItem("checkoutSelectedItems");
                localStorage.removeItem("checkoutDiscount");

                if (result.items) {
                  result.items.forEach((item: any) => {
                    if (item.cartItemId) {
                      removeFromCart(item.cartItemId);
                    }
                  });
                }

                if (result.type === "VNPAY") {
                  window.location.href = result.paymentUrl;
                } else if (result.type === "COD") {
                  router.push(Routes.orderSuccessPage(result.orderCode));
                }
              } catch (err) {
                console.error("Error when ordering:", err);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <span className="font-semibold text-lg">Đặt hàng</span>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3 text-gray-700 text-sm bg-transparent px-2 mt-2">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-gray-500" />
          <span>Miễn phí vận chuyển & trả hàng</span>
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-gray-500" />
          <span>45 Ngày trả hàng & đổi hàng</span>
        </div>
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-gray-500" />
          <span>Bảo hành hoàn đổi 100%</span>
        </div>
      </div>
    </div>
  );
}
