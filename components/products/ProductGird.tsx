"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import ReactPaginate from "react-paginate";
import { Loader2 } from "lucide-react";

import ProductCard from "./ProductCard";
import FilterSection from "../filterbar/FilterSection";
import type { Product } from "@/types/product";
import {
  searchProductsElastic,
  type ElasticSearchFilters,
  type ElasticAggregation,
} from "@/services/productService";

const PER_PAGE = 12;

type Props = {
  brandSlug?: string;
  title?: string;
  initialFilters?: Partial<ElasticSearchFilters>;
  hideProductTypesSelection?: boolean;
  hideBrandsSelection?: boolean;
};

// so sánh đơn giản đủ dùng cho object phẳng
const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

export default function ProductGrid({ brandSlug, title, initialFilters, hideProductTypesSelection = false, hideBrandsSelection = false }: Props) {
  // data
  const [products, setProducts] = useState<Product[]>([]);
  const [aggregations, setAggregations] = useState<ElasticAggregation | undefined>(undefined);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ui
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // paging (0-based cho ReactPaginate)
  const [currentPage, setCurrentPage] = useState(0);

  // sort + filters runtime
  const [sort, setSort] = useState<string>("popular");
  const [runtimeFilters, setRuntimeFilters] = useState<Partial<ElasticSearchFilters>>(
    initialFilters ?? {}
  );

  // reset trang khi thay brand/filters preset
  useEffect(() => {
    setCurrentPage(0);
  }, [brandSlug, initialFilters]);

  // gộp filters cuối cùng (memo ổn định)
  const apiFilters = useMemo<ElasticSearchFilters>(() => {
    const merged: ElasticSearchFilters = {
      ...(initialFilters || {}),
      ...(runtimeFilters || {}),
    };
    if (brandSlug) merged.brands = [brandSlug];

    // Map sort UI values to API format
    if (sort) {
      switch (sort) {
        case "popular":
          merged.sortField = "popular";
          break;
        case "newest":
          merged.sortField = "newest";
          break;
        case "price-asc":
          merged.sortField = "price";
          merged.sortOrder = "ASC";
          break;
        case "price-desc":
          merged.sortField = "price";
          merged.sortOrder = "DESC";
          break;
      }
    }

    return merged;
  }, [brandSlug, initialFilters, runtimeFilters, sort]);

  // fetch
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const page = currentPage + 1; // API 1-based
        const res = await searchProductsElastic({
          page,
          limit: PER_PAGE,
          ...apiFilters,
        });

        if (cancelled) return;

        setProducts(res?.data ?? []);
        setAggregations(res?.aggregations ?? undefined);
        setTotalItems(res?.pagination?.total ?? (res?.data?.length ?? 0));
        setTotalPages(Math.max(1, res?.pagination?.totalPages ?? 1));
      } catch (err: any) {
        if (cancelled) return;
        // Giữ products cũ khi lỗi? Tuỳ bạn, ở đây clear cho chắc:
        setProducts([]);
        setAggregations(undefined);
        setTotalItems(0);
        setTotalPages(1);
        setError(err?.response?.data?.message || err?.message || "Không thể tải sản phẩm");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiFilters, currentPage]);

  // scroll đầu danh sách khi đổi trang
  const topRef = useRef<HTMLDivElement | null>(null);
  const firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  // ==== Callbacks ổn định & chống loop ====
  const lastFiltersRef = useRef<Partial<ElasticSearchFilters> | null>(null);

  const handleFiltersChange = useCallback((f: Partial<ElasticSearchFilters>) => {
    setCurrentPage(0);

    // nếu FilterBar gửi đi đúng cùng payload liên tục -> bỏ qua
    if (lastFiltersRef.current && isEqual(lastFiltersRef.current, f)) return;
    lastFiltersRef.current = f;

    setRuntimeFilters((prev) => {
      const next = { ...prev, ...f };
      return isEqual(prev, next) ? prev : next;
    });
  }, []);

  const handleSortChange = useCallback((s: string) => {
    setCurrentPage(0);
    setSort((prev) => (prev === s ? prev : s));
  }, []);

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-full px-20 lg:px-30 py-10">
      <div ref={topRef} className="scroll-mt-[var(--header-h)]" />

      {/* FilterSection LUÔN mounted */}
      <FilterSection
        title={title}
        products={products}
        aggregations={aggregations}
        totalItems={totalItems}
        sort={sort}
        onSortChange={handleSortChange}
        onFiltersChange={handleFiltersChange}
        initialFilters={initialFilters}
        hideProductTypesSelection={hideProductTypesSelection}
        hideBrandsSelection={hideBrandsSelection}
      />

      {/* Grid + overlay spinner */}
      <div className="relative mt-10" aria-busy={loading ? "true" : "false"}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {products.length === 0 && !loading ? (
          <div className="p-6 text-center min-h-[240px] flex items-center justify-center">
            Không tìm thấy sản phẩm
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 min-h-[240px]">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
            aria-label="Đi tới trang đầu tiên"
            className={`rounded-md ${
              currentPage === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <span
              className={`block px-2.5 py-1.5 border rounded-md transition-colors ${
                currentPage === 0 ? "" : "hover:border-blue-600 hover:text-blue-600"
              }`}
            >
              «
            </span>
          </button>

          <ReactPaginate
            forcePage={currentPage}
            onPageChange={(e) => setCurrentPage(e.selected)}
            pageCount={totalPages}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            breakLabel="…"
            nextLabel="›"
            previousLabel="‹"
            containerClassName="flex items-center gap-2"
            pageLinkClassName="px-3 py-1.5 block border rounded-md transition-colors hover:border-blue-600 hover:text-blue-600 cursor-pointer"
            activeLinkClassName="bg-blue-600 text-white border-blue-600 cursor-default hover:bg-blue-600 hover:text-white hover:border-blue-600"
            previousLinkClassName="px-2.5 py-1.5 block border rounded-md transition-colors hover:border-blue-600 hover:text-blue-600 cursor-pointer"
            nextLinkClassName="px-2.5 py-1.5 block border rounded-md transition-colors hover:border-blue-600 hover:text-blue-600 cursor-pointer"
            disabledLinkClassName="opacity-50 cursor-not-allowed hover:border-gray-300 hover:text-current"
            breakClassName="px-2.5 py-1.5"
            renderOnZeroPageCount={null}
          />

          <button
            onClick={() => setCurrentPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            aria-label="Đi tới trang cuối cùng"
            className={`rounded-md ${
              currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <span
              className={`block px-2.5 py-1.5 border rounded-md transition-colors ${
                currentPage === totalPages - 1 ? "" : "hover:border-blue-600 hover:text-blue-600"
              }`}
            >
              »
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
