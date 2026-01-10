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
import FloatingInput from "../ui-common/FloatingInput";
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
      toast.success("Đăng nhập thành công!", {
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
              "Tài khoản của bạn chưa được xác minh. Vui lòng kiểm tra email!"
            );
          } else if (detail.includes("mật khẩu không đúng")) {
            setIsUnverified(false);
            setErrorMsg("Email hoặc mật khẩu không đúng!");
          } else {
            setIsUnverified(false);
            setErrorMsg("Không được phép. Vui lòng thử lại.");
          }
        } else {
          setIsUnverified(false);
          setErrorMsg("Đăng nhập thất bại. Vui lòng thử lại sau!");
        }
      } else {
        setIsUnverified(false);
        setErrorMsg("Đăng nhập thất bại. Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập email của bạn để gửi lại liên kết xác minh.");
      return;
    }
    try {
      setResendLoading(true);
      await resendVerification(email.trim());
      toast.success("Email xác minh đã được gửi. Vui lòng kiểm tra hộp thư của bạn.");
    } catch {
      toast.error(
        "Không thể gửi lại email xác minh. Vui lòng thử lại sau."
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
              Đăng nhập.
            </DialogTitle>
            <p className="text-center text-sm leading-5">
              Đăng nhập để theo dõi đơn hàng và quản lý tài khoản của bạn.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <FloatingInput
              id="email"
              label="Địa chỉ Email"
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
              label="Mật khẩu"
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
                  aria-label={showPwd ? "Ẩn Mật Khẩu" : "Hiển Thị Mật Khẩu"}
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
                  {resendLoading ? "Đang gửi..." : "Gửi lại email xác minh"}
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
                  Quên mật khẩu?
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
                <span className="font-semibold text-lg">Tiếp tục</span>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-2">
              Chưa có tài khoản?{" "}
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSwitchToSignup?.();
                }}
                className="underline text-blue-500 pl-0 drop-shadow-none"
              >
                Đăng ký
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
