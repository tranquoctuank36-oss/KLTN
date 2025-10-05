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
import { useRouter } from "next/navigation";
import { login as loginApi } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginDialog({
  open,
  onOpenChange,
  onSwitchToSignup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup?: () => void;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forceValidate, setForceValidate] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setForceValidate(true);
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({
        email: email.trim(),
        password: password.trim(),
      });

      console.log("Login success:", res);

      login(res.data.accessToken);

      // setEmail("");
      // setPassword("");
      setForceValidate(false);
      setErrorMsg("");
      onOpenChange(false);

      router.push(Routes.home());
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMsg("Email or password is incorrect!");
      } else {
        setErrorMsg("Login failed, please try again later!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] rounded-xl overflow-y-auto px-8">
        <DialogHeader>
          <DialogTitle className="mt-2 text-center text-2xl font-bold">
            Log in.
          </DialogTitle>
          <p className="text-center text-sm leading-5">
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
            onChange={(val) => {
              setEmail(val);
              setErrorMsg("");
            }}
            forceValidate={forceValidate}
          />

          {/* Password */}
          <FloatingInput
            id="password"
            label="* Password"
            type={showPwd ? "text" : "password"}
            required
            value={password}
            onChange={(val) => {
              setPassword(val);
              setErrorMsg("");
            }}
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

          {errorMsg && <p className="text-xs text-red-500 mt-1">{errorMsg}</p>}

          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-sm underline text-gray-500 hover:text-black/80"
            >
              Forgot password?
            </a>
          </div>

          <Button
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
