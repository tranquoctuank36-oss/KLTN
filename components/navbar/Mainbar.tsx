"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import LoginMenu from "./LoginMenu";
import { useCart } from "@/context/CartContext";
import { Routes } from "@/lib/routes";
import { useEffect, useState } from "react";
import { Brand } from "@/types/brand";
import { Category } from "@/types/categories";
import { getBrands } from "@/services/brandsService";
import { getCategoriesTree } from "@/services/categoryService";
import GlobalSearch from "../search/GlobalSearch";

export default function Mainbar() {
  const { totalQuantity } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [randomBrands, setRandomBrands] = useState<Brand[]>([]);

  useEffect(() => {
    // Lấy danh sách categories
    getCategoriesTree(2)
      .then((data) => {
        console.log("Categories data từ API:", data);
        setCategories(data);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });

    // Lấy danh sách brands
    getBrands({
      sortField: "priority",
      sortOrder: "ASC",
      limit: 15,
    })
      .then((data) => {
        const valid = (Array.isArray(data) ? data : []).filter(
          (b: Brand) => b && b.id != null && b.name && b.slug
        );
        setRandomBrands(valid);
      })
      .catch((err) => {
        console.error("Failed to fetch brands:", err);
      });
  }, []);

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-2 flex flex-wrap items-center relative">
      {/* Logo */}
      <div className="flex-shrink-0">
        <a href={Routes.home()} className="block">
          <Image
            src="/glasses_logo.png"
            alt="Logo Cửa Hàng"
            width={60}
            height={60}
          />
        </a>
      </div>

      {/* Menu */}
      <div className="flex flex-1 justify-start items-center gap-4 text-gray-600 font-normal text-lg ml-10">
        {/* Hiển thị categories động từ API */}
        {categories.map((category) => {
          const hasChildren = category.children && category.children.length > 0;
          // Đảm bảo URL luôn bắt đầu với /
          const categoryUrl = category.relativeUrl?.startsWith('/') 
            ? category.relativeUrl 
            : `/${category.relativeUrl || ''}`; 
          
          if (hasChildren) {
            return (
              <div key={category.id} className="relative group flex hover:font-medium">
                <Link
                  href={categoryUrl || "/"}
                  className="px-2 group-hover:text-gray-800 transition relative hover:cursor-pointer"
                >
                  {category.name}
                  <span className="absolute left-0 -bottom-5 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform cursor-pointer"></span>
                </Link>

                {/* Dropdown panel for children */}
                <div
                  className="absolute left-0 top-full mt-6 
                    min-w-[600px] bg-white p-6 shadow-xl rounded-md
                    opacity-0 group-hover:opacity-100 invisible group-hover:visible 
                    transition-all duration-300 ease-out 
                    before:content-[''] before:absolute before:-top-6 before:left-0 before:w-full before:h-6 before:bg-transparent
                    overflow-visible z-50"
                >
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base font-normal">
                    {category.children?.map((childCategory) => {
                      // Level 1: Map sang productTypes filter
                      const childFilterUrl = `/products?productTypes=${encodeURIComponent(childCategory.slug)}`;
                      
                      return (
                        <div key={childCategory.id} className="space-y-2">
                          <Link
                            href={childFilterUrl}
                            className="font-semibold text-gray-800 hover:underline underline-offset-4 block"
                          >
                            {childCategory.name}
                          </Link>
                          {/* Hiển thị sub-children nếu có */}
                          {childCategory.children && childCategory.children.length > 0 && (
                            <div className="pl-4 space-y-1">
                              {childCategory.children?.map((subChild) => {
                                // Level 2: Extract gender từ slug (VD: "kinh-mat-nam" -> "nam")
                                // Lấy phần cuối cùng sau dấu gạch nối cuối
                                const genderSlug = subChild.slug.split('-').pop() || subChild.slug;
                                const subChildFilterUrl = `/products?productTypes=${encodeURIComponent(childCategory.slug)}&genders=${encodeURIComponent(genderSlug)}`;
                                
                                return (
                                  <Link
                                    key={subChild.id}
                                    href={subChildFilterUrl}
                                    className="block text-sm text-gray-600 hover:text-gray-800 hover:underline underline-offset-4"
                                  >
                                    {subChild.name}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // Category không có children
          return (
            <Link 
              key={category.id} 
              href={categoryUrl || "/"}
            >
              {category.name}
            </Link>
          );
        })}

        {/* Brands dropdown */}
        <div className="relative group flex hover:font-medium">
          <Link
            href={Routes.brands()}
            className="px-2 group-hover:text-gray-800 transition relative hover:cursor-pointer"
          >
            Thương Hiệu
            <span className="absolute left-0 -bottom-5 w-full h-[2px] bg-black scale-x-0 group-hover:scale-x-100 transition-transform"></span>
          </Link>

          {/* Dropdown panel */}
          <div
            className="absolute left-0 top-full mt-6 
              w-[520px] bg-white p-4 shadow-xl rounded-md
              opacity-0 group-hover:opacity-100 invisible group-hover:visible 
              transition-all duration-300 ease-out 
              before:content-[''] before:absolute before:-top-6 before:left-0 before:w-full before:h-6 before:bg-transparent
              overflow-visible z-50"
          >
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-base font-normal max-h-[350px] overflow-y-auto">
              {randomBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={Routes.brand(brand.slug)}
                  className="hover:underline underline-offset-4 hover:text-gray-800 hover:font-medium"
                >
                  {brand.name}
                </Link>
              ))}
              <Link
                href={Routes.brands()}
                className="font-medium hover:underline underline-offset-4 text-gray-800"
              >
                Tất cả Thương Hiệu
              </Link>
            </div>
          </div>
        </div>
        
        {/* Sale link with hover effect */}
        <div className="relative group flex hover:font-medium">
          <Link
            href={Routes.sale()}
            className="px-2 text-red-500 group-hover:text-red-600 transition relative hover:cursor-pointer"
          >
            Khuyến Mãi
            <span className="absolute left-0 -bottom-5 w-full h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
          </Link>
        </div>
      </div>

      {/* Right icons */}
      <div className="flex flex-wrap justify-center items-center gap-6">
        {/* Search */}
        <GlobalSearch className="flex-1" limit={6} />

        {/* Cart */}
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
              Giỏ hàng
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black"></span>
            </span>
          </div>
        </Link>

        <LoginMenu />
      </div>
    </div>
  );
}
