"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Routes } from "@/lib/routes";
import { verifyEmail } from "@/services/authService";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!token) {
      setError("Token không hợp lệ!");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(token);

      setVerified(true);
      setError(null);
      
      localStorage.setItem("emailVerified", "true");
      window.dispatchEvent(new Event("storage"));
      
      setTimeout(() => router.push(Routes.home()), 2000);
    } catch (err) {
      setError("Xác minh thất bại! Token có thể không hợp lệ hoặc đã hết hạn.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Xác minh Email</h1>
        {verified ? (
          <p className="text-green-600 font-semibold">
            ✅ Email của bạn đã được xác minh thành công!
          </p>
        ) : (
          <>
            <p className="mb-4">Nhấp nút dưới đây để xác minh email của bạn.</p>
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Đang xác minh..." : "Xác minh email"}
            </Button>
            {error && <p className="text-red-500 mt-3">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}