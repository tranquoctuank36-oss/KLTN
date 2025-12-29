"use client";

import { useEffect, useState, useRef } from "react";
import ClientOnly from "@/components/ClientOnly";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import { useCart } from "@/context/CartContext";
import { Order } from "@/types/order";
import { PaymentMethodType } from "@/types/payment";

export default function CheckoutPage() {
  const { cart, discountCode, discountAmount } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("COD");
  const [shippingFee, setShippingFee] = useState(0);
  const [checkoutCart, setCheckoutCart] = useState<typeof cart>([]);
  const hasLoadedRef = useRef(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasShippingError, setHasShippingError] = useState(false);
  const [note, setNote] = useState("");

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
          const key = `${item.product.slug}__${item.selectedVariant.id}`;
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
        console.log("🔄 Page reloading - keeping checkout data");
        sessionStorage.removeItem("isOnCheckoutPage");
      } else {
        console.log("🧹 Leaving checkout - cleaning up");
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
    discountFee: discountAmount || 0,
    shippingFee,
    grandTotal:
      Number(checkoutSubtotal) + Number(shippingFee) - Number(discountAmount),
    paymentMethod: "COD",
    recipientName: "",
    recipientPhone: "",
    addressLine: "",
    wardName: "",
    districtName: "",
    provinceName: "",
    toWardCode: "",
    toDistrictId: 0,
    note: "",
    couponCode: discountCode || "",
  });

  useEffect(() => {
    const safeSubtotal = Number(checkoutSubtotal) || 0;
    const safeShippingFee = Number(shippingFee) || 0;
    const safeDiscountAmount = Number(discountAmount) || 0;
    const calculatedGrandTotal =
      safeSubtotal + safeShippingFee - safeDiscountAmount;

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
      discountFee: discountAmount,
      shippingFee,
      grandTotal: Math.max(0, calculatedGrandTotal),
      paymentMethod,
      couponCode: discountCode || "",
      note,
    }));
  }, [
    checkoutCart,
    shippingFee,
    discountAmount,
    paymentMethod,
    discountCode,
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
          />
        </div>

        <OrderSummary
          shippingFee={shippingFee}
          grandTotal={checkoutSubtotal + shippingFee - discountAmount} 
          discountCode={discountCode}
          discountAmount={discountAmount}
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
