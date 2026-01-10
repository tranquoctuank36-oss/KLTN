"use client";

import Link from "next/link";
import { MapPin, Undo2, User } from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import LoginDialog from "../../dialog/LoginDialog";
import VerifyEmail from "../../dialog/CheckEmailDialog";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./UserMenu";
import SignupDialog from "../../dialog/SignupDialog";
import { Routes } from "@/lib/routes";
import { usePathname, useRouter } from "next/navigation";

export default function LoginMenu() {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const { isLoggedIn, loading } = useAuth();

  const handleLoginSuccess = () => {
    setHoverOpen(false);
    setLoginOpen(false);

    if (pathname === Routes.orderTracking()) {
      setTimeout(() => {
        router.push(`${Routes.users()}?section=my-orders`);
      }, 0);
    }
  };

  if (loading) {
    return null;
  }

  if (isLoggedIn) {
    return <UserMenu />;
  }

  return (
    <>
      <HoverCard
        open={hoverOpen}
        onOpenChange={setHoverOpen}
        openDelay={80}
        closeDelay={100}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 border border-gray-400" />

          <HoverCardTrigger asChild>
            <Button className="drop-shadow-none flex items-center gap-2 !px-3 !py-6 text-black bg-white hover:bg-gray-100">
              <User className="!h-6 !w-6" />
              <span className="text-base font-normal">Đăng Nhập</span>
            </Button>
          </HoverCardTrigger>
        </div>

        <HoverCardContent
          side="bottom"
          align="center"
          sideOffset={16}
          className="relative w-65 p-4 border border-gray-200 bg-white rounded-md drop-shadow-[0_0_15px_rgba(209,213,219,0.4)]"
        >
          {/* caret */}
          <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 pointer-events-none">
            <svg width="24" height="12" viewBox="0 0 24 12">
              <path d="M0 12 L12 0 L24 12 Z" fill="white" />
              <path
                d="M0 12 L12 0 L24 12"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl text-gray-500 text-center">Chào mừng quay lại</h2>
            <hr className="border-gray-300 mt-2 mb-4" />

            <div className="space-y-3 flex flex-col items-center">
              <Button
                className="min-w-[180px] rounded-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setHoverOpen(false);
                  setLoginOpen(true);
                }}
              >
                Đăng Nhập
              </Button>

              <Button
                variant="outline"
                className="min-w-[180px] rounded-full text-base border-2 border-blue-500 text-blue-500 hover:bg-white hover:text-blue-700 hover:border-blue-700"
                onClick={() => {
                  setHoverOpen(false);
                  setSignupOpen(true);
                }}
              >
                Tạo Tài Khoản
              </Button>
            </div>

            {/* <div className="pt-2 mt-6 border-t space-y-2 text-lg">
              <Link
                href={Routes.orderTracking()}
                className="group flex items-center gap-2 ml-4"
                onClick={() => setHoverOpen(false)}
              >
                <MapPin className="h-5 w-5 text-gray-600 group-hover:text-black" />
                <span className="text-gray-800 group-hover:text-black group-hover:font-medium">
                  Order Tracking
                </span>
              </Link>
              <Link
                href="/returns"
                className="group flex items-center gap-2 ml-4"
              >
                <Undo2 className="h-5 w-5 text-gray-600 group-hover:text-black" />
                <span className="text-gray-800 group-hover:text-black group-hover:font-medium">
                  Returns
                </span>
              </Link>
            </div> */}
          </div>
        </HoverCardContent>
      </HoverCard>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      <SignupDialog
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => {
          setLoginOpen(true);
          setSignupOpen(false);
        }}
        onSwitchToVerify={(email) => {
          setSignupOpen(false);
          setRegisteredEmail(email);
          setVerifyOpen(true);
        }}
      />
      <VerifyEmail
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        email={registeredEmail}
      />
    </>
  );
}
