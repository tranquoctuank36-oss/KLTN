"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, Tag, Percent, Clock, TicketPercent } from "lucide-react";
import {
  getActiveDiscounts,
  getActiveVouchers,
  type Discount,
  type Voucher,
} from "@/services/discountService";
import { Button } from "@/components/ui/button";

export default function SalePage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"discounts" | "vouchers">(
    "discounts"
  );
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getActiveDiscounts(), getActiveVouchers()])
      .then(([discountsData, vouchersData]) => {
        setDiscounts(discountsData);
        setVouchers(vouchersData);

        // Auto-select available tab
        if (discountsData.length === 0 && vouchersData.length > 0) {
          setActiveTab("vouchers");
        } else if (vouchersData.length === 0 && discountsData.length > 0) {
          setActiveTab("discounts");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch sale data:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDiscount = (type: string, value: string) => {
    if (type === "percentage") {
      return `${Number(value) / 100}%`;
    }
    return `${Number(value).toLocaleString("en-US")}đ`;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className={`relative overflow-hidden transition-colors duration-500 ${
        imageLoaded ? 'bg-[#9CBAC7]' : 'bg-gray-100'
      }`}>
        <div className="max-w-full px-20 lg:px-30 py-10 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className={`space-y-4 transition-opacity duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}>
              <h1 className="text-3xl lg:text-4xl text-gray-900 leading-tight pl-15">
                Tìm ưu đãi hoàn hảo cho
                <br />
                cặp kính hoàn hảo của bạn.
              </h1>
              <p className="text-lg text-gray-700 pl-15">
                Khám phá những ưu đãi tuyệt vời và phiếu giảm giá độc quyền 
                <br />
                dành cho kính mắt cao cấp.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end relative">
              {/* Loading Skeleton */}
              {!imageLoaded && (
                <div className="w-[400px] h-[400px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                </div>
              )}
              {/* Image with fade-in effect */}
              <div className={`transition-opacity duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}>
                <Image
                  src="/sale-banner-glasses.avif"
                  alt="Kính"
                  width={400}
                  height={400}
                  className="object-contain"
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-full px-20 lg:px-30 py-12 mx-auto">
        {/* Tabs Navigation - Only show if at least one has data */}
        {!loading && (discounts.length > 0 || vouchers.length > 0) && (
          <div className="flex items-center gap-4 mb-8 border-b border-gray-200">
            {discounts.length > 0 && (
              <button
                onClick={() => setActiveTab("discounts")}
                className={`flex items-center gap-2 px-6 py-3 font-semibold text-lg transition-all duration-200 border-b-2 cursor-pointer ${
                  activeTab === "discounts"
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Percent className="w-5 h-5" />
                Chương trình giảm giá
              </button>
            )}
            {vouchers.length > 0 && (
              <button
                onClick={() => setActiveTab("vouchers")}
                className={`flex items-center gap-2 px-6 py-3 font-semibold text-lg transition-all duration-200 border-b-2 cursor-pointer ${
                  activeTab === "vouchers"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <TicketPercent className="w-5 h-5" />
                Mã giảm giá
              </button>
            )}
          </div>
        )}

        {/* Show message if both are empty */}
        {!loading && discounts.length === 0 && vouchers.length === 0 && (
          <div className="text-center py-16 text-gray-500 bg-white rounded-lg">
            <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">
              Hiện tại không có chương trình khuyến mãi hoặc mã giảm giá nào có sẵn.
            </p>
          </div>
        )}

        {/* Active Discounts Section */}
        {activeTab === "discounts" && (
          <section className="mb-16">
            <p className="text-gray-600 mb-8">
              Chương trình khuyến mãi - Tiết kiệm lớn trên các sản phẩm chọn lọc
            </p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-gray-200 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : discounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discounts.map((discount) => {
                  return (
                    <Link
                      key={discount.id}
                      href={`/sale/${discount.slug}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 block"
                    >
                      {/* Banner Image */}
                      {discount.bannerImage ? (
                        <div className="relative h-44 overflow-hidden">
                          <Image
                            src={discount.bannerImage.publicUrl}
                            alt={discount.bannerImage.altText || discount.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="relative h-44 bg-gradient-to-br from-red-400 via-pink-400 to-purple-500 flex items-center justify-center">
                          <Percent className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}

                      {/* Card Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900 leading-tight pr-2">
                            {discount.name}
                          </h3>
                          <span className="bg-green-100 text-green-700 text-sx font-bold px-3 py-1 rounded-full whitespace-nowrap ml-4">
                            Giảm {calculateDiscount(discount.type, discount.value)}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-base mb-4 line-clamp-2 min-h-[40px]">
                          {discount.description || "Áp dụng toàn bộ sản phẩm"}
                        </p>

                        {/* Max Discount */}
                        {discount.maxDiscountValue && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                            <p className="text-blue-700 text-sm font-medium">
                              Giảm tối đa:{" "}
                              <span className="font-semibold">
                                {Number(
                                  discount.maxDiscountValue
                                ).toLocaleString("en-US")}
                                đ
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Valid Period */}
                        <div className="flex items-center gap-2 text-base text-gray-500 pt-2 border-t border-gray-100">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          Có hiệu lực:{" "}
                          <span className="font-semibold">
                            <span className="truncate">
                              {formatDate(discount.startAt)} -{" "}
                              {formatDate(discount.endAt)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 bg-white rounded-lg">
                <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Hiện tại không có chương trình khuyến mãi nào.</p>
              </div>
            )}
          </section>
        )}

        {/* Vouchers Section */}
        {activeTab === "vouchers" && (
          <section>
            <p className="text-gray-600 mb-8">
              Nhận mã giảm giá độc quyền để tiết kiệm thêm.
            </p>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-200 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : vouchers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vouchers.map((voucher) => {
                  const isFullyUsed = voucher.usedCount >= voucher.maxUsage;
                  return (
                    <div
                      key={voucher.id}
                      className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 ${
                        isFullyUsed ? "opacity-50 grayscale" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-100 text-blue-700 font-mono font-bold px-4 py-2 rounded text-lg">
                              {voucher.code}
                            </span>
                            <Button
                              onClick={() => handleCopyCode(voucher.code)}
                              variant="ghost"
                              size="sm"
                              disabled={isFullyUsed}
                              className="flex items-center gap-2"
                            >
                              {copiedCode === voucher.code ? (
                                <>
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span className="text-green-500">
                                    Đã sao chép!
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-gray-700 text-xl font-medium mb-3">
                            {voucher.description}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-sx font-bold px-3 py-1 rounded-full whitespace-nowrap ml-4">
                          {voucher.type === "free_shipping" 
                            ? "Miễn phí vận chuyển " 
                            : `Giảm giá ${calculateDiscount(voucher.type, voucher.value)}`}
                        </span>
                      </div>

                      <div className="space-y-2 text-base text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>
                            Đơn hàng tối thiểu:{" "}
                            <span className="font-semibold">
                              {Number(voucher.minOrderAmount).toLocaleString(
                                "en-US"
                              )}
                              đ
                            </span>
                          </span>

                          {voucher.maxDiscountValue && (
                            <span>
                              Giảm tối đa:{" "}
                              <span className="font-semibold">
                                {Number(
                                  voucher.maxDiscountValue
                                ).toLocaleString("en-US")}
                                đ
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Có hiệu lực:
                            <span className="font-semibold">
                              {formatDate(voucher.validFrom)} -{" "}
                              {formatDate(voucher.validTo)}
                            </span>
                          </span>
                          {isFullyUsed && (
                            <span className="inline-block bg-red-100 text-red-600 text-base font-semibold px-3 py-1 rounded-full">
                              Hạn mức sử dụng đã đạt
                            </span>
                          )}
                        </div>
                        {/* Usage Progress Bar */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-600 font-medium">
                              Sử dụng:
                            </span>
                            <span
                              className={`font-semibold ${
                                isFullyUsed
                                  ? "text-red-600"
                                  : voucher.usedCount / voucher.maxUsage >= 0.8
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {/* {voucher.usedCount}/{voucher.maxUsage} */}
                              {voucher.maxUsage === 0 
                                ? "100" 
                                : Math.round((voucher.usedCount / voucher.maxUsage) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFullyUsed
                                  ? "bg-red-500"
                                  : voucher.usedCount / voucher.maxUsage >= 0.8
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${
                                  (voucher.usedCount / voucher.maxUsage) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Hiện tại không có mã giảm giá</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
