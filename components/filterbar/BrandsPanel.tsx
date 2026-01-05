"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { motion, Variants } from "framer-motion";
import { getBrands } from "@/services/brandsService";
import { Brand } from "@/types/brand";
import { ArrowRight } from "lucide-react";

const containerV: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemV: Variants = {
  hidden: { x: -24, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
};

type Props = {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
  options: Array<{ id: string; label: string; count: number }>;
};

export default function BrandsPanel({
  selected,
  onToggle,
  onClose,
  options,
}: Props) {
  const [activeTab, setActiveTab] = useState<"popular" | "all">("popular");
  const [topBrands, setTopBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrands({
      sortField: "priority",
      sortOrder: "ASC",
      limit: 5,
    })
      .then((brands) => {
        setTopBrands(brands);
        console.log("Top brands from API:", brands.map(b => b.name));
        console.log("Available options:", options.map(o => o.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [options]);

  const popularOptions = topBrands.map((brand) => {
    // Try multiple matching strategies
    const opt = options.find(
      (o) =>
        o.id === brand.name ||
        o.label === brand.name ||
        o.id.toLowerCase() === brand.name.toLowerCase() ||
        o.label.toLowerCase() === brand.name.toLowerCase() ||
        o.id.toLowerCase().replace(/\s+/g, "-") === brand.slug ||
        o.id.toLowerCase().replace(/\s+/g, "") === brand.name.toLowerCase().replace(/\s+/g, "")
    );
    
    if (!opt) {
      console.log(`No match found for brand: ${brand.name} (slug: ${brand.slug})`);
    }
    
    return opt
      ? { id: opt.id, label: opt.label, count: opt.count, isAllBrands: false }
      : { id: brand.name, label: brand.name, count: 0, isAllBrands: false };
  });

  const displayOptions =
    activeTab === "popular"
      ? [...popularOptions, { id: "__all_brands__", label: "Tất cả thương hiệu", count: 0, isAllBrands: true }]
      : options.map(opt => ({ ...opt, isAllBrands: false }));

  return (
    <div className="rounded-b-xl border-t bg-gray-100">
      {/* Tabs - Fixed */}
      <div className="flex items-center gap-4 px-6 pt-2 border-gray-200">
        <button
          onClick={() => setActiveTab("popular")}
          className={`pb-2 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "popular"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Phổ biến
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "all"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Tất cả thương hiệu
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="h-[140px] overflow-y-auto py-4">
        {loading && activeTab === "popular" ? (
          <p className="text-gray-500 text-sm text-center"></p>
        ) : (
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="show"
            variants={containerV}
            className="flex flex-wrap justify-center gap-3 px-20"
          >
            {displayOptions.map((opt) => {
              const isActive = selected.has(opt.id);
              const isAllBrandsButton = opt.isAllBrands;
              
              return (
                <motion.div key={opt.id} variants={itemV}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (isAllBrandsButton) {
                        setActiveTab("all");
                      } else {
                        onToggle(opt.id);
                      }
                    }}
                    className={[
                      "flex border bg-white hover:bg-white",
                      activeTab === "all" && !isAllBrandsButton 
                        ? "w-40 h-14 text-sm" 
                        : isAllBrandsButton
                        ? "w-48 h-20 text-base"
                        : "w-40 h-20 text-base",
                      "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                      isAllBrandsButton
                        ? "border-slate-300 hover:border-gray-800"
                        : isActive
                        ? "border-blue-500 ring-1 ring-blue-200 bg-blue-50"
                        : "border-slate-200 hover:border-gray-800",
                    ].join(" ")}
                    aria-pressed={!isAllBrandsButton && isActive}
                  >
                    <span
                      className={[
                        "text-base flex items-center gap-2",
                        isAllBrandsButton 
                          ? "text-gray-800 font-semibold"
                          : isActive 
                          ? "text-blue-600" 
                          : "text-gray-800",
                      ].join(" ")}
                    >
                      {opt.label}
                      {isAllBrandsButton ? (
                        <ArrowRight className="w-4 h-4" />
                      ) : (
                        typeof opt.count === "number" && (
                          <span
                            className={[
                              "ml-1 text-sm opacity-70",
                              isActive ? "text-blue-600" : "text-gray-800",
                            ].join(" ")}
                          >
                            ({opt.count})
                          </span>
                        )
                      )}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-end px-6">
        <button
          type="button"
          onClick={onClose}
          className="text-xs bg-gray-100 font-medium text-slate-500 underline 
             hover:text-slate-700 hover:bg-gray-100 border-0
             focus:outline-none focus:ring-0 focus-visible:ring-0 shadow-none cursor-pointer rounded"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
