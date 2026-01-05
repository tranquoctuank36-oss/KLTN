import BannerSlider from "@/components/banner-slider";
import BenefitsSection from "@/components/benefits-section/benefits-section";
import BrandSection from "@/components/brand-section/brand-section";
import BrandListButton from "@/components/brandList-section";
import FilterSection from "@/components/filterbar/FilterSection";
import NeedSection from "@/components/need-section/need-section";
import ProductGrid from "@/components/products/ProductGird";
import RecentlyViewedSection from "@/components/recently-viewed-section/recently-viewed-section";

export default function HomePage() {
  return (
    <main>
      <BannerSlider />
      <BrandListButton/>
      {/* <BrandSection /> */}
      <NeedSection />
      <RecentlyViewedSection />
      <BenefitsSection />
      <ProductGrid />
    </main>
  );
}
