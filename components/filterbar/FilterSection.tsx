"use client";

import { useCallback, useRef } from "react";
import { ElasticSearchFilters, ElasticAggregation } from "@/services/productService";
import type { Product } from "@/types/product";
import FilterBar from "./filterbar";

type Props = {
  products: Product[];
  title?: string;
  aggregations?: ElasticAggregation;
  totalItems?: number;
  onFiltersChange?: (filters: Partial<ElasticSearchFilters>) => void;
  sort?: string;
  onSortChange?: (s: string) => void;
  initialFilters?: Partial<ElasticSearchFilters>;
  hideProductTypesSelection?: boolean;
  hideBrandsSelection?: boolean;
};

const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

export default function FilterSection({
  products = [],
  title,
  aggregations,
  totalItems,
  onFiltersChange,
  sort,
  onSortChange,
  initialFilters,
  hideProductTypesSelection = false,
  hideBrandsSelection = false,
}: Props) {
  const count = totalItems ?? products.length;

  // Giữ bộ lọc cuối cùng gửi lên — giúp chặn việc bắn cùng payload nhiều lần
  const lastSentRef = useRef<Partial<ElasticSearchFilters> | null>(null);

  const handleChange = useCallback(
    (f: Partial<ElasticSearchFilters>) => {
      if (!onFiltersChange) return;
      if (lastSentRef.current && isEqual(lastSentRef.current, f)) return;
      lastSentRef.current = f;
      onFiltersChange(f);
    },
    [onFiltersChange]
  );

  // Không auto gọi onFiltersChange khi mount; chỉ gọi khi user thao tác trên FilterBar.

  return (
    <section className=" mx-auto">
      <h1 className="flex items-baseline gap-2 text-3xl font-bold tracking-tight">
        {title || "Cửa Hàng Kính Mắt Cao Cấp"}{" "}
        <span className="relative -translate-y-0.5 text-black/70 text-xl font-medium">
          ({count} Sản phẩm)
        </span>
      </h1>

      <div className="mt-10">
        <FilterBar
          aggregations={aggregations}
          onChange={handleChange}
          sort={sort}
          onSortChange={onSortChange}
          initialFilters={initialFilters}
          hideProductTypesSelection={hideProductTypesSelection}
          hideBrandsSelection={hideBrandsSelection}
        />
      </div>
    </section>
  );
}
