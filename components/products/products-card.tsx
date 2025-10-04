"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Video } from "lucide-react";
import { Product, ProductImageSet } from "@/types/product";
import { Routes } from "@/lib/routes";
import ColorSelector from "../colorSelector";
import { fetchProduct } from "@/services/productService";

type Props = {
  product?: Product;   // Có thể truyền trực tiếp product
  slug?: string;       // Hoặc chỉ truyền slug để component tự fetch
};

export default function ProductCard({ product: productProp, slug }: Props) {
  const [product, setProduct] = useState<Product | null>(productProp || null);
  const [loading, setLoading] = useState(!productProp);

  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ProductImageSet | null>(null);

  // Nếu không có product prop mà có slug thì fetch
  useEffect(() => {
    if (productProp) return; // đã có product thì bỏ qua
    if (!slug) return;

    setLoading(true);
    fetchProduct(slug)
      .then((res) => {
        setProduct(res);
        if (res.images?.length) {
          setSelectedColor(res.images[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, productProp]);

  // Nếu product đã có mà selectedColor chưa set → set lần đầu
  useEffect(() => {
    if (product && !selectedColor && product.images?.length) {
      setSelectedColor(product.images[0]);
    }
  }, [product, selectedColor]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow text-center">
        Loading product...
      </div>
    );
  }

  if (!product || !selectedColor) {
    return (
      <div className="bg-white rounded-xl p-6 shadow text-center text-red-500">
        Product not found
      </div>
    );
  }

  const currentImage =
    selectedColor.images.find((img) => img.id === (hovered ? "front" : "sideAngle"))?.url ||
    selectedColor.images[0].url;

  const href = Routes.product(product.slug);

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden transition flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/2] w-full bg-gray-50 flex items-center justify-center rounded-xl pb-15">
        <Link href={href} aria-label={product.name} className="w-full">
          <Image
            src={currentImage}
            alt={`${product.name} - ${selectedColor.label || "default"}`}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto object-contain max-h-full transition-opacity duration-300 cursor-pointer"
            priority={false}
          />
        </Link>

        {/* Sale badge + like button */}
        <div className="absolute inset-x-3 top-3 z-20 flex items-center justify-between">
          {product.sale ? (
            <span className="bg-red-50 text-red-500 border border-red-200 text-sm px-3 py-1 rounded font-medium">
              Sale
            </span>
          ) : (
            <span />
          )}

          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLiked((s) => !s);
            }}
            aria-pressed={liked}
            aria-label={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            className={`flex items-center justify-center !w-8 !h-8 !bg-gray-50 shadow-none transition-transform hover:scale-105 !p-0
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

        {/* Color selector */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          {!hovered ? (
            <span className="text-gray-400 text-sm">
              {product.images.length} colors
            </span>
          ) : (
            <ColorSelector
              images={product.images}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
          )}
        </div>
      </div>

      {/* INFO */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <Link href={href} className="inline-block hover:no-underline">
            <h3 className="text-base font-bold cursor-pointer">{product.name}</h3>
          </Link>

          <div className="text-sm text-gray-600">
            {product.oldPrice && (
              <span className="line-through text-gray-400 mr-1">
                ${product.oldPrice}
              </span>
            )}
            <span className={product.sale ? "text-red-600 font-semibold" : ""}>
              ${product.price}
            </span>{" "}
            <span className="text-gray-400">Including lenses</span>
          </div>
        </div>

        {/* Hover buttons */}
        <div
          className={`mt-4 flex gap-2 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Button
            variant="outline"
            size="sm"
            className="flex-1 flex items-center gap-2 border-2 border-blue-500 text-blue-500 hover:border-blue-700 hover:text-blue-700 hover:bg-white"
          >
            <Copy size={16} className="transition-colors" />
            <span className="font-bold">Similar Frames</span>
          </Button>

          <Button
            size="sm"
            className="flex-1 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Video size={16} />
            <span className="font-bold">Live Try On</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
