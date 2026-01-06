"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RecentlyViewedCard from "../recently-viewed-section/recently-viewed-card";
import { Product } from "@/types/product";
import { searchProductsElastic } from "@/services/productService";

type BrandProductsSectionProps = {
  brandName?: string;
  excludeProductId?: string;
};

export default function BrandProductsSection({
  brandName,
  excludeProductId,
}: BrandProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBrandProducts = async () => {
      if (!brandName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch products from the same brand
        const result = await searchProductsElastic({
          page: 1,
          limit: 20, // Lấy nhiều hơn để có thể random và exclude
          brands: [brandName],
          sortField: "newest", // Valid: price, newest, popular
          sortOrder: "DESC", // Valid: ASC, DESC
        });

        // Filter out current product and randomly select 8 products
        let filteredProducts = result.data || [];
        
        if (excludeProductId) {
          filteredProducts = filteredProducts.filter(
            (p) => p.id !== excludeProductId
          );
        }

        // Randomly shuffle and take 8 products
        const shuffled = filteredProducts.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 8);

        setProducts(selected);
      } catch (error) {
        console.error("Failed to load brand products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadBrandProducts();
  }, [brandName, excludeProductId]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Show loading skeleton
  if (loading) {
    return (
      <section className="max-w-full px-20 lg:px-30 py-16 bg-white">
        <div className="mb-8">
          <div className="h-9 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-none w-72">
              <div className="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Hide if no products
  if (products.length === 0) return null;

  return (
    <section className="max-w-full px-20 lg:px-30 py-16 bg-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Sản phẩm cùng thương hiệu
        </h2>
      </div>

      <div className="relative">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-none w-72">
              <RecentlyViewedCard product={product} />
            </div>
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
