"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchProductsElastic } from "@/services/productService";
import type { Product } from "@/types/product";
import { Routes } from "@/lib/routes";

type Props = {
  className?: string;
  limit?: number;   // số gợi ý hiện ra
};

export default function GlobalSearch({ className = "", limit = 6 }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0); // highlight item khi dùng phím ↑↓

  // formatter giống product: 2,000,000đ
  const fmt = useMemo(
    () => (n: number) =>
      new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 })
        .format(n)
        .replace(/\./g, ",") + "đ",
    []
  );

  // debounce 300ms
  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await searchProductsElastic({
          search: q.trim(),
          page: 1,
          limit,
        } as any); // search + page + limit là đủ
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
        setActive(0);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, limit]);

  // click ra ngoài thì đóng popup
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const goToListing = (term: string) => {
    // Trang listing của bạn đọc query `search` -> điều hướng về đó
    router.push(`${Routes.products?.() ?? "/products"}?search=${encodeURIComponent(term)}`);
    setOpen(false);
  };

  const goToProduct = (p: Product) => {
    // Nếu có slug thì đi thẳng trang chi tiết, nếu không thì về listing
    const href =
      (Routes.product && (p as any).slug && Routes.product((p as any).slug)) ||
      ((p as any).slug ? `/products/${(p as any).slug}` : `${Routes.products?.() ?? "/products"}?search=${encodeURIComponent(q)}`);
    router.push(href);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) goToProduct(results[active]);
      else goToListing(q);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.trim() && setOpen(true)}
        onKeyDown={onKey}
        placeholder="I’m Searching For..."
        className="w-full sm:w-64 rounded-full border px-4 py-2 pl-10 text-sm bg-gray-200 outline-none"
      />
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />

      {open && (
        <div className="absolute z-50 mt-2 w-full sm:w-96 rounded-lg border bg-white shadow-lg">
          {/* Header */}
          <div className="px-3 py-2 text-xs text-gray-500 border-b">
            {loading ? "Searching..." : results.length ? "Top results" : "No results"}
          </div>

          {/* Results */}
          <ul className="max-h-80 overflow-auto">
            {results.map((p, i) => (
              <li
                key={(p as any).id ?? `${(p as any).slug}-${i}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => goToProduct(p)}
                className={`cursor-pointer px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${
                  i === active ? "bg-gray-50" : ""
                }`}
              >
                <span className="line-clamp-1 mr-2">{(p as any).name ?? (p as any).title}</span>
                {(p as any).price != null && (
                  <span className="text-gray-700 font-medium whitespace-nowrap">
                    {fmt(Number((p as any).price))}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Footer – đi tới trang listing với từ khoá */}
          {!!q.trim() && (
            <button
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t"
              onClick={() => goToListing(q)}
            >
              View all results for “{q}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
