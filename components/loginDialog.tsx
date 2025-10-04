"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import FloatingInput from "./FloatingInput";
import { Routes } from "@/lib/routes";
import { useRouter } from "next/navigation"

export default function LoginDialog({
  open,
  onOpenChange,
  onSubmit,
  onSwitchToSignup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: { email: string; password: string }) => void;
  onSwitchToSignup?: () => void;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forceValidate, setForceValidate] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] rounded-xl overflow-y-auto px-8">
        <DialogHeader>
          <DialogTitle className="mt-2 text-center text-2xl font-bold">
            Log in.
          </DialogTitle>
          <p className="text-center text-xm leading-5">
            Log in to track your orders and manage your account.
          </p>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          {/* Email */}
          <FloatingInput
            id="email"
            label="* Email Address"
            type="email"
            required
            value={email}
            onChange={setEmail}
            forceValidate={forceValidate}
          />

          {/* Password + toggle eye */}
          <FloatingInput
            id="password"
            label="* Password"
            type={showPwd ? "text" : "password"}
            required
            value={password}
            onChange={setPassword}
            forceValidate={forceValidate}
            rightIcon={
              <Button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="!shadow-none bg-white
                  w-9 h-9 flex items-center justify-center
                  rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? (
                  <EyeOff className="!h-5 !w-5" />
                ) : (
                  <Eye className="!h-5 !w-5" />
                )}
              </Button>
            }
          />

          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-sm underline text-gray-500 hover:text-black/80"
            >
              Forgot password?
            </a>
          </div>

          <Button
            onClick={async () => {
              if (!email.trim() || !password.trim()) {
                setForceValidate(true);
                return;
              }

              setLoading(true);
              try {
                await new Promise((res) => setTimeout(res, 1000));

                await onSubmit?.({
                  email: email.trim(),
                  password: password.trim(),
                  
                });
                onOpenChange(false);
                setForceValidate(false);
                // setEmail("");
                // setPassword("");
                router.push(Routes.home());
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full !h-12 mt-2 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="font-semibold text-lg">Continue</span>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-2">
            Don’t have an account?{" "}
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToSignup?.();
              }}
              className="underline text-blue-500 pl-0"
            >
              Sign up
            </Button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
