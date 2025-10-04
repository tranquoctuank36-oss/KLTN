"use client";


import { BRANDS } from "@/mocks/brands-mock";
import BrandCard from "./brand-card";

export default function BrandSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10">
      <h2 className="font-sans font-light text-center text-3xl md:text-4xl mb-10">
        Discover the brands
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {BRANDS.slice(0, 6).map((b) => (
          <BrandCard key={b.slug} brand={b} />
        ))}
      </div>
    </section>
  );
}
