"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Check, Circle, ArrowLeft } from "lucide-react";
import LoadingButton from "./ui/LoadingButton";

export default function CreateAccountDialog({
  open,
  onOpenChange,
  onSubmit,
  onSwitchToSignup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: {
    firstName: string;
    lastName: string;
    password: string;
    marketingOptIn: boolean;
  }) => void | Promise<void>;
  onSwitchToSignup?: () => void;
}) {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [password, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [marketingOptIn, setOptIn] = useState(true);

  // rules
  const passMin8 = password.length >= 8;
  const passNo3Repeat = !/(.)\1\1/.test(password);
  const hasTypedPwd = password.length > 0;
  const namesValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const isFormValid = useMemo(
    () => namesValid && passMin8 && passNo3Repeat,
    [namesValid, passMin8, passNo3Repeat]
  );

  const resetForm = () => {
    setFirst("");
    setLast("");
    setPwd("");
    setOptIn(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] rounded-xl overflow-y-auto px-8">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            resetForm();
            onOpenChange(false);
            onSwitchToSignup?.();
          }}
          className="absolute top-2 left-2
              flex items-center justify-center hover:bg-gray-100 hover:text-gray-500
              h-8 w-8 rounded-full text-gray-400"
        >
          <ArrowLeft className="!h-6 !w-6" />
        </Button>

        <DialogHeader>
          <DialogTitle className="mt-2 text-center text-2xl font-bold">
            Create Account
          </DialogTitle>
          <p className="text-center text-xm leading-5 mt-2">
            Enjoy access to your saved prescriptions,
            <br />
            addresses and order tracking.
          </p>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* First Name */}
            <div className="relative group">
              <input
                id="first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirst(e.target.value)}
                placeholder=" "
                className="peer w-full h-12 rounded-sm border border-gray-300 bg-white
                           px-4 text-[16px] text-gray-500 shadow-sm
                           focus:border-2 focus:border-blue-400 focus:outline-none focus:text-gray-800 transition
                           group-hover:border-gray-500 group-hover:text-gray-800
                           pt-0 focus:pt-3 [&:not(:placeholder-shown)]:pt-3"
              />
              <label
                htmlFor="first-name"
                className="pointer-events-none absolute left-4 text-gray-500 transition-all
                           top-1/2 -translate-y-1/2 text-[15px] group-hover:text-gray-800
                           peer-focus:top-1 peer-focus:text-xs peer-focus:translate-y-0
                           peer-[:not(:placeholder-shown)]:top-1
                           peer-[:not(:placeholder-shown)]:translate-y-0
                           peer-[:not(:placeholder-shown)]:text-xs
                           peer-[:not(:placeholder-shown)]:text-gray-500"
              >
                * First name
              </label>
            </div>

            {/* Last Name */}
            <div className="relative group">
              <input
                id="last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLast(e.target.value)}
                placeholder=" "
                className="peer w-full h-12 rounded-md border border-gray-300 bg-white
                           px-4 text-[16px] text-gray-500 shadow-sm
                           focus:border-2 focus:border-blue-400 focus:outline-none focus:text-gray-800 transition
                           group-hover:border-gray-500 group-hover:text-gray-800
                           pt-0 focus:pt-3 [&:not(:placeholder-shown)]:pt-3"
              />
              <label
                htmlFor="last-name"
                className="pointer-events-none absolute left-4 text-gray-500 transition-all
                           top-1/2 -translate-y-1/2 text-[15px] group-hover:text-gray-800
                           peer-focus:top-1 peer-focus:text-xs peer-focus:translate-y-0
                           peer-[:not(:placeholder-shown)]:top-1
                           peer-[:not(:placeholder-shown)]:translate-y-0
                           peer-[:not(:placeholder-shown)]:text-xs
                           peer-[:not(:placeholder-shown)]:text-gray-500"
              >
                * Last name
              </label>
            </div>
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              id="signup-password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPwd(e.target.value)}
              placeholder=" "
              className="peer w-full h-12 rounded-md border border-gray-300 bg-white
                         pl-12 pr-12 text-[16px] text-gray-500 shadow-sm
                         focus:border-blue-500 focus:border-2 focus:outline-none focus:text-gray-800 transition
                         group-hover:border-gray-500 group-hover:text-gray-800
                         pt-0 focus:pt-3 [&:not(:placeholder-shown)]:pt-3"
              aria-invalid={!(passMin8 && passNo3Repeat)}
            />
            <label
              htmlFor="signup-password"
              className="pointer-events-none absolute left-12 text-gray-500 transition-all
                         top-1/2 -translate-y-1/2 text-[15px] group-hover:text-gray-800
                         peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-gray-500
                         peer-[:not(:placeholder-shown)]:top-1
                         peer-[:not(:placeholder-shown)]:translate-y-0
                         peer-[:not(:placeholder-shown)]:text-xs
                         peer-[:not(:placeholder-shown)]:text-gray-500"
            >
              * Password
            </label>

            <Button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="!shadow-none bg-white absolute right-3 top-1/2 -translate-y-1/2
                         w-9 h-9 flex items-center justify-center rounded-full
                         text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? (
                <EyeOff className="!h-5 !w-5" />
              ) : (
                <Eye className="!h-5 !w-5" />
              )}
            </Button>
          </div>

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

          {/* Marketing opt-in */}
          <label className="mt-10 flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-blue-600 cursor-pointer"
              checked={marketingOptIn}
              onChange={(e) => setOptIn(e.target.checked)}
            />
            <span>Send me emails on exclusive sales & new arrivals</span>
          </label>

          {/* Submit */}
          <LoadingButton
            onClick={async () => {
              if (!isFormValid) return;
              await onSubmit?.({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                password,
                marketingOptIn,
              });
              resetForm();
              onOpenChange(false);
            }}
            className="w-full !h-12 mt-5 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
          >
            <span className="font-semibold text-lg">Sign Up</span>
          </LoadingButton>

          <p className="text-center text-sm text-gray-500 mt-8">
            By signing up you agree to the{" "}
            <a href="/terms" className="underline hover:text-gray-700">
              Terms of Use
            </a>{" "}
            &{" "}
            <a href="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
