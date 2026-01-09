"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Routes } from "@/lib/routes";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Brand } from "@/types/brand";
import { Category } from "@/types/categories";
import { getBrands } from "@/services/brandsService";
import { getCategoriesTree } from "@/services/categoryService";
import GlobalSearch from "../search/GlobalSearch";

// ✅ LoginMenu chỉ render ở client để tránh hydration mismatch do auth/dialog/radix
const LoginMenu = dynamic(() => import("./LoginMenu"), { ssr: false });

export default function Mainbar() {
  const { totalQuantity } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [randomBrands, setRandomBrands] = useState<Brand[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Lấy danh sách categories
    getCategoriesTree(2)
      .then((data) => {
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
    <div className="mx-auto max-w-full px-20 lg:px-30 py-2 flex flex-wrap items-center relative">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link href={Routes.home()} className="block">
          <Image
            src="/glasses_logo.png"
            alt="Logo Cửa Hàng"
            width={60}
            height={60}
            priority
          />
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-1 justify-start items-center gap-4 text-gray-600 font-normal text-lg ml-10">
        {/* Hiển thị root category (Sản phẩm) */}
        {categories.map((category) => {
          const hasChildren = category.children && category.children.length > 0;
          const categoryUrl = category.relativeUrl?.startsWith("/")
            ? category.relativeUrl
            : `/${category.relativeUrl || ""}`;

          // ✅ chỉ đọc searchParams/tính active khi mounted để tránh SSR/CSR lệch nhau
          const productTypesParam = mounted ? searchParams.get("productTypes") : null;
          const sourceParam = mounted ? searchParams.get("source") : null;

          // Chỉ active khi vào trang /products không có productTypes HOẶC khi chọn từ dropdown
          const isActive =
            mounted &&
            ((pathname === categoryUrl && !productTypesParam) ||
              (pathname?.startsWith("/products") && sourceParam === "dropdown"));

          if (hasChildren) {
            return (
              <div key={category.id} className="relative group flex">
                <Link
                  href={categoryUrl || "/"}
                  className={`px-2 transition relative hover:cursor-pointer ${
                    isActive
                      ? "text-gray-800 font-medium"
                      : "group-hover:text-gray-800 group-hover:font-medium"
                  }`}
                >
                  {category.name}
                  <span
                    className={`absolute left-0 -bottom-5 w-full h-[2px] bg-black transition-transform cursor-pointer ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
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
                      // Sử dụng relativeUrl từ API thay vì xử lý slug
                      const childFilterUrl = childCategory.relativeUrl?.startsWith("/")
                        ? `${childCategory.relativeUrl}&source=dropdown`
                        : `/${childCategory.relativeUrl}&source=dropdown`;

                      return (
                        <div key={childCategory.id} className="space-y-2">
                          <Link
                            href={childFilterUrl}
                            className="font-semibold text-gray-800 hover:underline underline-offset-4 block"
                          >
                            {childCategory.name}
                          </Link>

                          {childCategory.children && childCategory.children.length > 0 && (
                            <div className="pl-4 space-y-1">
                              {childCategory.children?.map((subChild) => {
                                // Sử dụng relativeUrl từ API - đã có query params chính xác
                                const subChildFilterUrl = subChild.relativeUrl?.startsWith("/")
                                  ? `${subChild.relativeUrl}&source=dropdown`
                                  : `/${subChild.relativeUrl}&source=dropdown`;

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

          return (
            <Link key={category.id} href={categoryUrl || "/"} className="px-2">
              {category.name}
            </Link>
          );
        })}

        {/* Hiển thị các categories cấp 1 (Gọng kính, Kính mát) */}
        {categories.flatMap((category) => category.children || []).map((level1Category) => {
          const level1Url = `/products?productTypes=${encodeURIComponent(level1Category.slug)}`;

          const productTypesParam = mounted ? searchParams.get("productTypes") : null;
          const sourceParam = mounted ? searchParams.get("source") : null;

          // Active khi chọn trực tiếp level 1 category (không qua dropdown)
          const isActive =
            mounted &&
            pathname === "/products" &&
            productTypesParam === level1Category.slug &&
            sourceParam !== "dropdown";

          return (
            <div key={level1Category.id} className="relative group flex">
              <Link
                href={level1Url}
                className={`px-2 transition relative ${
                  isActive
                    ? "text-gray-800 font-medium"
                    : "group-hover:text-gray-800 group-hover:font-medium"
                }`}
              >
                {level1Category.name}
                <span
                  className={`absolute left-0 -bottom-5 w-full h-[2px] bg-black transition-transform ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </div>
          );
        })}

        {/* Brands dropdown */}
        <div className="relative group flex">
          <Link
            href={Routes.brands()}
            className={`px-2 transition relative hover:cursor-pointer ${
              mounted && pathname?.startsWith("/brands")
                ? "text-gray-800 font-medium"
                : "group-hover:text-gray-800 group-hover:font-medium"
            }`}
          >
            Thương hiệu
            <span
              className={`absolute left-0 -bottom-5 w-full h-[2px] bg-black transition-transform ${
                mounted && pathname?.startsWith("/brands")
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
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
                Tất cả Thương hiệu
              </Link>
            </div>
          </div>
        </div>

        {/* Sale link with hover effect */}
        <div className="relative group flex">
          <Link
            href={Routes.sale()}
            className={`px-2 transition relative hover:cursor-pointer ${
              mounted && pathname?.startsWith("/sale")
                ? "text-red-600 font-medium"
                : "text-red-500 group-hover:text-red-600 group-hover:font-medium"
            }`}
          >
            Khuyến mãi
            <span
              className={`absolute left-0 -bottom-5 w-full h-[2px] bg-red-600 transition-transform ${
                mounted && pathname?.startsWith("/sale")
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        </div>
      </div>

      {/* Right icons */}
      <div className="flex flex-wrap justify-center items-center gap-6">
        {/* Search */}
        <GlobalSearch className="flex-1" limit={6} />

        {/* Cart */}
        <Link href={Routes.cart()} className="relative flex flex-col items-center group">
          <div className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100">
            <ShoppingCart className="w-6 h-6" />
            {/* ✅ chỉ render badge sau mounted để tránh mismatch */}
            {mounted && totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {totalQuantity}
              </span>
            )}
          </div>
          <div className="absolute top-12 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="relative bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
              Giỏ hàng
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black" />
            </span>
          </div>
        </Link>

        <LoginMenu />
      </div>
    </div>
  );
}
