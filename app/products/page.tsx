"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ProductGrid from "@/components/products/ProductGird";
import type { ElasticSearchFilters } from "@/services/productService";

// Map slug sang API value
const SLUG_TO_PRODUCT_TYPE: Record<string, string> = {
  "gong-kinh": "eyeglasses",
  "kinh-mat": "sunglasses",
  "eyeglasses": "eyeglasses",
  "sunglasses": "sunglasses",
};

const SLUG_TO_GENDER: Record<string, string> = {
  "nam": "male",
  "nu": "female",
  "unisex": "unisex",
  "tre-em": "kid",
  "male": "male",
  "female": "female",
  "kid": "kid",
};

export default function ProductsPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Parse filters từ query params
  const initialFilters = useMemo<Partial<ElasticSearchFilters>>(() => {
    const filters: Partial<ElasticSearchFilters> = {};

    // productTypes (Loại sản phẩm: Gọng kính, Kính mát)
    const productTypes = searchParams.get("productTypes");
    if (productTypes) {
      filters.productTypes = productTypes
        .split(",")
        .map(slug => SLUG_TO_PRODUCT_TYPE[slug] || slug)
        .filter(Boolean);
    }

    // genders (Giới tính: Nam, Nữ, Unisex)
    const genders = searchParams.get("genders");
    if (genders) {
      filters.genders = genders
        .split(",")
        .map(slug => SLUG_TO_GENDER[slug] || slug)
        .filter(Boolean);
    }

    // brands
    const brands = searchParams.get("brands");
    if (brands) {
      filters.brands = brands.split(",");
    }

    // search query
    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }

    return filters;
  }, [searchParams]);

  // Tạo title động dựa trên filter
  const pageTitle = useMemo(() => {
    const typeMap: Record<string, string> = {
      eyeglasses: "Gọng kính",
      sunglasses: "Kính mát",
    };
    
    const genderMap: Record<string, string> = {
      male: "Nam",
      female: "Nữ",
      unisex: "Unisex",
      kid: "Trẻ em",
    };

    // Kết hợp productType + gender
    if (initialFilters.productTypes?.length && initialFilters.genders?.length) {
      const productType = typeMap[initialFilters.productTypes[0]] || "Sản phẩm";
      const gender = genderMap[initialFilters.genders[0]] || "";
      return `${productType} ${gender}`.trim();
    }
    
    // Chỉ có productType
    if (initialFilters.productTypes?.length) {
      return typeMap[initialFilters.productTypes[0]] || "Sản phẩm";
    }
    
    // Chỉ có gender
    if (initialFilters.genders?.length) {
      return genderMap[initialFilters.genders[0]] || "Sản phẩm";
    }
    
    // Search
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
          <p className="text-xl md:text-2xl text-left max-w-2xl text-gray-800">
            Khám phá nhiều mẫu kính thời trang 
            <br />
            từ các thương hiệu nổi tiếng
          </p>
        </div>
      </section>

      {/* Products Grid with Filters */}
      <section>
        <ProductGrid title={pageTitle} initialFilters={initialFilters} />
      </section>

      {/* Features Section */}
      {/* <section className="bg-white py-16">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chính hãng 100%</h3>
              <p className="text-gray-600">
                Tất cả sản phẩm đều được nhập khẩu chính hãng
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Thanh toán an toàn</h3>
              <p className="text-gray-600">
                Hỗ trợ nhiều phương thức thanh toán tiện lợi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Miễn phí vận chuyển</h3>
              <p className="text-gray-600">
                Giao hàng miễn phí cho đơn hàng từ 500.000đ
              </p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
