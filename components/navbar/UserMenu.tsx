"use client";

import { useState } from "react";
import { User, LogOut, UserCircle, Undo2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Routes } from "@/lib/routes";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout: () => Promise<void> = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công!", {
        duration: 2000,
        position: "top-center",
      });
      setOpen(false);
      router.replace(Routes.home());
    } catch (err) {
      throw err;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <div className="h-6 border border-gray-400" />
        <SheetTrigger asChild>
          <Button className="!shadow-none flex items-center gap-2 !px-3 !py-6 text-black bg-white hover:bg-gray-100 drop-shadow-none">
            <User className="!h-6 !w-6" />
            <span className="text-base font-normal">
Xin chào, {user?.firstName?.trim() ? user.firstName : "Bạn"}
            </span>
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            Chào mừng trở lại, {user?.firstName?.trim() ? user.firstName : "Bạn"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-3">
          <hr className="border-b border-gray-200" />

          <Button variant="ghost" className="w-full justify-start gap-2 text-lg font-normal text-gray-500 hover:bg-white hover:font-semibold">
            <Link href={Routes.users()} onClick={() => setOpen(false)} className="flex items-center gap-3">
              <UserCircle className="!h-6 !w-6" />
              Tài Khoản Của Tôi
            </Link>
          </Button>

          <hr className="border-b border-gray-200" />

          <Button variant="ghost" className="w-full justify-start gap-2 text-lg font-normal text-gray-500 hover:bg-white hover:font-semibold">
            <Link href={`${Routes.users()}?section=my-orders`} onClick={() => setOpen(false)} className="flex items-center gap-3">
              <ShoppingBag className="!h-6 !w-6" />
              Lịch Sử Đơn Hàng
            </Link>
          </Button>

          <hr className="border-t border-gray-200" />

          <Button variant="ghost" className="w-full justify-start gap-2 text-lg font-normal text-gray-500 hover:bg-white hover:font-semibold gap-3">
            <Undo2 className="!h-6 !w-6 ml-1" />
            Trả Hàng
          </Button>

          <hr className="border-t border-gray-200" />

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 text-lg font-normal hover:bg-white hover:font-semibold gap-3"
          >
            <LogOut className="!h-6 !w-6 ml-1" />
            Đăng Xuất
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
