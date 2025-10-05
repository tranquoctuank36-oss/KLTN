"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Search } from "lucide-react";
import LoginMenu from "./LoginMenu";
import { useCart } from "@/context/CartContext";
import { Routes } from "@/lib/routes";

export default function Mainbar() {
  const { totalQuantity } = useCart();

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-2 flex flex-wrap items-center">
      <div className="flex-shrink-0">
        <a href={Routes.home()} className="block">
          <Image
            src="/glasses_logo.png"
            alt="GlassesShop"
            width={60}
            height={60}
          />
        </a>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-gray-600 font-medium flex-1">
        <Link href="#">Eyeglasses</Link>
        <Link href="#">Sunglasses</Link>
        <Link href="#">Brands</Link>
        <Link href="#">Contacts</Link>
        <Link href="#">Lenses</Link>
        <Link href="#">Stores</Link>
        <Link href="#" className="text-red-500">
          Sale
        </Link>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="I’m Searching For..."
            className="w-full sm:w-64 rounded-full border px-4 py-2 pl-10 text-sm bg-gray-200"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
        </div>

        <Heart className="cursor-pointer" />
        <Link
          href={Routes.cart()}
          className="relative flex flex-col items-center group"
        >
          <div className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100">
            <ShoppingCart className="w-6 h-6" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalQuantity}
              </span>
            )}
          </div>

          <div className="absolute top-12 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="relative bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
              Cart
              <span
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 
                       border-l-4 border-r-4 border-b-4 border-transparent border-b-black"
              ></span>
            </span>
          </div>
        </Link>

        <LoginMenu />
      </div>
    </div>
  );
}
