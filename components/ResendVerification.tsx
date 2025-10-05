"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function VerifyEmail({
  open,
  onOpenChange,
  onSwitchToSignup,
  email,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup?: () => void;
  email: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-xl px-8">
        {/* Nút quay lại */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
            onSwitchToSignup?.();
          }}
          className="absolute top-2 left-2 h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 flex items-center justify-center"
        >
          <ArrowLeft className="!h-6 !w-6" />
        </Button>

        <DialogHeader>
          <DialogTitle className="mt-2 text-center text-2xl font-bold">
            Check Email
          </DialogTitle>
          <p className="text-center text-sm mt-2">
            We’ve sent a confirmation email to
            <br />
            <span className="font-medium text-lg">{email}</span>
            <br />
            Please check your inbox and click the link to complete your
            registration.
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
              <span className="font-semibold text-lg">Resend Email</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
