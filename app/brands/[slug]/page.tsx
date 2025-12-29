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
      .catch(() => setError("Brand not found"))
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
        <h1 className="text-2xl font-bold text-red-500">
          {error || "Brand not found"}
        </h1>
      </div>
    );

  return (
    <main className="min-h-screen">
      {/* Banner */}
      <section className="relative w-full h-[400px] bg-gray-100">
        {brand.bannerImagePublicUrl ? (
          <Image
            src={brand.bannerImagePublicUrl}
            alt={brand.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-6xl font-bold text-gray-300">{brand.name}</h1>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
          <div className="max-w-[1440px] mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-3">
              {brand.name}
            </h1>
            {brand.description && (
              <p className="text-lg lg:text-xl max-w-3xl opacity-90">
                {brand.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <ProductGrid brandSlug={slug} title={`${brand.name} Eyewear`} />
    </main>
  );
}
