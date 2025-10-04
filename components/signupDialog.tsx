"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, Circle } from "lucide-react";
import FloatingInput from "./FloatingInput";

export default function SignupDialog({
  open,
  onOpenChange,
  onSubmit,
  onSwitchToLogin,
  onSwitchToCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: { email: string; password: string }) => void;
  onSwitchToLogin?: () => void;
  onSwitchToCreate?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forceValidate, setForceValidate] = useState(false);

  const passMin8 = password.length >= 8;
  const passNo3Repeat = !/(.)\1\1/.test(password);
  const hasTypedPwd = password.length > 0;
  const matchConfirm = confirmPwd === password;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] rounded-xl overflow-y-auto px-8">
        <DialogHeader className="space-y-2">
          <DialogTitle className="mt-2 text-center text-2xl font-bold">
            Sign up.
          </DialogTitle>
          <p className="text-center text-sm leading-5">
            Sign up to enjoy faster checkout and easy order tracking.
          </p>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          {/* Email */}
          <FloatingInput
            id="signup-email"
            label="* Email Address"
            type="email"
            required
            value={email}
            onChange={setEmail}
            forceValidate={forceValidate}
          />

          {/* Password */}
          <FloatingInput
            id="signup-password"
            label="* Password"
            type={showPwd ? "text" : "password"}
            required
            value={password}
            onChange={setPwd}
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

          {/* Confirm Password */}
          <FloatingInput
            id="signup-confirm"
            label="* Confirm Password"
            type={showConfirmPwd ? "text" : "password"}
            required
            value={confirmPwd}
            onChange={setConfirmPwd}
            forceValidate={forceValidate}
            rightIcon={
              <Button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                className="!shadow-none bg-white
                  w-9 h-9 flex items-center justify-center
                  rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                aria-label={showConfirmPwd ? "Hide password" : "Show password"}
              >
                {showConfirmPwd ? (
                  <EyeOff className="!h-5 !w-5" />
                ) : (
                  <Eye className="!h-5 !w-5" />
                )}
              </Button>
            }
          />
          {/* Error confirm password */}
          {forceValidate && confirmPwd && !matchConfirm && (
            <p className="text-xs text-red-500 mt-1">
              Confirm password does not match
            </p>
          )}

          {/* Password rules */}
          {!hasTypedPwd ? (
            <ul className="mt-1 space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <Circle className="w-2 h-2 fill-gray-500 text-gray-500" />
                <span className="text-gray-600">At least 8 characters</span>
              </li>
              <li className="flex items-center gap-2">
                <Circle className="w-2 h-2 fill-gray-500 text-gray-500" />
                <span className="text-gray-600">
                  No more than 2 repeating characters
                </span>
              </li>
            </ul>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center gap-2">
                {passMin8 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                )}
                <span className={passMin8 ? "text-green-600" : "text-red-500"}>
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center gap-2">
                {passNo3Repeat ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                )}
                <span
                  className={passNo3Repeat ? "text-green-600" : "text-red-500"}
                >
                  No more than 2 repeating characters
                </span>
              </li>
            </ul>
          )}

          <Button
            onClick={async () => {
              if (
                !email.trim() ||
                !password.trim() ||
                !confirmPwd.trim() ||
                !matchConfirm
              ) {
                setForceValidate(true);
                return;
              }
              if (!passMin8 || !passNo3Repeat) {
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
                setForceValidate(false);
                onOpenChange(false);
                onSwitchToCreate?.();
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
              <span className="font-semibold text-lg">Sign Up</span>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-2">
            Already a member?{" "}
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToLogin?.();
              }}
              className="underline text-blue-500 pl-0"
            >
              Login
            </Button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
