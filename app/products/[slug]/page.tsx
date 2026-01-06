"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getProductBySlug } from "@/services/productService";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Star, Check, ChevronRight, Heart, Filter, X } from "lucide-react";
import IncludingStrip from "@/components/productDetail/IncludingStrip";
import ProductTabs from "@/components/productDetail/ProductInfo";
import FrameMeasurementsTable from "@/components/productDetail/FrameMeasurementsTable";
import Breadcrumb from "@/components/productDetail/Breadcrumb";
import ProductGallery from "@/components/productDetail/ProductGallery";
import ColorSelector from "@/components/colorSelector";
import { useCart } from "@/context/CartContext";
import { ProductVariants } from "@/types/productVariants";
import { Routes } from "@/lib/routes";
import { addToRecentlyViewed } from "@/lib/recentlyViewed";
import toast from "react-hot-toast";
import { getReviewsByProduct } from "@/services/reviewService";
import { Review } from "@/types/review";
import Image from "next/image";
// import RecommendedProducts from "@/components/RecommendedProducts";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const variantIdFromUrl = searchParams.get("variantId");
  const { addToCart, cart, openDrawer } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariants | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);
  
  // Reviews filter & pagination
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("createdAt-DESC");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const itemsPerPage = 5;

  // 👉 ref để scroll
  const frameRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug)
      .then((res) => {
        setProduct(res);
        
        // Save to recently viewed
        if (res?.id && res?.slug) {
          addToRecentlyViewed(res.id, res.slug);
        }
        
        if (res?.variants?.length) {
          if (variantIdFromUrl) {
            const variantFromUrl = res.variants.find(
              (v) => v.id === variantIdFromUrl
            );
            if (variantFromUrl) {
              setSelectedVariant(variantFromUrl);
              return;
            }
          }

          const def =
            res.variants.find((v: ProductVariants) => v.isDefault) ||
            res.variants[0];
          setSelectedVariant(def);
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
      })
      .finally(() => setLoading(false));
  }, [slug, variantIdFromUrl]);

  // Fetch reviews when product is loaded
  useEffect(() => {
    if (!product?.id) return;
    
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const result = await getReviewsByProduct(product.id);
        
        // Sort reviews by createdAt (newest first)
        const sortedReviews = (result.data || []).sort((a: Review, b: Review) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        setReviews(sortedReviews);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    fetchReviews();
  }, [product?.id]);

  // Filter reviews by selected variant
  // Note: Currently API doesn't return orderItem.productVariantId
  // So we show all reviews for the product
  const variantReviews = reviews;

  // Apply filters and sorting
  const filteredAndSortedReviews = variantReviews
    .filter((review) => {
      if (selectedRating > 0 && review.rating !== selectedRating) return false;
      if (hasImage && !review.image?.publicUrl) return false;
      return true;
    })
    .sort((a, b) => {
      const [sortBy, sortOrder] = sortOption.split("-") as [string, "ASC" | "DESC"];
      let comparison = 0;
      if (sortBy === "createdAt") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateA - dateB;
      } else {
        comparison = a.rating - b.rating;
      }
      return sortOrder === "DESC" ? -comparison : comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredAndSortedReviews.slice(startIndex, startIndex + itemsPerPage);

  // Show loading skeleton while fetching
  if (loading) {
    return (
      <div className="mx-auto max-w-full px-20 lg:px-30 py-10">
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT SKELETON */}
          <div className="lg:col-span-8 space-y-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="aspect-square bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded"
                ></div>
              ))}
            </div>
          </div>

          {/* RIGHT SKELETON */}
          <div className="lg:col-span-4 space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-14 bg-gray-200 rounded"></div>
            <div className="h-14 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center py-20">
        <div className="text-2xl font-semibold text-gray-800 mb-2">
          Không tìm thấy sản phẩm
        </div>
        <p className="text-gray-500 mb-6">
          Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  const handleVariantChange = (variant: ProductVariants) => {
    setSelectedVariant(variant);
    setQuantity(1);

    const newUrl = variant.id
      ? Routes.product(product!.slug, variant.id)
      : Routes.product(product!.slug);
    router.replace(newUrl, { scroll: false });
  };

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      console.error("No variant ID available");
      return;
    }

    setLoading(true);
    try {
      // Gọi trực tiếp addToCart với đúng product variant ID
      await addToCart({
        product,
        selectedVariant: selectedVariant,
        quantity: typeof quantity === "number" ? quantity : 1,
      });
      setQuantity(1);
      openDrawer();
    } catch (error: any) {
      console.error(
        error.response?.data?.detail ||
          "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại."
      );
      toast.error(
        error.response?.data?.detail ||
          "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const finalPrice: number | undefined = selectedVariant.finalPrice
    ? Number(selectedVariant.finalPrice)
    : undefined;

  const originalPrice: number | undefined = selectedVariant.originalPrice
    ? Number(selectedVariant.originalPrice)
    : undefined;

  const isOnSale: boolean =
    finalPrice !== undefined &&
    originalPrice !== undefined &&
    originalPrice > finalPrice;

  const cartItem = cart.find(
    (i) =>
      i.cartItemId &&
      selectedVariant.id &&
      i.selectedVariant.id === selectedVariant.id
  );
  const alreadyInCart = cartItem ? cartItem.quantity : 0;

  const maxQuantity = Math.max(
    0,
    (selectedVariant.availableQuantity ??
      selectedVariant.quantityAvailable ??
      0) - alreadyInCart
  );

  return (
    <div className="mx-auto max-w-full px-20 lg:px-30 py-10">
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-8">
          <Breadcrumb product={product} selectedVariant={selectedVariant} />

          <ProductGallery
            product={product}
            selectedVariant={selectedVariant}
            isSale={isOnSale}
          />

          {/* <div className="mt-16">
            <IncludingStrip />
          </div> */}

          <div className="mt-15 mb-15">{/* <RecommendedProducts /> */}</div>

          <ProductTabs product={product} />

          <div ref={frameRef}>
            <FrameMeasurementsTable product={product} />
          </div>

          <div ref={reviewsRef} className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Đánh giá của khách hàng ({variantReviews.length})
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                title={showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Filters & Sorting */}
            {showFilters && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sắp xếp
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => {
                      setSortOption(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt-DESC">Ngày tạo giảm dần</option>
                    <option value="createdAt-ASC">Ngày tạo tăng dần</option>
                    <option value="rating-DESC">Xếp hạng giảm dần</option>
                    <option value="rating-ASC">Xếp hạng tăng dần</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lọc theo đánh giá
                  </label>
                  <select
                    value={selectedRating}
                    onChange={(e) => {
                      setSelectedRating(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Tất cả</option>
                    <option value={5}>5 sao</option>
                    <option value={4}>4 sao</option>
                    <option value={3}>3 sao</option>
                    <option value={2}>2 sao</option>
                    <option value={1}>1 sao</option>
                  </select>
                </div>

                {/* Has Image Filter */}
                <div className="flex items-center justify-start md:justify-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasImage}
                      onChange={(e) => {
                        setHasImage(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Chỉ có hình ảnh
                    </span>
                  </label>
                </div>
              </div>

              {/* Result count */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Tìm thấy <b>{filteredAndSortedReviews.length}</b> đánh giá
                  {filteredAndSortedReviews.length > 0 && ` (Trang ${currentPage} / ${totalPages})`}
                </div>
                <button
                  onClick={() => {
                    setSortOption("createdAt-DESC");
                    setSelectedRating(0);
                    setHasImage(false);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Đặt lại
                </button>
              </div>
            </div>
            )}
            
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedReviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không có đánh giá nào</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedReviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                      {/* Header: Avatar + Name + Rating */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-white font-semibold">
                          {review.nameDisplay?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-base">{review.nameDisplay}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(review.createdAt).toLocaleString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Review Content */}
                      {review.comment && (
                        <p className="text-gray-800 text-sm leading-relaxed mb-3">
                          {review.comment}
                        </p>
                      )}

                      {/* Review Image */}
                      {review.image?.publicUrl && (
                        <div className="mt-3">
                          <Image
                            src={review.image.publicUrl}
                            alt="Ảnh Đánh Giá"
                            width={120}
                            height={120}
                            className="rounded-md object-cover border cursor-pointer hover:opacity-80 transition"
                            onClick={() =>
                              setLightboxImage({
                                url: review.image!.publicUrl,
                                alt: "Review image",
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-md ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Lightbox Modal */}
          {lightboxImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
              onClick={() => setLightboxImage(null)}
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-gray-200 transition-colors"
                onClick={() => setLightboxImage(null)}
                title="Đóng"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.alt}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div
          className="lg:col-span-4 sticky self-start"
          style={{ top: "var(--header-h)" }}
        >
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 text-gray-700 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(product?.averageRating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-1 font-medium">{Math.round(product?.averageRating || 0)}</span>
            <span className="text-gray-400">·</span>
            <button
              onClick={() => {
                if (reviewsRef.current) {
                  const headerHeight =
                    parseInt(
                      getComputedStyle(
                        document.documentElement
                      ).getPropertyValue("--header-h")
                    ) || 0;
                  const top =
                    reviewsRef.current.getBoundingClientRect().top +
                    window.scrollY -
                    headerHeight -
                    20;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
              className="underline text-gray-600 hover:text-gray-700 cursor-pointer bg-transparent border-none p-0"
            >
              {product?.reviewCount} đánh giá
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-1">
            {isOnSale && originalPrice !== undefined && (
              <span className="text-gray-400 line-through font-bold">
                {originalPrice.toLocaleString("en-US")}đ
              </span>
            )}
            <span
              className={`text-xl font-bold ${isOnSale ? "text-red-600" : ""}`}
            >
              {finalPrice !== undefined
                ? `${finalPrice.toLocaleString("en-US")}đ`
                : "Chưa có"}
            </span>
          </div>

          <div className="text-gray-500 text-base mb-5">
            Thanh toán một lần qua <b>VNPAY</b>
          </div>

          {/* Features */}
          <ul className="space-y-1 text-sm text-gray-600 mb-8">
            {[
              "Bao gồm tròng kính",
              "Đổi và trả hàng trong 45 ngày",
              "Miễn phí vận chuyển đơn và trả hàng",
            ].map((txt) => (
              <li key={txt} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1" /> {txt}
              </li>
            ))}
          </ul>

          {/* Color selector */}
          <div className="space-y-2 mb-5">
            {selectedVariant.colors?.length ? (
              <ColorSelector
                variants={product.variants}
                selected={selectedVariant}
                onSelect={handleVariantChange}
              />
            ) : (
              <span className="text-gray-400 text-sm">Không có màu</span>
            )}
          </div>

          <span className="text-xs text-gray-800 block pb-2">
            Trạng thái kho: {" "}
            <b
              className={`${
                selectedVariant.stockStatus === "out_of_stock"
                  ? "text-red-600"
                  : selectedVariant.stockStatus === "low_stock"
                  ? "text-orange-600"
                  : selectedVariant.stockStatus === "in_stock"
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {selectedVariant.stockStatus === "out_of_stock"
                ? "Hết hàng"
                : selectedVariant.stockStatus === "low_stock"
                ? "Hàng sắp hết"
                : selectedVariant.stockStatus === "in_stock"
                ? "Còn hàng"
                : "Không xác định"}
            </b>
          </span>

          <span className="text-xs text-gray-800 block mb-3">
            Số lượng tối đa có sẵn:{" "}
            <b className="text-gray-800">{maxQuantity > 0 ? maxQuantity : 0}</b>
          </span>

          {/* Quantity + Add to Cart */}
          {maxQuantity > 0 ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="flex border rounded-md overflow-hidden h-14">
                <Button
                  onClick={() =>
                    setQuantity((q) => {
                      const current = typeof q === "number" ? q : 1;
                      return Math.max(1, current - 1);
                    })
                  }
                  disabled={typeof quantity === "number" ? quantity <= 1 : true}
                  className="w-10 h-full text-xl p-0 hover:bg-white text-gray-400"
                  variant="ghost"
                >
                  -
                </Button>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;

                    // Allow empty string temporarily for user to clear and type
                    if (val === "") {
                      setQuantity("");
                      return;
                    }

                    // Only allow digits
                    if (!/^\d+$/.test(val)) return;

                    const num = parseInt(val, 10);

                    // Allow any number during typing, will validate on blur
                    if (num >= 0 && num <= 99) {
                      setQuantity(num);
                    } else if (num > 99) {
                      setQuantity(99);
                    }
                  }}
                  onBlur={() => {
                    // If empty or invalid, reset to 1
                    if (quantity === "") {
                      setQuantity(1);
                    } else if (typeof quantity === "number") {
                      if (quantity < 1) {
                        setQuantity(1);
                      } else if (quantity > 99) {
                        setQuantity(99);
                      }
                    }
                  }}
                  className="w-12 flex items-center justify-center text-xl font-medium text-center border-0 focus:outline-none focus:ring-0"
                />
                <Button
                  onClick={() =>
                    setQuantity((q) => {
                      const current = typeof q === "number" ? q : 1;
                      return Math.min(99, current + 1);
                    })
                  }
                  disabled={typeof quantity === "number" && quantity >= 99}
                  className="w-10 h-full text-xl p-0 hover:bg-white text-gray-400"
                  variant="ghost"
                >
                  +
                </Button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={loading}
                className="flex-1 h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="font-semibold text-lg">Thêm vào Giỏ hàng</span>
                )}
              </Button>
            </div>
          ) : (
            <Button
              disabled
              className="w-full h-14 text-xl font-bold bg-gray-300 text-gray-500 cursor-not-allowed mb-3"
            >
              Thêm vào Giỏ hàng
            </Button>
          )}

          {/* Buy now */}
          <Button
            disabled={maxQuantity === 0}
            className={`w-full h-14 text-xl font-bold mb-3 ${
              maxQuantity === 0
                ? "bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white border-2 border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700"
            } transition-colors`}
          >
            Mua ngay
          </Button>

          {/* Extra sections */}
          <div className="mt-2 overflow-hidden border mb-2">
            {[
              { title: "Gọng & Kích thước", ref: frameRef },
              { title: "Đánh giá của khách hàng", ref: reviewsRef },
            ].map(({ title, ref }, idx, arr) => (
              <div key={title}>
                <Button
                  className="group w-full flex items-center justify-between px-4 py-4 text-left hover:bg-white drop-shadow-none border-none"
                  onClick={() => {
                    if (ref.current) {
                      const headerHeight =
                        parseInt(
                          getComputedStyle(
                            document.documentElement
                          ).getPropertyValue("--header-h")
                        ) || 0;
                      const top =
                        ref.current.getBoundingClientRect().top +
                        window.scrollY -
                        headerHeight -
                        20;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                >
                  <span className="font-medium text-gray-500 group-hover:text-gray-700">
                    {title}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700" />
                </Button>
                {idx !== arr.length - 1 && (
                  <div className="border-t border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
