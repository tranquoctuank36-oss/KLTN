"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { getHotProducts, getProductBySlug } from "@/services/productService";
import ProductPreviewCard from "./ProductPreviewCard";

export default function HotProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHotProducts = async () => {
      try {
        setLoading(true);
        const result = await getHotProducts(8);
        
        // Fetch products sequentially with delay to avoid overwhelming the server
        const fullProducts: Product[] = [];
        for (let i = 0; i < result.length; i++) {
          try {
            const product = await getProductBySlug(result[i].slug);
            if (product) {
              fullProducts.push(product);
            } else {
              fullProducts.push(result[i]);
            }
          } catch (err) {
            console.warn(`Failed to fetch product ${result[i].slug}, using elastic result:`, err);
            fullProducts.push(result[i]);
          }
          
          // Add small delay between requests to prevent overwhelming server
          if (i < result.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        const validProducts = fullProducts.filter(
          (product): product is Product => product !== null
        );
        
        setProducts(validProducts);
      } catch (error) {
        console.error("Failed to load hot products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadHotProducts();
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
        <div className="mb-8 text-center justify-center">
          <div className="h-9 bg-gray-200 rounded w-80 animate-pulse mx-auto"></div>
        </div>
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
          Sản phẩm HOT
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
