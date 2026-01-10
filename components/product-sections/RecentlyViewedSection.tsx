"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import { getProductBySlug } from "@/services/productService";
import ProductPreviewCard from "./ProductPreviewCard";

export default function RecentlyViewedSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        setLoading(true);
        
        // Get product IDs from localStorage
        const recentlyViewed = getRecentlyViewed();
        
        if (recentlyViewed.length === 0) {
          setProducts([]);
          return;
        }

        // Fetch product details sequentially to avoid overwhelming server
        const validProducts: Product[] = [];
        const items = recentlyViewed.slice(0, 8); // Limit to 8 most recent products
        
        for (let i = 0; i < items.length; i++) {
          try {
            const product = await getProductBySlug(items[i].slug);
            if (product) {
              validProducts.push(product);
            }
          } catch (err) {
            console.warn(`Failed to fetch recently viewed product ${items[i].slug}:`, err);
          }
          
          // Add small delay between requests
          if (i < items.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        setProducts(validProducts);
      } catch (error) {
        console.error("Failed to load recently viewed products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();
  }, []);

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
      <section className="max-w-full px-20 lg:px-30 py-10 bg-white">
        {/* <div className="mb-8 text-center justify-center">
          <div className="h-9 bg-gray-200 rounded w-80 animate-pulse text-center justify-center"></div>
        </div> */}
        <div className="flex gap-6 overflow-hidden text-center justify-center">
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
    <section className="max-w-[1440px] px-20 lg:px-30 mx-auto py-16 bg-white">
      <div className="mb-8 text-center justify-center flex">
        <h2 className="text-3xl text-gray-900">
          Sản phẩm đã xem gần đây
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
              <ProductPreviewCard product={product} />
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
