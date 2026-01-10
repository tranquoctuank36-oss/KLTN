"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Video } from "lucide-react";
import { Product } from "@/types/product";
import { Routes } from "@/lib/routes";
import { getProductBySlug, getSimilarProducts } from "@/services/productService";
import ColorSelector from "../ui-common/colorSelector";
import { ProductVariants } from "@/types/productVariants";
import SimilarFramesDrawer from "./SimilarFramesDrawer";

type Props = {
  product?: Product;
  slug?: string;
};

export default function ProductCard({ product: productProp, slug }: Props) {
  const [product, setProduct] = useState<Product | null>(productProp || null);
  const [loading, setLoading] = useState(!productProp);
  const [hovered, setHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSimilarFrames, setShowSimilarFrames] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariants | null>(null);

  useEffect(() => {
    if (!productProp) return;
    setProduct(productProp);
    if (productProp.variants?.length) {
      const def =
        (productProp.variants as any[]).find((v) => v.isDefault) ||
        productProp.variants[0];
      setSelectedVariant(def);
    } else {
      console.warn("⚠️ No variants found for product:", productProp.name);
    }
  }, [productProp]);

  useEffect(() => {
    if (productProp || !slug) return;
    setLoading(true);
    getProductBySlug(slug)
      .then((res) => {
        if (!res) {
          setError("Sản phẩm không tìm thấy");
          return;
        }
        setProduct(res);
        if (res.variants?.length) {
          const def =
            (res.variants as any[]).find((v) => v.isDefault) || res.variants[0];
          setSelectedVariant(def);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, productProp]);

  // Fetch similar products when drawer opens
  useEffect(() => {
    if (showSimilarFrames && product?.id && similarProducts.length === 0) {
      setLoadingSimilar(true);
      getSimilarProducts(product.id, 20)
        .then((products) => setSimilarProducts(products))
        .finally(() => setLoadingSimilar(false));
    }
  }, [showSimilarFrames, product?.id, similarProducts.length]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow animate-pulse">
        <div className="aspect-[4/2] bg-gray-200 rounded-xl mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white rounded-xl p-6 shadow text-center">
        <div className="text-red-500 mb-2">
          {error || "Sản phẩm không có sẵn"}
        </div>
      </div>
    );
  }

  // If no variant selected, try to get first variant or create a mock one
  const activeVariant =
    selectedVariant || (product.variants?.[0] as any) || null;

  const finalPrice = Number(activeVariant?.finalPrice || 0);
  const originalPrice = Number(activeVariant?.originalPrice || 0);
  const isOnSale =
    originalPrice > 0 && finalPrice > 0 && originalPrice > finalPrice;

  const variantImages =
    activeVariant?.images || activeVariant?.productImages || [];
  const defaultImage = variantImages[0]?.publicUrl || null;
  const hoverImage = variantImages[1]?.publicUrl || defaultImage;
  const currentImage = hovered ? hoverImage : defaultImage;

  const href = activeVariant?.id
    ? Routes.product(product.slug, activeVariant.id)
    : Routes.product(product.slug);

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden transition flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/2] w-full bg-gray-50 flex items-center justify-center rounded-xl pb-15">
        <Link
          href={href}
          aria-label={product.name}
          className="group block w-full bg-gray-50"
        >
          {currentImage ? (
            <div className="relative w-full h-[250px] aspect-square overflow-hidden">
              {/* Base image */}
              <Image
                src={currentImage}
                alt={product.name}
                fill
                sizes="100vw"
                className="object-contain mix-blend-multiply transition-opacity duration-500 ease-out opacity-100 group-hover:opacity-0"
                priority={false}
              />

              {/* Hover image */}
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} - hover`}
                  fill
                  sizes="100vw"
                  className="object-contain mix-blend-multiply transition-opacity duration-500 ease-out opacity-0 group-hover:opacity-100"
                  priority={false}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-[200px] flex items-center justify-center bg-gray-100 text-gray-400">
              Không có ảnh
            </div>
          )}
        </Link>

        {/* Sale badge + like */}
        <div className="absolute inset-x-3 top-3 z-20 flex items-center justify-end">
          {isOnSale ? (
            <span className="bg-red-50 text-red-500 border border-red-200 text-sm px-3 py-1 rounded font-medium">
              Khuyến mãi
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Color selector */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          {!hovered ? (
            <span className="text-gray-400 text-sm">
              {product.variants?.filter((v) => v?.colors && v.colors.length > 0)
                .length || 0}{" "}
              màu
            </span>
          ) : activeVariant?.colors?.length && product.variants ? (
            <ColorSelector
              variants={product.variants}
              selected={activeVariant}
              onSelect={(variant) => setSelectedVariant(variant)}
            />
          ) : (
            <span className="text-gray-400 text-sm">Không có màu</span>
          )}
        </div>
      </div>

      {/* INFO */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <Link href={href} className="inline-block hover:no-underline">
            <h3 className="text-xl font-semibold cursor-pointer">
              {product.name}
            </h3>
          </Link>

          <div className="text-sx text-gray-600 mb-3">
            {isOnSale && originalPrice > 0 && (
              <span className="line-through text-gray-400 mr-1">
                {originalPrice.toLocaleString("en-US")}đ
              </span>
            )}
            <span className={isOnSale ? "text-red-600 font-semibold" : ""}>
              {finalPrice.toLocaleString("en-US")}đ
            </span>{" "}
          </div>

          {/* Action Buttons */}
          <div
            className={`flex gap-2 mt-auto transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Button
              variant="outline"
              className="flex-1 border-2 border-blue-500 hover:border-blue-700 text-blue-600 hover:bg-white hover:text-blue-800"
              onClick={(e) => {
                e.preventDefault();
                setShowSimilarFrames(true);
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              <div className="text-base">Gọng kính tương tự</div>
            </Button>
          </div>
        </div>
      </div>

      {/* Similar Frames Drawer */}
      <SimilarFramesDrawer
        isOpen={showSimilarFrames}
        onClose={() => {
          setShowSimilarFrames(false);
          setHovered(false); // Hide Similar Frames button when drawer closes
        }}
        similarProducts={similarProducts}
        loading={loadingSimilar}
      />
    </div>
  );
}
