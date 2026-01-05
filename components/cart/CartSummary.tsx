"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoginDialog from "@/components/dialog/LoginDialog";

type Props = {
  subtotal: number;
  totalQuantity: number;
  isEmpty?: boolean;
  selectedItems?: Set<string>;
  hasOutOfStockItems?: boolean;
};

export default function CartSummary({
  subtotal,
  totalQuantity,
  isEmpty = false,
  selectedItems = new Set(),
  hasOutOfStockItems = false,
}: Props) {
  const { discountCode, discountAmount, cart } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleCheckout = () => {
    // Save selected items to localStorage
    localStorage.setItem(
      "checkoutSelectedItems",
      JSON.stringify(Array.from(selectedItems))
    );
    
    // Check if user is logged in
    if (!isLoggedIn) {
      // Save intended destination
      localStorage.setItem("intendedCheckout", "true");
      setShowLoginDialog(true);
      return;
    }
    
    // If logged in, proceed to checkout
    router.push(Routes.checkouts());
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    // Check if user was trying to checkout
    const intendedCheckout = localStorage.getItem("intendedCheckout");
    if (intendedCheckout === "true") {
      localStorage.removeItem("intendedCheckout");
      router.push(Routes.checkouts());
    }
  };

  const grandTotal = subtotal - discountAmount;

  return (
    <div className="rounded-lg p-6 h-fit bg-white">
      <div className="flex justify-between items-center text-lg font-bold mb-2">
        <span>Tổng:</span>
        <span>{grandTotal.toLocaleString("en-US")}đ</span>
      </div>

      <ul className="space-y-2 text-sm text-blue-500 font-semibold mb-6">
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-500 mt-1" /> Miễn phí vận chuyển
          và trả hàng
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-500 mt-1" /> Bảo hành hoàn tiền
          100%
        </li>
      </ul>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />

      <Button
        onClick={handleCheckout}
        disabled={isEmpty || hasOutOfStockItems}
        className={`w-full h-12 text-lg font-bold text-white ${
          isEmpty || hasOutOfStockItems
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        Thanh toán
      </Button>

      {cart.length > 0 && (
        <Link href={Routes.home()}>
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-2 border-blue-600 hover:border-blue-700 hover:bg-white hover:text-blue-700 w-full h-12 text-lg font-bold mb-5 mt-3"
          >
            Tiếp tục mua sắm
          </Button>
        </Link>
      )}
    </div>
  );
}
