import BannerSlider from "@/components/banner-slider";
import BrandListButton from "@/components/brandList-section";

import ProductGrid from "@/components/products/ProductGird";
import RecentlyViewedSection from "@/components/recently-viewed-section/recently-viewed-section";
import HotProductsSection from "@/components/hot-products-section/HotProductsSection";
import BestSellersSection from "@/components/best-sellers-section/BestSellersSection";
import TopRatedSection from "@/components/top-rated-section/TopRatedSection";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <main>
      <BannerSlider />
      <BrandListButton />
      
      {/* Load sections with Suspense to improve initial page load */}
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
      {/* <ProductGrid /> */}
    </main>
  );
}
