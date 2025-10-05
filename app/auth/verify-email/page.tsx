"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { AxiosError } from "axios";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!token) {
      setError("Token is missing!");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { token });
      console.log("Verify success:", res.data);
      setVerified(true);
      setError(null);
      // sau khi xác minh thành công có thể redirect
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
        const error = err as AxiosError;
      console.error("Verify failed:", error.response?.data || error.message);
      setError("Verification failed! Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        {verified ? (
          <p className="text-green-600 font-semibold">
            ✅ Your email has been verified successfully!
          </p>
        ) : (
          <>
            <p className="mb-4">
              Click the button below to verify your email.
            </p>
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
            {error && <p className="text-red-500 mt-3">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
