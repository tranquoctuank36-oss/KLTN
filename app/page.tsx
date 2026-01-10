import BannerSlider from "@/components/banner/banner-slider";
import BrandListSection from "@/components/brand/BrandListSection";

import RecentlyViewedSection from "@/components/product-sections/RecentlyViewedSection";
import HotProductsSection from "@/components/product-sections/HotProductsSection";
import BestSellersSection from "@/components/product-sections/BestSellersSection";
import TopRatedSection from "@/components/product-sections/TopRatedSection";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main>
      <BannerSlider />
      <BrandListSection />
      
      {/* Suspense để cải thiện tốc độ tải trang */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-50" />}>
        <BestSellersSection />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-50" />}>
        <HotProductsSection />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-50" />}>
        <TopRatedSection />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-50" />}>
        <RecentlyViewedSection />
      </Suspense>

    </main>
  );
}
