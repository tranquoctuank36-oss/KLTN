"use client";

import Link from "next/link";
import Image from "next/image";
import { Routes } from "@/lib/routes";
import { Brand } from "@/types/brand";

type Props = {
  brands: Brand[];
};

export default function BrandListButton({ brands }: Props) {
  return (
    <section className="container mx-auto pt-10 pb-10">
      <div className="flex flex-wrap justify-center gap-4">
        {brands.slice(0, 7).map((brand) => (
          <Link
            key={brand.slug}
            href={Routes.brand(brand.slug)}
            className="flex items-center border rounded-full px-6 py-2 bg-gray-200 
                       hover:shadow-md hover:bg-white transition"
            aria-label={`View ${brand.name} collection`}
          >
            <Image
              src={brand.logo}
              alt={`${brand.name} logo`}
              width={60}
              height={40}
              className="h-8 object-contain"
            />
          </Link>
        ))}

        <Link
          href={Routes.brands()}
          className="flex items-center border rounded-full px-6 py-2 bg-gray-200 text-gray-800 
                     font-medium hover:shadow-md hover:bg-white transition"
        >
          All Brands
        </Link>
      </div>
    </section>
  );
}
