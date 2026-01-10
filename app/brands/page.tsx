"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Brand } from "@/types/brand";
import { getBrands } from "@/services/brandsService";
import { Button } from "@/components/ui/button";
import { Routes } from "@/lib/routes";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getBrands({
      sortField: "name",
      sortOrder: "ASC",
      limit: 1000,
      search: searchTerm || undefined,
    })
      .then((data) => setBrands(data))
      .catch((err) => {
        console.log("Failed to fetch brands:", err);
        setBrands([]);
      });
  }, [searchTerm]);

  const filteredBrands = brands;

  const alphabet = Array.from(
    new Set(brands.map((b) => b.name.charAt(0).toUpperCase()))
  ).sort();

  return (
    <div className="max-w-full px-20 lg:px-30">
      {/* Banner */}
      <div className="relative w-full h-90 bg-gray-100">
        <Image
          src="/banner_brands.jpg"
          alt="Banner Thương Hiệu"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-start">
          <h1 className="text-2xl md:text-3xl font-bold text-black px-6 py-2 rounded-lg">
            Khám phá thế giới thương hiệu kính mắt
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="mt-10 relative w-full">
        <div
          className="group relative w-full border border-gray-500 rounded-full px-2 py-2 flex items-center 
             focus-within:border-sky-500 focus-within:border-2 transition bg-white"
        >
          <div
            className="p-3 rounded-full transition-colors 
               hover:bg-orange-100 group-hover:bg-orange-100 group-focus-within:bg-orange-100 "
          >
            <Search className="h-5 w-5 text-gray-600" />
          </div>

          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-gray-700 bg-transparent ml-3"
          />

          {searchTerm && (
            <Button
              onClick={() => setSearchTerm("")}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors drop-shadow-none w-9"
            >
              <X className="!h-5 !w-5 text-gray-500" />
            </Button>
          )}
        </div>

        {searchTerm && filteredBrands.length === 0 && (
          <div className="absolute left-0 right-0 mt-3 bg-white shadow-[0_0_6px_rgba(0,0,0,0.2)] rounded-lg p-4 text-gray-600 text-base font-medium">
            Không tìm thấy kết quả cho tìm kiếm của bạn.
          </div>
        )}
      </div>


      <div className="mt-14">
        <h2 className="text-lg font-bold mb-8">Thương Hiệu A-Z</h2>

        {/* Alphabet filter */}
        <div className="flex flex-wrap gap-3 mb-15">
          {alphabet.map((letter) => (
            <Button
              key={letter}
              onClick={() => {
                const section = document.getElementById(`section-${letter}`);
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-9 h-10 bg-gray-100 rounded-md hover:bg-gray-300 text-xl text-gray-700"
            >
              {letter}
            </Button>
          ))}
        </div>

        {/* Brands grouped */}
        <div className="space-y-8 mb-20">
          {alphabet.map(
            (letter) =>
              filteredBrands.filter(
                (b) => b.name.charAt(0).toUpperCase() === letter
              ).length > 0 && (
                <div
                  key={letter}
                  id={`section-${letter}`}
                  className="scroll-mt-40"
                >
                  <h3 className="font-semibold text-lg mb-3 bg-gray-100 pl-3">
                    {letter}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {filteredBrands
                      .filter((b) => b.name.charAt(0).toUpperCase() === letter)
                      .map((brand) => (
                        <Link
                          key={brand.id}
                          href={Routes.brand(brand.slug)}
                          className="px-5 py-2 border rounded-full hover:bg-gray-100 text-lg bg-white"
                        >
                          {brand.name}
                        </Link>
                      ))}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
