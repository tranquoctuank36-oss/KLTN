"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { bannerService } from "@/services/bannerService";
import { Banner } from "@/types/banner";

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => i - 1);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await bannerService.getActiveBanners();
        if (response.success && response.data.length > 0) {
          // Sort banners by sortOrder
          const sortedBanners = [...response.data].sort(
            (a, b) => a.sortOrder - b.sortOrder
          );
          setBanners(sortedBanners);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    if (index === banners.length + 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setIndex(1);
      }, 500);
    }
    if (index === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setIndex(banners.length); 
      }, 500);
    }
  }, [index, banners.length]);

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => setIsTransitioning(true));
    }
  }, [isTransitioning]);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading || banners.length === 0) {
    return (
      <section className="relative">
        <div className="px-6 lg:px-50">
          <div className="relative h-[50vh] md:h-[55vh] overflow-hidden bg-gray-200 animate-pulse flex items-center justify-center">
            <p className="text-gray-400">Đang tải banners...</p>
          </div>
        </div>
      </section>
    );
  }

  const slides = [
    banners[banners.length - 1],
    ...banners,
    banners[0],
  ];

  return (
    <section className="relative">
      <div className="px-6 lg:px-50">
        <div className="relative h-[50vh] md:h-[55vh] overflow-hidden">
          {/* track slides */}
          <div
            className={`flex w-full h-full ${
              isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
            }`}
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${index * (100 / slides.length)}%)`,
            }}
          >
            {slides.map((banner, i) => {
              const slideContent = (
                <div
                  key={`${banner.id}-${i}`}
                  className="relative h-full cursor-pointer"
                  style={{ width: `${100 / slides.length}%` }}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${i}`}
                    fill
                    priority={i === index}
                    // className="object-cover"
                  />
                </div>
              );

              // Wrap with Link if linkUrl exists
              if (banner.linkUrl) {
                return (
                  <Link
                    key={`${banner.id}-${i}`}
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                    style={{ width: `${100 / slides.length}%` }}
                  >
                    <div className="relative h-full">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title || `Banner ${i}`}
                        fill
                        priority={i === index}
                        className="object-cover"
                      />
                    </div>
                  </Link>
                );
              }

              return slideContent;
            })}
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 md:px-6 ">
            <Button
              aria-label="Trang Trước"
              onClick={prev}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/80 hover:bg-white/100 drop-shadow-md p-2"
            >
              <ChevronLeft className="!h-7 !w-7 text-gray-400 hover:text-gray-600 " />
            </Button>
            <Button
              aria-label="Trang Tiếp"
              onClick={next}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/80 hover:bg-white/100 drop-shadow-md p-2"
            >
              <ChevronRight className="!h-7 !w-7 text-gray-400 hover:text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
