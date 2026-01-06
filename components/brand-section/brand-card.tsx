"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Routes } from "@/lib/routes";
import { Brand } from "@/types/brand";

export default function BrandCard({ brand }: { brand: Brand }) {
  const imageSrc = brand.bannerImage?.publicUrl || "/brand-placeholder.jpg";

  return (
    <Link
      href={Routes.brand(brand.slug)}
      className="group relative block overflow-hidden rounded-3xl"
    >
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={imageSrc}
          alt={brand.name}
          fill
          sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute left-6 bottom-6 z-10">{brand.name}</div>
        <div className="absolute right-6 bottom-6 z-10">
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-all duration-300 group-hover:bg-white group-hover:translate-x-1"
            aria-hidden
          >
            <ArrowRight className="h-6 w-6 text-gray-800" />
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/20" />
      </div>
    </Link>
  );
}
