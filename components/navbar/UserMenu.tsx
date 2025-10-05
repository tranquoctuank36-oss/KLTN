"use client";

import { useState } from "react";
import {
  User,
  LogOut,
  UserCircle,
  History,
  FileText,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <div className="h-6 border border-gray-400" />
        <SheetTrigger asChild>
          <Button className="!shadow-none flex items-center gap-2 !px-3 !py-6 text-black bg-white hover:bg-gray-100">
            <User className="!h-6 !w-6" />
            <span className="text-base">Welcome back</span>
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent side="right" className="w-[300px] sm:w-[350px]">  
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            Welcome Back
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-3">
          <hr className="border-b border-gray-200" />

          <Button variant="ghost" className="w-full justify-start gap-2 text-lg font-normal text-gray-500 hover:bg-white">
            <UserCircle className="!h-6 !w-6" />
            My Account
          </Button>

          <hr className="border-b border-gray-200" />

          <Button variant="ghost" className="w-full justify-start gap-2 text-lg font-normal text-gray-500 hover:bg-white">
            <History className="!h-6 !w-6" />
            Orders History
          </Button>

          <hr className="border-t border-gray-200" />

          <Button variant="ghost" className="w-full justify-start gap-2 text-lg font-normal text-gray-500 hover:bg-white">
            <FileText className="!h-6 !w-6" />
            My Prescriptions
          </Button>

          <hr className="border-t border-gray-200" />

          <Button variant="ghost" className="w-full justify-start gap-2 text-lg font-normal text-gray-500 hover:bg-white">
            <Undo2 className="!h-6 !w-6" />
            Returns
          </Button>

          <hr className="border-t border-gray-200" />

          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 text-lg font-normal hover:bg-white"
          >
            <LogOut className="!h-6 !w-6" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
