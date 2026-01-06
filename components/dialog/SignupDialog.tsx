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
import { register } from "@/services/authService";
import FloatingInput from "../FloatingInput";

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
  const [registerError, setRegisterError] = useState("");

  // Password rules
  const passMin8 = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasTypedPwd = password.length > 0;
  const matchConfirm = confirmPwd === password;
  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isValidPassword =
    passMin8 && hasNumber && hasUppercase && hasLowercase && hasSpecial;

  const handleSignup = async () => {
    if (!isValidEmail(email.trim()) && email.trim() !== "") {
      setEmailError("Vui lòng nhập một địa chỉ email hợp lệ.");
      setForceValidate(true);
      return;
    }
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
      await register({
        email: email.trim(),
        password: password.trim(),
      });

      setEmail("");
      setPwd("");
      setConfirmPwd("");
      setEmailError("");
      setForceValidate(false);
      onOpenChange(false);
      onSwitchToVerify?.(email.trim());
    } catch (err: any) {
      if (err.response?.data.detail.includes("Email đã được sử dụng")) {
        setEmailError("Email đã tồn tại!");
        setRegisterError("");
      } else {
        setRegisterError("Đăng ký thất bại, vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[80vh] rounded-xl overflow-y-auto px-8"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="mt-2 text-center text-2xl font-bold">
            Đăng ký.
          </DialogTitle>
          <p className="text-center text-sm leading-5">
            Đăng ký để thanh toán nhanh hơn và dễ dàng theo dõi đơn hàng.
          </p>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          {/* Email */}
          <FloatingInput
            id="signup-email"
            label="Địa chỉ Email"
            type="email"
            required
            value={email}
            onChange={(val) => {
              setEmail(val);
              setEmailError("");
            }}
          />
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}

          {/* Password */}
          <FloatingInput
            id="signup-password"
            label="Mật khẩu"
            type={showPwd ? "text" : "password"}
            required
            value={password}
            onChange={setPwd}
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

          {/* Password rules */}
          {!hasTypedPwd ? (
            <ul className="mt-1 space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <Circle className="w-2 h-2 fill-gray-500 text-gray-500" />
                <span className="text-gray-600">Ít nhất 8 ký tự</span>
              </li>
              <li className="flex items-center gap-2">
                <Circle className="w-2 h-2 fill-gray-500 text-gray-500" />
                <span className="text-gray-600">
                  Bao gồm số, chữ hoa, chữ thường và ký tự đặc biệt
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
                  Ít nhất 8 ký tự
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
                  Bao gồm số, chữ hoa, chữ thường và ký tự đặc biệt
                </span>
              </li>
            </ul>
          )}

          {/* Confirm Password */}
          <FloatingInput
            id="signup-confirm"
            label="Xác nhận Mật khẩu"
            type={showConfirmPwd ? "text" : "password"}
            required
            value={confirmPwd}
            onChange={setConfirmPwd}
            rightIcon={
              <Button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                className="drop-shadow-none bg-white
                  w-9 h-9 flex items-center justify-center
                  rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                aria-label={showConfirmPwd ? "Ẩn Mật Khẩu" : "Hiển Thị Mật Khẩu"}
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
              Mật khẩu xác nhận không khớp
            </p>
          )}
          {registerError && (
            <p className="text-xs text-red-500 mt-1">{registerError}</p>
          )}

          <Button
            onClick={handleSignup}
            disabled={loading}
            className="w-full !h-12 mt-2 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="font-semibold text-lg">Đăng ký</span>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-2">
            Đã có tài khoản?{" "}
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToLogin?.();
              }}
              className="underline text-blue-500 pl-0 drop-shadow-none"
            >
              Đăng nhập
            </Button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
