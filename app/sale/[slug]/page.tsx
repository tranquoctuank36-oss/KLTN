"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Percent, Tag, Loader2, Search, X } from "lucide-react";
import { getDiscountBySlug, getDiscountProducts, type Discount } from "@/services/discountService";
import type { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";
import ReactPaginate from "react-paginate";
import { Button } from "@/components/ui/button";

const PER_PAGE = 12;

export default function DiscountDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const topRef = useRef<HTMLDivElement | null>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    const fetchDiscountDetail = async () => {
      try {
        setLoading(true);
        const data = await getDiscountBySlug(slug);
        setDiscount(data);
      } catch (err) {
        console.error("Failed to fetch discount details:", err);
        setError("Không thể tải chi tiết giảm giá");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDiscountDetail();
    }
  }, [slug]);

  useEffect(() => {
    if (!discount?.id) return;

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const result = await getDiscountProducts(
          discount.id,
          currentPage + 1,
          PER_PAGE,
          searchTerm || undefined
        );
        setProducts(result.data);
        setTotalPages(Math.max(1, result.pagination.totalPages || 1));
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [discount?.id, currentPage, searchTerm]);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full px-20 lg:px-30 py-10 mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !discount) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full px-20 lg:px-30 py-10 mx-auto">
          <div className="text-center py-16">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 mb-4">
              {error || "Không tìm thấy chương trình giảm giá"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Discount Banner */}
      <div className="relative w-full h-[200px] lg:h-[300px]">
        {discount.bannerImage ? (
          <Image
            src={discount.bannerImage.publicUrl}
            alt={discount.bannerImage.altText || discount.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-400 via-pink-400 to-purple-500 flex items-center justify-center">
            <Percent className="w-24 h-24 lg:w-32 lg:h-32 text-white opacity-50" />
          </div>
        )}
      </div>

      {/* Products */}
      <div className="max-w-full px-20 lg:px-30 py-10 mx-auto">
        <div ref={topRef} className="scroll-mt-[var(--header-h)]" />

        {/* Search */}
        {/* <div className="mb-8 relative w-full">
          <div
            className="group relative w-full border border-gray-500 rounded-full px-2 py-2 flex items-center 
               focus-within:border-sky-500 focus-within:border-2 transition bg-white"
          >
            <div
              className="p-3 rounded-full transition-colors 
                 hover:bg-orange-100 group-hover:bg-orange-100 group-focus-within:bg-orange-100 "
            >
              <Search className="h-5 w-5 text-gray-600" />
            </div>

            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="flex-1 outline-none text-gray-700 bg-transparent ml-3"
            />

            {searchTerm && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(0);
                }}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors drop-shadow-none w-9"
              >
                <X className="!h-5 !w-5 text-gray-500" />
              </Button>
            )}
          </div>

          {searchTerm && products.length === 0 && !loadingProducts && (
            <div className="absolute left-0 right-0 mt-3 bg-white shadow-[0_0_6px_rgba(0,0,0,0.2)] rounded-lg p-4 text-gray-600 text-base font-medium">
              Không tìm thấy kết quả cho tìm kiếm của bạn.
            </div>
          )}
        </div> */}

        <div className="relative" aria-busy={loadingProducts ? "true" : "false"}>
          {loadingProducts && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-lg min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 min-h-[400px]">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : !loadingProducts ? (
            <div className="text-center py-16 rounded-lg min-h-[400px] flex flex-col items-center justify-center">
              <Tag className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-600">
                Hiện chưa có sản phẩm nào được áp dụng mức giảm giá này.
              </p>
            </div>
          ) : null}
        </div>

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
    </div>
  );
}
