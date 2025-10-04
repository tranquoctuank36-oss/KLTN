"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    paypal: any;
  }
}

export default function PaypalCheckoutButton() {
  useEffect(() => {
    // Load PayPal SDK script 1 lần duy nhất
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD";
    script.async = true;
    script.onload = () => {
      console.log("PayPal SDK loaded");
    };
    document.body.appendChild(script);
  }, []);

  const handlePayPalCheckout = () => {
    if (!window.paypal) {
      alert("PayPal SDK chưa được load!");
      return;
    }

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },
        createOrder: async (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: "10.00", // 💵 số tiền test
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          const details = await actions.order.capture();
          console.log("Thanh toán thành công:", details);
          alert("Thanh toán thành công!");
        },
        onError: (err: any) => {
          console.error("PayPal error:", err);
          alert("Có lỗi xảy ra khi thanh toán");
        },
      })
      .render("body"); // mở popup PayPal
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={handlePayPalCheckout}
        className="bg-[#FFC439] hover:bg-[#F7B600] w-80 h-12 flex items-center justify-center gap-2 font-semibold rounded-md mb-2"
      >
        <span className="text-[22px] font-extrabold">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#009CDE]">Pal</span>
        </span>
        <span className="text-black text-[16px] font-semibold">
          Thanh toán
        </span>
      </Button>
    </div>
  );
}
