"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Undo2, User } from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import LoginDialog from "../loginDialog";
import SignupDialog from "../signupDialog";
import CreateAccountDialog from "../createAccountDialog";

export default function LoginMenu() {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
            <Button className="!shadow-none flex items-center gap-4 !px-3 !py-6 text-black bg-white hover:bg-gray-100">
              <User className="!h-6 !w-6" />
              <span className="text-base">Log In</span>
            </Button>
          </HoverCardTrigger>
        </div>

        <HoverCardContent
          side="bottom"
          align="center"
          sideOffset={16}
          className="relative w-60 p-4 border border-gray-200 bg-white rounded-md shadow-[0_0_15px_rgba(209,213,219,0.4)]"
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
            <h2 className="text-2xl text-gray-500">Welcome</h2>
            <hr className="border-gray-300 mt-2 mb-6" />

            <div className="space-y-3 flex flex-col items-center">
              <Button
                className="min-w-[180px] rounded-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setHoverOpen(false);
                  setLoginOpen(true);
                }}
              >
                Log In
              </Button>

              <Button
                variant="outline"
                className="min-w-[180px] rounded-full text-base border-2 border-blue-500 text-blue-500 hover:bg-white hover:text-blue-700 hover:border-blue-700"
                onClick={() => {
                  setHoverOpen(false);
                  setSignupOpen(true);
                }}
              >
                Create Account
              </Button>
            </div>

            <div className="pt-2 mt-6 border-t space-y-2 text-lg">
              <Link
                href="/orders"
                className="group flex items-center gap-2 ml-4"
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
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSubmit={({ email, password }) => {
          console.log("Email:", email);
          console.log("Password:", password);
          // gọi API login
          // await LogIn(email, password)
        }}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupDialog
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSubmit={({ email }) => {
          console.log("Email:", email);
          // gọi API signup
          // await signUp(email)
        }}
        onSwitchToLogin={() => {
          setLoginOpen(true);
          setSignupOpen(false);
        }}
        onSwitchToCreate={() => setCreateOpen(true)}
      />
      <CreateAccountDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(payload) => console.log("create account:", payload)}
        onSwitchToSignup={() => { setCreateOpen(false); setSignupOpen(true); }}
      />
    </>
  );
}
