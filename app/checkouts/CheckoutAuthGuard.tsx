"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginDialog from "@/components/dialog/LoginDialog";
import { Routes } from "@/lib/routes";
import { Suspense } from "react";

function CheckoutAuthGuardContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const needLogin = searchParams?.get("needLogin") === "true";

  console.log("[CheckoutAuthGuard] Rendered - needLogin:", needLogin, "isLoggedIn:", isLoggedIn, "showLoginDialog:", showLoginDialog);

  useEffect(() => {
    console.log("[CheckoutAuthGuard] useEffect triggered - needLogin:", needLogin, "isLoggedIn:", isLoggedIn);
    if (needLogin && !isLoggedIn) {
      console.log("[CheckoutAuthGuard] Conditions met, showing login dialog");
      setShowLoginDialog(true);
    }
  }, [needLogin, isLoggedIn]);

  const handleLoginSuccess = async () => {
    setShowLoginDialog(false);
    
    // Lấy thông tin buyNowPending từ localStorage
    const buyNowPendingStr = localStorage.getItem("buyNowPending");
    if (buyNowPendingStr) {
      try {
        const buyNowPending = JSON.parse(buyNowPendingStr);
        
        // Redirect về trang product và trigger mua ngay lại
        const { productSlug, variantId, quantity } = buyNowPending;
        localStorage.removeItem("buyNowPending");
        
        // Lưu flag để trigger mua ngay sau khi load product page
        localStorage.setItem("triggerBuyNow", JSON.stringify({ variantId, quantity }));
        
        // Redirect về product page
        router.push(Routes.product(productSlug, variantId));
      } catch (error) {
        console.error("Error processing buyNowPending:", error);
        localStorage.removeItem("buyNowPending");
      }
    } else {
      // Nếu không có buyNowPending, remove needLogin param và reload
      const newUrl = Routes.checkouts();
      router.replace(newUrl);
    }
  };

  const handleLoginCancel = () => {
    setShowLoginDialog(false);
    // Quay về trang trước đó hoặc trang chủ
    router.back();
  };

  return (
    <>
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={(open) => {
          console.log("[CheckoutAuthGuard] LoginDialog onOpenChange called with:", open);
          if (!open) {
            console.log("[CheckoutAuthGuard] Dialog closing, calling handleLoginCancel");
            handleLoginCancel();
          }
        }}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          // Có thể mở signup dialog nếu cần
        }}
      />
      
      {/* Chỉ render children khi không cần login hoặc đã đăng nhập */}
      {!showLoginDialog && children}
    </>
  );
}

export default function CheckoutAuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CheckoutAuthGuardContent>{children}</CheckoutAuthGuardContent>
    </Suspense>
  );
}
