"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, ChevronUp, ChevronDown } from "lucide-react";
import { Product } from "@/types/product";
import { ProductVariants } from "@/types/productVariants";
import { motion } from "framer-motion";

type Props = {
  product: Product;
  selectedVariant: ProductVariants;
  isSale?: boolean;
};

export default function ProductGallery({ product, selectedVariant, isSale }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const COLLAPSED_COUNT = 2;

  const mainImage = selectedVariant.images?.[0] || null;
  
  const currentVariantImages = selectedVariant.images || [];

  const previewImages = selectedVariant.images?.slice(1) || [];

  const variantLabel =
    selectedVariant.colors && selectedVariant.colors.length > 1
      ? selectedVariant.colors.map((c) => c.name).join(" / ")
      : selectedVariant.colors?.[0]?.name || "";

  return (
    <>
      {/* Ảnh chính */}
      <div className="relative mt-5">
        {isSale && (
          <span className="absolute z-20 top-5 left-5 bg-red-50 text-red-600 border border-red-200 text-sm px-3 py-1 rounded">
          </span>
        )}
        <div 
          className="bg-gray-100 rounded-xl w-full aspect-[16/9] lg:aspect-[6/3] flex justify-center cursor-pointer"
          onClick={() => {
            if (mainImage) {
              setSelectedImage(mainImage.publicUrl);
              setSelectedImageIndex(0);
            }
          }}
        >
          {mainImage ? (
            <Image
              src={mainImage.publicUrl}
              alt={`${product.name} - ${variantLabel}`}
              width={640}
              height={320}
              className="w-160 h-80 object-contain mix-blend-multiply mt-14"
              priority={false}
            />
          ) : (
            <div className="flex items-center justify-center text-gray-400">
              Không có ảnh
            </div>
          )}
        </div>
      </div>

      {/* Ảnh preview */}
      {previewImages.length > 0 && (
        <div className="relative mt-2">
          <div className="grid grid-cols-2 gap-2">
            {(showAll ? previewImages : previewImages.slice(0, COLLAPSED_COUNT)).map((img, idx) => (
              <div
                key={img.id}
                className="bg-gray-100 rounded-xl flex justify-center overflow-hidden aspect-square cursor-pointer"
                onClick={() => {
                  setSelectedImage(img.publicUrl);
                  setSelectedImageIndex(idx + 1); // +1 vì mainImage là index 0
                }}
              >
                <Image
                  src={img.publicUrl}
                  alt={`${product.name} - ${variantLabel}`}
                  width={800}
                  height={600}
                  className="w-full h-full object-contain mix-blend-multiply"
                  style={
                    idx >= 2
                      ? {
                          filter: 'brightness(1.05) contrast(1.1)',
                        }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          {previewImages.length > COLLAPSED_COUNT && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAll((s) => !s)}
                className="absolute -bottom-5 z-10 drop-md items-center gap-2 bg-white px-5 py-2
                  border border-gray-200 text-base font-semibold"
              >
                {showAll ? (
                  <>
                    Ít hơn <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Nhiều hơn <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors cursor-pointer"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Previous Button */}
          {currentVariantImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newIndex =
                  selectedImageIndex > 0
                    ? selectedImageIndex - 1
                    : currentVariantImages.length - 1;
                setSelectedImageIndex(newIndex);
                setSelectedImage(currentVariantImages[newIndex].publicUrl);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          <div
            className="max-w-5xl max-h-[95vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Biến thể sản phẩm"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Thumbnails */}
            {currentVariantImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-2">
                {currentVariantImages.map((img: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img.publicUrl);
                      setSelectedImageIndex(idx);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all bg-white ${
                      idx === selectedImageIndex
                        ? "border-blue-500 ring-2 ring-blue-400"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    <img
                      src={img.publicUrl}
                      alt={img.altText || `Image ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Button */}
          {currentVariantImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newIndex =
                  selectedImageIndex < currentVariantImages.length - 1
                    ? selectedImageIndex + 1
                    : 0;
                setSelectedImageIndex(newIndex);
                setSelectedImage(currentVariantImages[newIndex].publicUrl);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </motion.div>
      )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
