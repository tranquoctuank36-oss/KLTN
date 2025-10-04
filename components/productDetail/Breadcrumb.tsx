"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BRANDS } from "@/mocks/brands-mock";
import { Product, ProductImageSet } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Routes } from "@/lib/routes";

type Props = {
  product: Product;
  selected: ProductImageSet;
};

export default function Breadcrumb({ product, selected }: Props) {
  const brand = BRANDS.find((b) => b.slug === product.brandSlug);
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex items-center justify-between">
      {/* Breadcrumb Path */}
      <nav className="text-sm text-gray-500 space-x-1">
        <Link href={Routes.home()} className="text-xs font-medium hover:underline">
          Home
        </Link>
        <span>›</span>
        <Link href="/eyeglasses" className="text-xs font-medium hover:underline">
          Eyeglasses
        </Link>
        <span>›</span>
        {brand && (
          <>
            <Link href={`/brand/${brand.slug}`} className="text-xs font-medium hover:underline">
              {brand.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-xs">
          {product.name} {selected.label}
        </span>
      </nav>

      {/* Brand + Like button */}
      <div className="flex items-center gap-3">
        {brand && (
          <Link href={`/brand/${brand.slug}`} className="flex items-center">
            {brand.logo && (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={60}
                height={60}
                className="w-12 object-contain"
              />
            )}
          </Link>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            setLiked((s) => !s);
          }}
          aria-pressed={liked}
          aria-label={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          className={`flex items-center justify-center shadow-none !w-8 !h-8 transition-transform hover:scale-105 !p-0
            ${
              liked
                ? "border-red-200 text-red-600"
                : "bg-white/90 border-gray-200 text-gray-400"
            }`}
        >
          <Heart
            className="!w-6 !h-6"
            strokeWidth={1.5}
            stroke={liked ? "red" : "gray"}
            fill={liked ? "red" : "transparent"}
          />
        </Button>
      </div>
    </div>
  );
}
