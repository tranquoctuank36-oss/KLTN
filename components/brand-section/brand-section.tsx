"use client";

import { useEffect, useState } from "react";
import BrandCard from "./brand-card";
import { Brand } from "@/types/brand";
import { getBrands } from "@/services/brandsService";

export default function BrandSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands({
      sortField: "priority",
      sortOrder: "DESC",
      limit: 6,
    })
      .then((res) => {
        setBrands(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-full px-20 lg:px-30 py-10 mx-auto">
      <h2 className="font-sans font-light text-center text-3xl md:text-4xl mb-10">
        Khám phá các thương hiệu
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Đang tải các thương hiệu...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {brands.map((b) => (
            <BrandCard key={b.slug} brand={b} />
          ))}
        </div>
      )}
    </section>
  );
}
