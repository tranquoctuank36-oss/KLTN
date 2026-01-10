"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { ProductVariants } from "@/types/productVariants";
import ColorSelector from "../ui-common/colorSelector";

interface ProductPreviewCardCardProps {
  product: Product;
}

export default function ProductPreviewCard({
  product,
}: ProductPreviewCardCardProps) {
  const [hovered, setHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariants | null>(null);

  // Set default variant on mount
  useEffect(() => {
    if (product.variants?.length) {
      const defaultVariant = 
        product.variants.find((v: ProductVariants) => v.isDefault) || 
        product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product.variants]);

  if (!selectedVariant) {
    return null;
  }

  const displayImage =
    selectedVariant.images?.[0]?.publicUrl || "/products/default.jpg";
  const originalPrice = parseFloat(selectedVariant.originalPrice);
  const finalPrice = parseFloat(selectedVariant.finalPrice);
  const hasDiscount = originalPrice > finalPrice;

  const href = `/products/${product.slug}?variantId=${selectedVariant.id}`;

  return (
    <div
      className="relative bg-white rounded-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-gray-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={href} className="block">
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

        {/* Color Selector - Above Product Name */}
        <div className="px-2 pb-1 flex justify-center items-center h-8">
          {!hovered ? (
            <span className="text-gray-400 text-xs">
              {product.variants?.filter((v) => v?.colors && v.colors.length > 0)
                .length || 0}{" "}
              màu
            </span>
          ) : selectedVariant?.colors?.length && product.variants ? (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="scale-75"
            >
              <ColorSelector
                variants={product.variants}
                selected={selectedVariant}
                onSelect={(variant) => setSelectedVariant(variant)}
              />
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Không có màu</span>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 pb-4 text-center">
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
      </Link>
    </div>
  );
}
