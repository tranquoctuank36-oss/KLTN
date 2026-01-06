import BannerSlider from "@/components/banner-slider";
import BrandListButton from "@/components/brandList-section";

import ProductGrid from "@/components/products/ProductGird";
import RecentlyViewedSection from "@/components/recently-viewed-section/recently-viewed-section";
import HotProductsSection from "@/components/hot-products-section/HotProductsSection";
import BestSellersSection from "@/components/best-sellers-section/BestSellersSection";
import TopRatedSection from "@/components/top-rated-section/TopRatedSection";

export default function HomePage() {
  return (
    <main>
      <BannerSlider />
      <BrandListButton />
      <BestSellersSection />
      <HotProductsSection />
      <TopRatedSection />
      <RecentlyViewedSection />
      {/* <ProductGrid /> */}
    </main>
  );
}
