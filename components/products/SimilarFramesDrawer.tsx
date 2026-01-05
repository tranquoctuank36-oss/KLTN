"use client";

import { X, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Routes } from "@/lib/routes";
import { useEffect, useState } from "react";
import { Product } from "@/types/product";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  similarProducts?: Product[];
  loading?: boolean;
};

export default function SimilarFramesDrawer({
  isOpen,
  onClose,
  similarProducts = [],
  loading = false,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[100] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Gọng kính tương tự</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Similar Products List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg border border-gray-100">
                    <div className="w-full h-60 bg-gray-200 rounded-t-lg" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : similarProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Không tìm thấy gọng kính tương tự
            </div>
          ) : (
            similarProducts.map((product, index) => {
              const variant = product.variants?.[0] as any;
              const productUrl = variant?.id
                ? Routes.product(product.slug, variant.id)
                : Routes.product(product.slug);
              const imageUrl =
                variant?.productImages?.[0]?.publicUrl ||
                variant?.images?.[0]?.publicUrl ||
                "/placeholder.png";
              const finalPrice = Number(variant?.finalPrice || 0);
              const originalPrice = Number(variant?.originalPrice || 0);
              const isOnSale = originalPrice > finalPrice;

              return (
                <Link
                  key={product.id}
                  href={productUrl}
                  onClick={onClose}
                  className={`block bg-white hover:shadow-lg transition-all duration-300 rounded-lg hover:bg-gray-100 overflow-hidden ${
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4"
                  }`}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Image Container */}
                  <div className="relative w-full h-50 flex items-center justify-center">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain mix-blend-multiply p-2"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4 pt-0 text-center">
                    <h3 className="text-lg mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    {isOnSale && (
                      <p className="text-lg font-semibold text-gray-400 line-through">
                        {originalPrice.toLocaleString("en-US")}đ
                      </p>
                    )}

                    <p
                      className={`text-lg font-semibold ${
                        isOnSale ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {finalPrice.toLocaleString("en-US")}đ
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
