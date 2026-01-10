"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ProductGrid from "@/components/products/ProductGird";
import type { ElasticSearchFilters } from "@/services/productService";

// Map slug sang API value
const SLUG_TO_PRODUCT_TYPE: Record<string, string> = {
  "gong-kinh": "frame",
  "kinh-mat": "sunglasses",
};

const SLUG_TO_GENDER: Record<string, string> = {
  "nam": "male",
  "nu": "female",
  "tre-em": "kid",
};

function ProductsPageInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Kiểm tra xem productTypes có đến từ menu level 1 không
  const hideProductTypesSelection = useMemo(() => {
    const productTypes = searchParams.get("productTypes");
    const source = searchParams.get("source");
    // Ẩn selection productTypes trong UI khi đã chọn từ menu level 1
    return !!(productTypes && source !== "dropdown");
  }, [searchParams]);

  // Parse filters từ query params
  const initialFilters = useMemo<Partial<ElasticSearchFilters>>(() => {
    const filters: Partial<ElasticSearchFilters> = {};

    const productTypes = searchParams.get("productTypes");
    if (productTypes) {
      filters.productTypes = productTypes
        .split(",")
        .map((slug) => SLUG_TO_PRODUCT_TYPE[slug] || slug)
        .filter(Boolean);
    }

    const genders = searchParams.get("genders");
    if (genders) {
      filters.genders = genders
        .split(",")
        .map((slug) => SLUG_TO_GENDER[slug] || slug)
        .filter(Boolean);
    }

    const brands = searchParams.get("brands");
    if (brands) {
      filters.brands = brands.split(",").filter(Boolean);
    }

    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    return filters;
    // Phụ thuộc vào string để tránh object identity thay đổi
  }, [searchParams.toString()]);

  // Tạo title động dựa trên filter
  const pageTitle = useMemo(() => {
    const typeMap: Record<string, string> = {
      frame: "Gọng kính",
      sunglasses: "Kính mát",
    };

    const genderMap: Record<string, string> = {
      male: "Nam",
      female: "Nữ",
      unisex: "Unisex",
      kid: "Trẻ em",
    };

    if (initialFilters.productTypes?.length && initialFilters.genders?.length) {
      const productType = typeMap[initialFilters.productTypes[0]] || "Sản phẩm";
      const gender = genderMap[initialFilters.genders[0]] || "";
      return `${productType} ${gender}`.trim();
    }

    if (initialFilters.productTypes?.length) {
      return typeMap[initialFilters.productTypes[0]] || "Sản phẩm";
    }

    if (initialFilters.genders?.length) {
      const gender = genderMap[initialFilters.genders[0]] || "";
      return `Sản phẩm ${gender}`.trim();
    }

    if (initialFilters.search) {
      return `Kết quả cho "${initialFilters.search}"`;
    }

    return "Tất cả sản phẩm";
  }, [initialFilters]);

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <section className="relative w-full h-[400px] bg-gradient-to-r from-blue-600 to-purple-600">
        <Image
          src="/products-banner.png"
          alt="Bộ Sưu Tập Kính"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="relative z-10 pl-30 flex flex-col items-start justify-center h-full px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-left text-white">
            Bộ Sưu Tập Kính
          </h1>
          <p className="text-xl md:text-2xl text-left max-w-2xl text-gray-800 font-semibold">
            Khám phá nhiều mẫu kính thời trang
            <br />
            từ các thương hiệu nổi tiếng
          </p>
        </div>
      </section>

      {/* Products Grid with Filters */}
      <section>
        <ProductGrid title={pageTitle} initialFilters={initialFilters} hideProductTypesSelection={hideProductTypesSelection} />
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductsPageInner />
    </Suspense>
  );
}
