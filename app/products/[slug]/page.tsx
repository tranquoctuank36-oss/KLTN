"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getProductBySlug } from "@/services/productService";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Star, Check, ChevronRight, Heart } from "lucide-react";
import IncludingStrip from "@/components/productDetail/IncludingStrip";
import ProductTabs from "@/components/productDetail/ProductInfo";
import FrameMeasurementsTable from "@/components/productDetail/FrameMeasurementsTable";
import Breadcrumb from "@/components/productDetail/Breadcrumb";
import ProductGallery from "@/components/productDetail/ProductGallery";
import ColorSelector from "@/components/colorSelector";
import { useCart } from "@/context/CartContext";
import { ProductVariants } from "@/types/productVariants";
import { Routes } from "@/lib/routes";
import toast from "react-hot-toast";
// import RecommendedProducts from "@/components/RecommendedProducts";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const variantIdFromUrl = searchParams.get("variantId");
  const { addToCart, cart, openDrawer} = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariants | null>(
    null
  );
  const [quantity, setQuantity] = useState<number | string>(1);

  // 👉 ref để scroll
  const frameRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug)
      .then((res) => {
        setProduct(res);
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


  if (!product || !selectedVariant) {
    return <div className="max-w-6xl mx-auto p-6">Product not found</div>;
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
      console.error(error.response?.data?.detail || "Failed to add item to cart. Please try again.");
      toast.error(error.response?.data?.detail || "Failed to add item to cart. Please try again.");
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
      i.cartItemId && selectedVariant.id && i.selectedVariant.id === selectedVariant.id
  );
  const alreadyInCart = cartItem ? cartItem.quantity : 0;

  const maxQuantity = Math.max(0, (selectedVariant.availableQuantity ?? selectedVariant.quantityAvailable ?? 0) - alreadyInCart);

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-6">
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-8">
          <Breadcrumb product={product} selectedVariant={selectedVariant} />

          <ProductGallery
            product={product}
            selectedVariant={selectedVariant}
            isSale={isOnSale}
          />

          <div className="mt-16">
            <IncludingStrip />
          </div>

          <div className="mt-15 mb-15">{/* <RecommendedProducts /> */}</div>

          <ProductTabs product={product} />

          <div ref={frameRef}>
            <FrameMeasurementsTable product={product} />
          </div>

          <div ref={reviewsRef} className="mt-16">
            <h2 className="text-xl font-semibold mb-3">Customer Reviews:</h2>
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="lg:col-span-4 sticky self-start"
          style={{ top: "var(--header-h)" }}
        >
          <h1 className="text-2xl font-bold">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 text-gray-700 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 text-yellow-400 fill-yellow-400"
              />
            ))}
            <span className="ml-1 font-medium">4.8</span>
            <span className="text-gray-400">·</span>
            <a href="#" className="underline">
              143 reviews
            </a>
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
            Single payment via <b>VNPAY</b>
          </div>

          {/* Features */}
          <ul className="space-y-1 text-sm text-gray-600 mb-8">
            {[
              "Including lenses",
              "45-day return & exchange",
              "Free shipping and returns",
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
            Stock Status:{" "}
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
                ? "Out of Stock"
                : selectedVariant.stockStatus === "low_stock"
                ? "Low Stock"
                : selectedVariant.stockStatus === "in_stock"
                ? "In Stock"
                : "Unknown"}
            </b>
          </span>

          <span className="text-xs text-gray-800 block mb-3">
            Maximum available quantity:{" "}
            <b className="text-gray-800">{maxQuantity > 0 ? maxQuantity : 0}</b>
          </span>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mb-3">
            {(selectedVariant.availableQuantity ?? selectedVariant.quantityAvailable ?? 0) > 0 ? (
              <div className="flex border rounded-md overflow-hidden h-14">
                <Button
                  onClick={() => setQuantity((q) => {
                    const current = typeof q === "number" ? q : 1;
                    return Math.max(1, current - 1);
                  })}
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
            ) : (
              <span className="text-red-600 text-2xl font-medium">
                Out of stock
              </span>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="font-semibold text-lg">Add to Cart</span>
              )}
            </Button>
          </div>

          {/* Buy now */}
          <Button
            className="w-full h-14 text-xl font-bold bg-white border-2 border-blue-600 text-blue-600
             hover:border-blue-700 hover:text-blue-700 transition-colors mb-3"
          >
            Buy Now
          </Button>

          {/* Extra sections */}
          <div className="mt-2 overflow-hidden border mb-2">
            {[
              { title: "Frame & Measurements", ref: frameRef },
              { title: "Customer Reviews", ref: reviewsRef },
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
