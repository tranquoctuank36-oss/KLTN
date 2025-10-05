"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type PayPalActions = {
  order: {
    create: (opts: { purchase_units: { amount: { value: string } }[] }) => Promise<string> | string;
    capture: () => Promise<unknown>;
  };
};

type PayPalOnApproveActions = {
  order: {
    capture: () => Promise<unknown>;
  };
};

type PayPalButtonsOptions = {
  style?: Record<string, string>;
  createOrder: (data: unknown, actions: PayPalActions) => Promise<string> | string;
  onApprove: (data: { orderID?: string } , actions: PayPalOnApproveActions) => Promise<void>;
  onError?: (err: unknown) => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: PayPalButtonsOptions) => { render: (el: string | Element) => void };
    };
  }
}

export default function PaypalCheckoutButton() {
  useEffect(() => {
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
        createOrder: async (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: "10.00", // test amount
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          const details = await actions.order.capture();
          console.log("Thanh toán thành công:", details);
          alert("Thanh toán thành công!");
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          alert("Có lỗi xảy ra khi thanh toán");
        },
      })
      .render("body");
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
