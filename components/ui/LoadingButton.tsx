"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type LoadingButtonProps = {
  onClick?: () => Promise<void> | void;
  children: React.ReactNode;
  timeout?: number; // thời gian spinner hiển thị tối thiểu
  className?: string;
};

export default function LoadingButton({
  onClick,
  children,
  timeout = 800, // mặc định 0.8s
  className = "",
}: LoadingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);

    try {
      // luôn cho spinner chạy ít nhất "timeout" ms
      const minWait = new Promise((res) => setTimeout(res, timeout));

      // chạy logic của bạn (có thể báo lỗi hoặc submit)
      await Promise.all([Promise.resolve(onClick?.()), minWait]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        children
      )}
    </Button>
  );
}
