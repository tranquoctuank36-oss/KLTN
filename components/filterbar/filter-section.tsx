"use client";

import ProductGrid from "../products/products-grid";
import FilterBar from "./filterbar";


export default function FilterSection() {
  return (
    <section className="mx-auto max-w-[1440px] mx-auto px-6 lg:px-20 py-15">
      <h1 className="flex items-baseline gap-2 text-3xl font-bold tracking-tight">
        Luxury Eyewear Boutique{" "}
        <span className="relative -translate-y-0.5 text-black/70 text-xl font-medium">(927 Items)</span>
      </h1>

      <div className="mt-10">
        <FilterBar />
      </div>

      <ProductGrid />
    </section>
  );
}
