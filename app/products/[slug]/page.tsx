"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProduct } from "@/services/productService";
import {
  type Product,
  type ProductImageSet,
  type ProductSizeInfo,
} from "@/types/product";
import { Button } from "@/components/ui/button";
import { Star, Check, ChevronRight } from "lucide-react";
import IncludingStrip from "@/components/productDetail/IncludingStrip";
import ProductTabs from "@/components/productDetail/ProductInfo";
import FrameMeasurementsTable from "@/components/productDetail/FrameMeasurementsTable";
import Breadcrumb from "@/components/productDetail/Breadcrumb";
import ProductGallery from "@/components/productDetail/ProductGallery";
import ColorSelector from "@/components/colorSelector";
import { useCart } from "@/context/CartContext";
import LoadingButton from "@/components/ui/LoadingButton";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<ProductImageSet | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProduct(slug).then((p) => {
      setProduct(p);
      if (p) {
        setSelected(p.images[0]);
        setSelectedSize(p.images[0]?.sizes?.[0]?.size || "");
        setQuantity(1);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (!product || !selected) {
    return <div className="max-w-6xl mx-auto p-6">Product not found</div>;
  }

  const isSale = Boolean(product.oldPrice && product.sale);
  const selectedImage = selected!;
  const selectedSizeInfo: ProductSizeInfo | undefined =
    selectedImage.sizes.find((s) => s.size === selectedSize);
  const selectedQuantity = selectedSizeInfo?.inventory ?? 0;

  return (
    <div className="max-w-full px-6 lg:px-20 py-6">
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-8">
          <Breadcrumb product={product} selected={selected!} />

          <ProductGallery
            product={product}
            selected={selected!}
            isSale={isSale}
          />

          <div className="mt-16 mb-16">
            <IncludingStrip />
          </div>

          <ProductTabs product={product} />

          {selectedSize &&
            (() => {
              const matched = selected.sizes.find(
                (s) => s.size === selectedSize
              );
              return matched ? (
                <FrameMeasurementsTable measurements={matched.measurements} />
              ) : null;
            })()}

          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-3">Customer Reviews:</h2>
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="lg:col-span-4 sticky self-start"
          style={{ top: "var(--header-h)" }}
        >
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

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
            {isSale && (
              <span className="text-gray-400 line-through font-bold">
                ${product.oldPrice}
              </span>
            )}
            <span
              className={`text-xl font-bold ${isSale ? "text-red-600" : ""}`}
            >
              ${product.price}
            </span>
          </div>

          <div className="text-gray-500 text-base mb-5">
            Single payment via <b>PayPal</b>
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
            <ColorSelector
              images={product.images}
              selected={selected!}
              onSelect={setSelected}
            />
          </div>

          {/* Size selector */}
          <div
            className={`flex items-center gap-3 text-gray-700 ${
              selectedQuantity < 6 && selectedQuantity > 0 ? "mb-3" : "mb-10"
            }`}
          >
            <span className="text-sm font-medium">Size:</span>
            <div className="flex gap-2">
              {selectedImage.sizes.map(({ size }) => {
                const isActive = selectedSize === size;
                return (
                  <Button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    className={`p-1 h-auto leading-none rounded-md border text-sm transition ${
                      isActive
                        ? "bg-blue-50 border-blue-700 text-blue-700 font-medium"
                        : "bg-white border-gray-400 text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Low stock warning */}
          {selectedQuantity < 6 && selectedQuantity > 0 && (
            <div className="mt-2 flex items-center gap-2 text-orange-600 text-sm font-medium mb-10">
              <span>
                Only <b>{selectedQuantity}</b> left In Stock – <b>Act Fast</b>
              </span>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mb-3">
            {selectedSize && (
              <>
                {selectedQuantity > 0 ? (
                  <div className="flex border rounded-md overflow-hidden h-14">
                    <Button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-full text-xl p-0 hover:bg-white text-gray-400"
                      variant="ghost"
                    >
                      -
                    </Button>

                    <span className="w-12 flex items-center justify-center text-xl font-medium">
                      {quantity}
                    </span>

                    <Button
                      onClick={() =>
                        setQuantity((q) => Math.min(selectedQuantity, q + 1))
                      }
                      disabled={quantity >= selectedQuantity}
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
              </>
            )}

            <LoadingButton
              onClick={async () => {
                if (selectedQuantity === 0) return;
                addToCart({
                  product,
                  selected: selected!,
                  size: selectedSize,
                  quantity,
                });
              }}
              className="flex-1 h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add to Cart
            </LoadingButton>
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
            {["Frame & Measurements", "Customer Reviews"].map(
              (title, idx, arr) => (
                <div key={title}>
                  <Button className="group w-full flex items-center justify-between px-4 py-4 text-left hover:bg-white shadow-none border-none">
                    <span className="font-medium text-gray-500 group-hover:text-gray-700">
                      {title}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700" />
                  </Button>
                  {idx !== arr.length - 1 && (
                    <div className="border-t border-gray-300"></div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
