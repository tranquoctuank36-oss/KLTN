"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

interface RecentlyViewedCardProps {
  product: Product;
}

export default function RecentlyViewedCard({
  product,
}: RecentlyViewedCardProps) {
  // Lấy variant đầu tiên để hiển thị giá và hình ảnh
  const firstVariant = product.variants[0];

  if (!firstVariant) {
    return null;
  }

  const displayImage =
    firstVariant.images?.[0]?.publicUrl || "/products/default.jpg";
  const originalPrice = parseFloat(firstVariant.originalPrice);
  const finalPrice = parseFloat(firstVariant.finalPrice);
  const hasDiscount = originalPrice > finalPrice;

  return (
    <Link
      href={`/products/${product.slug}?variantId=${firstVariant.id}`}
      className="group block"
    >
      <div className="relative bg-white rounded-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-gray-200">
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden max-h-40">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
              Khuyến mãi
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-center gap-2">
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {originalPrice.toLocaleString("en-US")}₫
              </span>
            )}
            <span className="text-lg font-bold text-gray-900">
              {finalPrice.toLocaleString("en-US")}₫
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
