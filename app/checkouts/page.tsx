"use client";

import { useEffect, useState, useRef } from "react";
import ClientOnly from "@/components/ClientOnly";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import VoucherSection from "@/components/VoucherSection";
import { useCart } from "@/context/CartContext";
import { Order } from "@/types/order";
import { PaymentMethodType } from "@/types/payment";

export default function CheckoutPage() {
  const { cart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("COD");
  const [shippingFee, setShippingFee] = useState(0);
  const [checkoutCart, setCheckoutCart] = useState<typeof cart>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const hasLoadedRef = useRef(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasShippingError, setHasShippingError] = useState(false);
  const [note, setNote] = useState("");
  
  // Voucher states
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [voucherOrderDiscount, setVoucherOrderDiscount] = useState(0);
  const [voucherShippingDiscount, setVoucherShippingDiscount] = useState(0);

  const handleVoucherApplied = (code: string, orderDiscount: number, shippingDiscount: number) => {
    setVoucherCode(code);
    setVoucherOrderDiscount(orderDiscount);
    setVoucherShippingDiscount(shippingDiscount);
  };

  const handleVoucherCleared = () => {
    setVoucherCode(null);
    setVoucherOrderDiscount(0);
    setVoucherShippingDiscount(0);
  };

  useEffect(() => {
    if (hasLoadedRef.current || cart.length === 0) return;
    const savedSelectedItems = localStorage.getItem("checkoutSelectedItems");

    if (!savedSelectedItems) {
      setCheckoutCart([]);
      setShippingFee(0);
      hasLoadedRef.current = true;
      return;
    }

    if (savedSelectedItems) {
      try {
        const selectedKeys = JSON.parse(savedSelectedItems) as string[];
        const selectedSet = new Set(selectedKeys);

        const filteredCart = cart.filter((item) => {
          // Tạo key theo cùng logic với CartItems
          const key = item.cartItemId || `${item.product.slug}__${item.selectedVariant.id}`;
          const isSelected = selectedSet.has(key);
          return isSelected;
        });

        if (filteredCart.length > 0) {
          setCheckoutCart(filteredCart);
        } else {
          setCheckoutCart([]);
          setShippingFee(0);
        }
      } catch (error) {
        setCheckoutCart([]);
        setShippingFee(0);
      }
    }

    hasLoadedRef.current = true;
  }, [cart]);

  useEffect(() => {
    sessionStorage.setItem("isOnCheckoutPage", "true");

    const timer = setTimeout(() => {
      sessionStorage.removeItem("isOnCheckoutPage");
    }, 100);

    return () => {
      clearTimeout(timer);

      const isReloading = sessionStorage.getItem("isOnCheckoutPage") === "true";

      if (isReloading) {
        sessionStorage.removeItem("isOnCheckoutPage");
      } else {
        localStorage.removeItem("checkoutSelectedItems");
        localStorage.removeItem("checkoutDiscount");
      }
    };
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const checkoutSubtotal = checkoutCart.reduce((sum, item) => {
    const price = Number(item.selectedVariant.finalPrice) || 0;
    return sum + price * item.quantity;
  }, 0);

  const [orderData, setOrderData] = useState<Order>({
    id: "",
    orderCode: "",
    createdAt: "",
    updatedAt: "",
    items: [],
    discountFee: 0,
    shippingFee,
    grandTotal: Number(checkoutSubtotal) + Number(shippingFee),
    paymentMethod: "COD",
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    addressLine: "",
    provinceName: "",
    districtName: "",
    wardName: "",
    provinceId: "",
    districtId: "",
    wardId: "",
    note: "",
    couponCode: "",
  });

  useEffect(() => {
    const safeSubtotal = Number(checkoutSubtotal) || 0;
    const safeShippingFee = Math.max(0, Number(shippingFee) - Number(voucherShippingDiscount));
    const safeOrderDiscount = Number(voucherOrderDiscount) || 0;
    const calculatedGrandTotal =
      safeSubtotal + safeShippingFee - safeOrderDiscount;

    setOrderData((prev) => ({
      ...prev,
      items: checkoutCart.map((i) => ({
        productId: i.product.id,
        variantId: i.selectedVariant?.id,
        quantity: i.quantity,
        price: Number(i.selectedVariant?.finalPrice),
        name: i.product.name,
        imageUrl: i.selectedVariant?.productImages?.[0]?.publicUrl || "",
        color: i.selectedVariant?.colors?.map((c) => c.name).join(", ") || "",
      })),
      discountFee: voucherOrderDiscount,
      shippingFee: safeShippingFee,
      grandTotal: Math.max(0, calculatedGrandTotal),
      paymentMethod,
      couponCode: voucherCode || "",
      note,
    }));
  }, [
    checkoutCart,
    shippingFee,
    voucherOrderDiscount,
    voucherShippingDiscount,
    paymentMethod,
    voucherCode,
    checkoutSubtotal,
    note,
  ]);

  return (
    <ClientOnly>
      <div className="max-w-full px-20 lg:px-30 py-10 grid grid-cols-1 lg:grid-cols-3 gap-5 bg-gray-50">
        <div className="lg:col-span-2">
          <CheckoutForm
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setShippingFee={setShippingFee}
            onOrderDataChange={setOrderData}
            onFormValidChange={setIsFormValid}
            onShippingErrorChange={setHasShippingError}
            note={note}
            onNoteChange={setNote}
            checkoutCart={checkoutCart}
            voucherCode={voucherCode}
            onLocationChange={(districtId, wardId) => {
              setSelectedDistrict(districtId);
              setSelectedWard(wardId);
            }}
          />

          <VoucherSection
            orderAmount={checkoutSubtotal}
            items={checkoutCart.map(item => ({
              variantId: item.selectedVariant.id,
              quantity: item.quantity
            }))}
            toWardId={selectedWard}
            toDistrictId={selectedDistrict}
            paymentMethod={paymentMethod}
            onVoucherApplied={handleVoucherApplied}
            onVoucherCleared={handleVoucherCleared}
            currentVoucherCode={voucherCode || undefined}
            disabled={false}
          />
        </div>

        <OrderSummary
          shippingFee={Math.max(0, shippingFee - voucherShippingDiscount)}
          grandTotal={checkoutSubtotal + Math.max(0, shippingFee - voucherShippingDiscount) - voucherOrderDiscount} 
          discountCode={voucherCode}
          orderDiscount={voucherOrderDiscount}
          shippingDiscount={voucherShippingDiscount}
          paymentMethod={paymentMethod}
          orderData={orderData}
          checkoutCart={checkoutCart}
          checkoutSubtotal={checkoutSubtotal}
          isFormValid={isFormValid}
          hasShippingError={hasShippingError} 
        />
      </div>
    </ClientOnly>
  );
}
