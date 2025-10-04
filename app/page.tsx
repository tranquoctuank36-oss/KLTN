import BannerSlider from "@/components/banner-slider";
import BenefitsSection from "@/components/benefits-section/benefits-section";
import BrandSection from "@/components/brand-section/brand-section";
import BrandListButton from "@/components/brandList-section";
import ChatFab from "@/components/chat";
import FilterSection from "@/components/filterbar/filter-section";
import NeedSection from "@/components/need-section/need-section";
import { BRANDS } from "@/mocks/brands-mock";

export default function HomePage() {
  return (
    <main>
      <BannerSlider />
      <BrandListButton brands={BRANDS}/>
      <BrandSection />
      <NeedSection />
      <BenefitsSection />
      <FilterSection />
      <ChatFab />
    </main>
  );
}
