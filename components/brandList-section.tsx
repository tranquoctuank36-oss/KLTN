"use client";

import Link from "next/link";
import { Routes } from "@/lib/routes";
import { Brand } from "@/types/brand";
import { useEffect, useState } from "react";
import { getBrands } from "@/services/brandsService";

export default function BrandListButton() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    getBrands({
      sortField: "priority",
      sortOrder: "ASC",
      limit: 7,
    })
      .then((allBrands) => {
        setBrands(allBrands);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="container mx-auto pt-10 pb-10">
      <div className="flex flex-wrap justify-center gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={Routes.brand(brand.slug)}
            className="flex items-center border rounded-full px-6 py-2 bg-gray-200 
                       hover:drop-shadow-md hover:bg-white/80 transition font-medium text-gray-500"
            aria-label={`Xem Bộ Sưu Tập ${brand.name}`}
          >
            {brand.name}
          </Link>
        ))}

        <Link
          href={Routes.brands()}
          className="flex items-center border rounded-full px-6 py-2 bg-gray-200 text-gray-800 
                     font-medium hover:drop-shadow-md hover:bg-white/80 transition"
        >
          Tất cả thương hiệu
        </Link>
      </div>
    </section>
  );
}
