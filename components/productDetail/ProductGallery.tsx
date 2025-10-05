"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Video, ChevronUp, ChevronDown } from "lucide-react";
import { Product, ProductImageSet } from "@/types/product";

type Props = {
  product: Product;
  selected: ProductImageSet;
  isSale?: boolean;
};

export default function ProductGallery({ product, selected, isSale }: Props) {
  const [showAll, setShowAll] = useState(false);

  const fixedIds = ["sideAngle", "sideProfile", "case"] as const;
  type FixedId = typeof fixedIds[number];
  const COLLAPSED_COUNT = 2;

  const fixedImages = useMemo(
    () =>
      fixedIds
        .map((id) => selected.images.find((img) => img.id === id))
        .filter(Boolean) as { id: string; url: string }[],
    [selected, fixedIds]
  );

  const extraImages = useMemo(
    () =>
      selected.images.filter(
        (img) => img.id !== "front" && !fixedIds.includes(img.id as FixedId)
      ),
    [selected, fixedIds]
  );

  const previewImages = showAll
    ? [...fixedImages, ...extraImages]
    : fixedImages.slice(0, COLLAPSED_COUNT);

  return (
    <>
      {/* Khối ảnh chính */}
      <div className="relative mt-5">
        {isSale && (
          <span className="absolute z-20 top-5 left-5 bg-red-50 text-red-600 border border-red-200 text-sm px-3 py-1 rounded">
            Sale
          </span>
        )}
        <div className="bg-gray-50 rounded-xl w-full aspect-[16/9] lg:aspect-[6/3] flex justify-center">
          <Image
            src={selected.images.find((img) => img.id === "front")!.url}
            alt={`${product.name} - ${selected.label}`}
            width={640}
            height={320}
            className="w-160 h-80"
            priority={false}
          />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <Button className="flex items-center gap-2 bg-black text-white !px-4 !py-6 rounded-full shadow hover:bg-black/70 transition-colors">
            <Video className="!w-6 !h-6 text-white -mb-0.5" />
            <span className="font-semibold text-lg">Live Try On</span>
          </Button>
        </div>
      </div>

      {/* Ảnh preview */}
      <div className="relative mt-2">
        <div className="grid grid-cols-2 gap-2">
          {previewImages.map((img) => (
            <div
              key={img.id}
              className="bg-gray-50 rounded-xl flex justify-center overflow-hidden aspect-square"
            >
              <Image
                src={img.url}
                alt={`${product.name} - ${selected.label}`}
                width={800}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowAll((s) => !s)}
            className="absolute -bottom-5 z-10 shadow-md items-center gap-2 bg-white px-5 py-2
              border border-gray-200 text-base font-semibold"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
