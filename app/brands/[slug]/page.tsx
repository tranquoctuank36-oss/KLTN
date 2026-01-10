"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getBrandBySlug } from "@/services/brandsService";
import { Brand } from "@/types/brand";
import { Loader2 } from "lucide-react";
import ProductGrid from "@/components/products/ProductGird";

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getBrandBySlug(slug)
      .then((data) => {
        setBrand(data);
        setError(null);
      })
      .catch(() => setError("Không tìm thấy thương hiệu"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );

  if (!brand || error)
    return (
      <div className="text-center py-20">
        <h1 className="text-1xl text-gray-500">
          {error || "Không tìm thấy thương hiệu"}
        </h1>
      </div>
    );

  return (
    <main className="min-h-screen">
      {/* Banner */}
      <section className="relative w-full h-[400px] bg-gray-100">
        {brand.bannerImage?.publicUrl ? (
          <Image
            src={brand.bannerImage.publicUrl}
            alt={brand.bannerImage.altText || brand.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-6xl font-bold text-gray-500">{brand.name}</h1>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </section>

      <ProductGrid brandSlug={slug} title={`Kính mắt - ${brand.name}`} hideBrandsSelection={true} />
    </main>
  );
}
