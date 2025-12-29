"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { ProductVariants } from "@/types/productVariants";
import { Routes } from "@/lib/routes";

type Props = {
  product: Product;
  selectedVariant: ProductVariants;
};

export default function Breadcrumb({ product, selectedVariant }: Props) {
  const brand = product.brand;

  const label =
    selectedVariant?.colors && selectedVariant.colors.length > 1
      ? selectedVariant.colors.map((c) => c.name).join(", ")
      : selectedVariant?.colors?.[0]?.name || "";

  return (
    <div className="flex items-center justify-between">
      {/* Breadcrumb Path */}
      <nav className="text-sm text-gray-500 space-x-1">
        <Link
          href={Routes.home()}
          className="text-xs font-medium hover:underline"
        >
          Home
        </Link>
        <span>›</span>
        <Link
          href={Routes.home()}
          className="text-xs font-medium hover:underline"
        >
          {product.productType.charAt(0).toUpperCase() +
            product.productType.slice(1)}
        </Link>

        <span>›</span>
        {brand && (
          <>
            <Link
              href={`/brand/${brand.slug}`}
              className="text-xs font-medium hover:underline"
            >
              {brand.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-xs">
          {product.name} {label}
        </span>
      </nav>

      {/* Brand */}
      {/* <div className="flex items-center gap-3">
        {brand && (
          <Link
            href={`/brand/${brand.slug}`}
            className="flex items-center text-2xl font-semibold"
          >
            {brand.name}  
          </Link>
        )}
      </div> */}
    </div>
  );
}
