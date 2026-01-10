"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMyReviews } from "@/services/reviewService";
import { Review } from "@/types/review";
import { getProductById } from "@/services/productService";
import { Routes } from "@/lib/routes";
import CreateReviewForm from "@/components/review/CreateReviewForm";
import Pagination from "./Pagination";

interface ReviewsTabProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const ReviewsTab = ({ containerRef }: ReviewsTabProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [productSlugs, setProductSlugs] = useState<{ [key: string]: string }>({});
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const result = await getMyReviews({
        page: reviewsCurrentPage,
        limit: 10,
      });
      setReviews(result.data || []);
      setReviewsTotalPages(result.meta?.totalPages || 0);
      const slugs: { [key: string]: string } = {};
      await Promise.all(
        (result.data || []).map(async (review: Review) => {
          if (review.orderItem?.productId) {
            try {
              const product = await getProductById(review.orderItem.productId);
              if (product?.slug) {
                slugs[review.orderItem.productId] = product.slug;
              }
            } catch (err) {
              console.error("Error fetching product slug:", err);
            }
          }
        })
      );
      setProductSlugs(slugs);
    } catch (err) {
      console.error("❌ Failed to fetch reviews:", err);
      setReviews([]);
      setReviewsTotalPages(0);
    } finally {
      setReviewsLoading(false);
    }
  }, [reviewsCurrentPage]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <>
      <div className="relative min-h-[200px]">
        {reviewsLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        {reviews.length === 0 && !reviewsLoading ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">Bạn chưa có đánh giá nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id}>
                <div className="border border-gray-300 rounded-md p-6 bg-white flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                        {review.nameDisplay?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-base">{review.nameDisplay}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-base ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.updatedAt || review.createdAt).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      onClick={() => setEditingReviewId((prev) => (prev === review.id ? null : review.id))}
                      className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition font-semibold text-sm whitespace-nowrap"
                    >
                      Cập nhật
                    </span>
                  </div>
                  <div className="pl-13">
                    <p className="text-gray-800 text-sm leading-relaxed mb-3">{review.comment || ""}</p>
                    {review.image?.publicUrl && (
                      <div className="mt-3 mb-3">
                        <Image
                          src={review.image.publicUrl}
                          alt="Ảnh Đánh Giá"
                          width={120}
                          height={120}
                          className="rounded-md object-cover border cursor-pointer hover:opacity-80 transition"
                          onClick={() => setLightboxImage({ url: review.image!.publicUrl, alt: "Ảnh Đánh Giá" })}
                        />
                      </div>
                    )}
                    {review.orderItem && (
                      <Link
                        href={
                          productSlugs[review.orderItem.productId] && review.orderItem.productVariantId
                            ? Routes.product(productSlugs[review.orderItem.productId], review.orderItem.productVariantId)
                            : productSlugs[review.orderItem.productId]
                            ? Routes.product(productSlugs[review.orderItem.productId])
                            : "#"
                        }
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-md mt-3 hover:bg-gray-100 transition cursor-pointer"
                      >
                        {review.orderItem.thumbnailUrl && (
                          <div className="w-16 h-16 rounded bg-white flex items-center justify-center flex-shrink-0 border">
                            <Image src={review.orderItem.thumbnailUrl} alt={review.orderItem.productName || "Sản Phẩm"} width={60} height={60} className="object-contain" />
                          </div>
                        )}
                        <div className="flex-1 text-xs text-gray-600">
                          <p className="font-medium text-sm text-gray-800">{review.orderItem.productName}</p>
                          <p className="mt-1">Màu sắc: {review.orderItem.colors}</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
                {editingReviewId === review.id && review.orderItem && (
                  <div className="mt-4 mb-4">
                    <CreateReviewForm
                      orderItem={{
                        id: review.orderItem.id,
                        productName: review.orderItem.productName,
                        thumbnailUrl: review.orderItem.thumbnailUrl,
                        colors: review.orderItem.colors,
                      }}
                      existingReview={review}
                      onSuccess={async () => {
                        await fetchReviews();
                        setEditingReviewId(null);
                      }}
                      onCancel={() => {
                        setEditingReviewId(null);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination currentPage={reviewsCurrentPage} totalPages={reviewsTotalPages} onPageChange={setReviewsCurrentPage} containerRef={containerRef} />

      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={() => setLightboxImage(null)}>
          <Button className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-gray-200 transition-colors" onClick={() => setLightboxImage(null)} title="Đóng">
            <X className="w-6 h-6 text-gray-800" />
          </Button>
          <div className="w-full h-full flex items-center justify-center p-8">
            <img src={lightboxImage.url} alt={lightboxImage.alt} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewsTab;
