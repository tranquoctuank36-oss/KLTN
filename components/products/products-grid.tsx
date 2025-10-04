"use client";

import { useRef, useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import ProductCard from "./products-card";
import { fetchProducts } from "@/services/productService";
import { Product } from "@/types/product";

const PER_PAGE = 12;

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Fetch products (API or mock tuỳ .env)
  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message || "Failed to fetch products"))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const start = currentPage * PER_PAGE;
  const end = start + PER_PAGE;
  const currentProducts = products.slice(start, end);

  // Scroll về top khi đổi page
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  if (loading) {
    return <div className="p-6 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!products.length) {
    return <div className="p-6 text-center">No products found</div>;
  }

  return (
    <div className="w-full mt-20">
      <div ref={gridRef} className="scroll-mt-[var(--header-h)]" />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {currentProducts.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {/* First page */}
          <button
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
            aria-label="Go to first page"
            className={`rounded-md ${
              currentPage === 0
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <span
              className={`block px-2.5 py-1.5 border rounded-md transition-colors ${
                currentPage === 0
                  ? ""
                  : "hover:border-blue-600 hover:text-blue-600"
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
            pageLinkClassName="px-3 py-1.5 block border rounded-md transition-colors hover:border-blue-600 hover:text-blue-600"
            activeLinkClassName="bg-blue-600 text-white border-blue-600 cursor-default"
            previousLinkClassName="px-2.5 py-1.5 block border rounded-md transition-colors hover:border-blue-600 hover:text-blue-600"
            nextLinkClassName="px-2.5 py-1.5 block border rounded-md transition-colors hover:border-blue-600 hover:text-blue-600"
            breakClassName="px-2.5 py-1.5"
            renderOnZeroPageCount={null}
          />

          {/* Last page */}
          <button
            onClick={() => setCurrentPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            aria-label="Go to last page"
            className={`rounded-md ${
              currentPage === totalPages - 1
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <span
              className={`block px-2.5 py-1.5 border rounded-md transition-colors ${
                currentPage === totalPages - 1
                  ? ""
                  : "hover:border-blue-600 hover:text-blue-600"
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
