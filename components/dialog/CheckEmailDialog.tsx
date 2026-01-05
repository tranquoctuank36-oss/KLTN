"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resendVerification } from "@/services/authService";
import toast from "react-hot-toast";

export default function CheckEmail({
  open,
  onOpenChange,
  email,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lắng nghe sự kiện verify email thành công
  useEffect(() => {
    const handleStorageChange = () => {
      const verified = localStorage.getItem("emailVerified");
      if (verified === "true") {
        localStorage.removeItem("emailVerified");
        onOpenChange(false);
      }
    };

    // Lắng nghe storage event từ tab khác
    window.addEventListener("storage", handleStorageChange);
    
    // Lắng nghe custom event từ cùng tab
    window.addEventListener("storage", handleStorageChange);

    // Check ngay khi dialog mở
    if (open) {
      handleStorageChange();
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [open, onOpenChange]);

  const handleResend = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));

    try {
      await resendVerification(email);
      toast.success("Email đã được gửi lại thành công! Vui lòng kiểm tra hộp thư đến.", {
        duration: 2000,
        position: "top-center",
      });
    } catch (err) {
      console.error(err);
      setError("Không Thể Gửi Lại Email Xác Minh. Vui Lòng Thử Lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-xl px-8">
        <DialogHeader>
          <DialogTitle className="mt-2 text-center text-2xl font-bold">
            Kiểm tra Email của Bạn
          </DialogTitle>
          <p className="text-center text-sm mt-2">
            Chúng tôi đã gửi email xác nhận đến
            <br />
            <span className="font-medium text-lg">{email}</span>
            <br />
            Vui lòng kiểm tra hộp thư đến và nhấp vào liên kết để hoàn thành
            đăng ký.
          </p>
        </DialogHeader>

        <div className="flex justify-center mt-3">
          <Button
            disabled={loading}
            onClick={handleResend}
            className="!h-12 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white w-48"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <span className="font-semibold text-lg">Gửi lại Email</span>
            )}
          </Button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
