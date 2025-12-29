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
import FloatingInput from "../FloatingInput";
import { useAuth } from "@/context/AuthContext";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import toast from "react-hot-toast";
import { resendVerification } from "@/services/authService";

type ApiErrorData = { detail?: string; message?: string };
type ApiError = { response?: { status?: number; data?: ApiErrorData } };

export function isAxiosLikeError(e: unknown): e is ApiError {
  return !!(e && typeof e === "object" && "response" in (e as any));
}

export default function LoginDialog({
  open,
  onOpenChange,
  onSwitchToSignup,
  onLoginSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup?: () => void;
  onLoginSuccess?: () => void;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forceValidate, setForceValidate] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  const [isUnverified, setIsUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setForceValidate(true);
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      toast.success("Login successful!", {
        duration: 2000,
        position: "top-center",
      });

      setForceValidate(false);
      setErrorMsg("");

      setIsUnverified(false);
      onLoginSuccess ? onLoginSuccess() : onOpenChange(false);

    } catch (err: unknown) {
      if (isAxiosLikeError(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail ?? "";

        if (status === 401) {
          if (detail.includes("chưa được kích hoạt")) {
            setIsUnverified(true);
            setErrorMsg(
              "Your account is not verified. Please check your email!"
            );
          } else if (detail.includes("mật khẩu không đúng")) {
            setIsUnverified(false);
            setErrorMsg("Incorrect email or password!");
          } else {
            setIsUnverified(false);
            setErrorMsg("Unauthorized. Please try again.");
          }
        } else {
          setIsUnverified(false);
          setErrorMsg("Login failed. Please try again later!");
        }
      } else {
        setIsUnverified(false);
        setErrorMsg("Login failed. Please try again later!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your email to resend the verification link.");
      return;
    }
    try {
      setResendLoading(true);
      await resendVerification(email.trim());
      toast.success("Verification email sent. Please check your inbox.");
    } catch {
      toast.error(
        "Failed to resend verification email. Please try again later."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md max-h-[80vh] rounded-xl overflow-y-auto px-8"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="mt-2 text-center text-2xl font-bold">
              Log in.
            </DialogTitle>
            <p className="text-center text-sm leading-5">
              Log in to track your orders and manage your account.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <FloatingInput
              id="email"
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(val) => {
                setEmail(val);
                setErrorMsg("");
              }}
            />

            {/* Password */}
            <FloatingInput
              id="password"
              label="Password"
              type={showPwd ? "text" : "password"}
              required
              value={password}
              onChange={(val) => {
                setPassword(val);
                setErrorMsg("");
              }}
              rightIcon={
                <Button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="drop-shadow-none bg-white
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

            {errorMsg && (
              <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
            )}

            {isUnverified ? (
              <div className="text-center">
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="text-sm text-blue-600 underline hover:text-blue-700 cursor-pointer disabled:opacity-60"
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => {
                    onOpenChange(false);
                    setForgotOpen(true);
                  }}
                  className="text-sm text-gray-600 underline hover:text-black/80 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="button"
              onClick={handleLogin}
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
                className="underline text-blue-500 pl-0 drop-shadow-none"
              >
                Sign up
              </Button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        onSwitchToLogin={() => {
          setForgotOpen(false);
          onOpenChange(true);
        }}
      />
    </>
  );
}
