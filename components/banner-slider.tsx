"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const IMAGES = [
  "/banners/banner_1.png",
  "/banners/banner_2.png",
  "/banners/banner_3.png",
];

export default function BannerSlider() {
  const [index, setIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => i - 1);

  useEffect(() => {
    if (index === IMAGES.length + 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setIndex(1);
      }, 500);
    }
    if (index === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setIndex(IMAGES.length); 
      }, 500);
    }
  }, [index]);

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => setIsTransitioning(true));
    }
  }, [isTransitioning]);

  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slides = [IMAGES[IMAGES.length - 1], ...IMAGES, IMAGES[0]];

  return (
    <section className="relative">
      <div className="px-6 lg:px-50">
        <div className="relative h-[50vh] md:h-[55vh] overflow-hidden">
          {/* track slides */}
          <div
            className={`flex h-full ${
              isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
            }`}
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${index * (100 / slides.length)}%)`,
            }}
          >
            {slides.map((src, i) => (
              <div
                key={i}
                className="relative h-full"
                style={{ width: `${100 / slides.length}%` }}
              >
                <Image
                  src={src}
                  alt={`Trang ${i}`}
                  fill
                  priority={i === index}              
                />
              </div>
            ))}
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
