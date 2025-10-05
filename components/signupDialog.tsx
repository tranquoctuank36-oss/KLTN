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
import { register } from "@/services/auth";
import { AxiosError } from "axios";

export default function SignupDialog({
  open,
  onOpenChange,
  onSwitchToLogin,
  onSwitchToVerify,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
  onSwitchToVerify?: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forceValidate, setForceValidate] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Password rules
  const passMin8 = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasTypedPwd = password.length > 0;
  const matchConfirm = confirmPwd === password;

  const isValidPassword =
    passMin8 && hasNumber && hasUppercase && hasLowercase && hasSpecial;

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
            onChange={(val) => {
              setEmail(val);
              setEmailError("");
            }}
            forceValidate={forceValidate}
          />
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}

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
                  Includes number, uppercase, lowercase and special character
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
                {hasNumber && hasUppercase && hasLowercase && hasSpecial ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                )}
                <span
                  className={
                    hasNumber && hasUppercase && hasLowercase && hasSpecial
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  Includes number, uppercase, lowercase and special character
                </span>
              </li>
            </ul>
          )}

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
              if (!isValidPassword) {
                setForceValidate(true);
                return;
              }

              setLoading(true);
              try {
                const res = await register({
                  email: email.trim(),
                  password: password.trim(),
                });

                console.log("Register success:", res);
                localStorage.setItem("token", res.data.accessToken);

                setEmail("");
                setPwd("");
                setForceValidate(false);
                onOpenChange(false);
                onSwitchToVerify?.(email.trim());
              } catch (err) {
                const error = err as AxiosError;
                if (
                  error.response?.status === 400 ||
                  error.response?.status === 409
                ) {
                  setEmailError("Email already exists!");
                } else {
                  setEmailError("Register failed, please try again!");
                }
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
