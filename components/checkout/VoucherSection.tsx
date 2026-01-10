"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { previewOrder } from "@/services/orderService";
import { getActiveVouchers, type Voucher } from "@/services/discountService";
import toast from "react-hot-toast";
import { Loader2, ChevronDown, ChevronUp, Tag } from "lucide-react";

type Props = {
  orderAmount: number;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  toWardId: string;
  toDistrictId: string;
  paymentMethod: string;
  onVoucherApplied: (
    code: string,
    orderDiscount: number,
    shippingDiscount: number
  ) => void;
  onVoucherCleared: () => void;
  currentVoucherCode?: string;
  disabled?: boolean;
};

export default function VoucherSection({
  orderAmount,
  items,
  toWardId,
  toDistrictId,
  paymentMethod,
  onVoucherApplied,
  onVoucherCleared,
  currentVoucherCode,
  disabled = false,
}: Props) {
  const [voucherInput, setVoucherInput] = useState(currentVoucherCode || "");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(
    currentVoucherCode || ""
  );
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const voucherDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close voucher list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        voucherDropdownRef.current &&
        !voucherDropdownRef.current.contains(event.target as Node)
      ) {
        setShowVoucherList(false);
      }
    };

    if (showVoucherList) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVoucherList]);

  const handleApply = async () => {
    const code = voucherInput.trim();

    // Validate location before calling API
    if (!toWardId || !toDistrictId || toWardId === "" || toDistrictId === "") {
      setError("Vui lòng hoàn tất địa chỉ giao hàng trước");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      const result = await previewOrder({
        items,
        toWardId,
        toDistrictId,
        paymentMethod,
        voucherCode: code,
      });

      // Check if voucher provided discount or free shipping
      const hasOrderDiscount = result.voucherOrderDiscount > 0;
      const hasShippingDiscount = result.voucherShippingDiscount > 0;

      if (hasOrderDiscount || hasShippingDiscount) {
        onVoucherApplied(
          code,
          result.voucherOrderDiscount,
          result.voucherShippingDiscount
        );
        setAppliedVoucher(code);
        setError("");
        
        // Find and highlight the voucher in the list if it exists
        const matchedVoucher = availableVouchers.find(
          (v) => v.code.toLowerCase() === code.toLowerCase()
        );
        if (matchedVoucher) {
          setSelectedVoucherId(matchedVoucher.id);
        }
      } else {
        setError("Mã giảm giá không hợp lệ");
        setAppliedVoucher("");
        onVoucherCleared();
      }
    } catch (err) {
      setError("Mã giảm giá không hợp lệ");
      setAppliedVoucher("");
      onVoucherCleared();
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setVoucherInput("");
    setAppliedVoucher("");
    setError("");
    setSelectedVoucherId(null);
    onVoucherCleared();
  };

  const handleViewAll = async () => {
    if (showVoucherList) {
      setShowVoucherList(false);
      return;
    }

    setLoadingVouchers(true);
    try {
      const vouchers = await getActiveVouchers();
      // Filter vouchers where minOrderAmount <= current orderAmount
      const eligible = vouchers.filter(
        (v) =>
          Number(v.minOrderAmount) <= orderAmount && v.usedCount < v.maxUsage
      );
      setAvailableVouchers(eligible);
      setShowVoucherList(true);
    } catch (err) {
      console.error("Không Thể Tải Danh Sách Mã Voucher:", err);
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleSelectVoucher = async (voucher: Voucher) => {
    setVoucherInput(voucher.code);
    setSelectedVoucherId(voucher.id);
    
    // Validate location before calling API
    if (!toWardId || !toDistrictId || toWardId === "" || toDistrictId === "") {
      setError("Vui lòng hoàn tất địa chỉ giao hàng trước");
      return;
    }
    
    // Auto-apply the voucher
    setIsValidating(true);
    setError("");

    try {
      const result = await previewOrder({
        items,
        toWardId,
        toDistrictId,
        paymentMethod,
        voucherCode: voucher.code,
      });

      const hasOrderDiscount = result.voucherOrderDiscount > 0;
      const hasShippingDiscount = result.voucherShippingDiscount > 0;

      if (hasOrderDiscount || hasShippingDiscount) {
        onVoucherApplied(
          voucher.code,
          result.voucherOrderDiscount,
          result.voucherShippingDiscount
        );
        setAppliedVoucher(voucher.code);
        setError("");
        setShowVoucherList(false); // Close dropdown after successful selection
      } else {
        setError("Mã giảm giá không hợp lệ");
        setAppliedVoucher("");
        setSelectedVoucherId(null);
        onVoucherCleared();
      }
    } catch (err) {
      setError("Mã giảm giá không hợp lệ");
      setAppliedVoucher("");
      setSelectedVoucherId(null);
      onVoucherCleared();
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 pb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className={`text-2xl font-bold ${disabled ? 'text-gray-300' : ''}`}>4. Mã giảm giá</h2>
        <button
          onClick={handleViewAll}
          disabled={disabled || loadingVouchers || !toWardId || !toDistrictId}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold text-base hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loadingVouchers ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : showVoucherList ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Xem tất cả
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Nhập mã giảm giá (nếu có)"
          value={voucherInput}
          onChange={(e) => {
            setVoucherInput(e.target.value);
            setError("");
          }}
          disabled={disabled || isValidating || !!appliedVoucher}
          className={`flex-1 border rounded-md px-4 py-3 font-semibold text-gray-600 focus:outline-none ${
            disabled || isValidating || appliedVoucher
              ? "bg-gray-100 cursor-not-allowed"
              : "border-gray-300 focus:border-blue-500"
          } ${appliedVoucher ? "border-green-500" : ""}`}
        />

        {appliedVoucher ? (
          <Button
            onClick={handleRemove}
            disabled={disabled}
            className="text-white px-6 h-[52px] bg-red-500 hover:bg-red-600 min-w-[100px]"
          >
            <span className="text-lg">Hủy</span>
          </Button>
        ) : (
          <Button
            onClick={handleApply}
            disabled={disabled || isValidating || !toWardId || !toDistrictId}
            className={`text-white px-6 h-[52px] min-w-[100px] ${
              disabled || isValidating || !toWardId || !toDistrictId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isValidating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="text-lg">Áp dụng</span>
            )}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      {appliedVoucher && !error && (
        <p className="text-sm text-green-600 mt-3 font-semibold">
          ✓ Đã áp dụng mã: {appliedVoucher}
        </p>
      )}

      {/* Available Vouchers List */}
      <div className="relative mt-4" ref={voucherDropdownRef}>
        {showVoucherList && (
          <div className="absolute z-50 mt-2 right-0 w-[500px] bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-[350px] overflow-y-auto">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Các mã giảm giá có sẵn cho bạn
            </h3>
            {availableVouchers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Không có mã giảm giá nào có sẵn cho số tiền đơn hàng hiện tại
              </p>
            ) : (
              <div className="space-y-3">
                {availableVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                      selectedVoucherId === voucher.id
                        ? "border-green-500 border-2 bg-green-50"
                        : "border-gray-200 hover:border-blue-500"
                    }`}
                    onClick={() => handleSelectVoucher(voucher)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-700 font-mono font-bold px-3 py-1 rounded text-sm">
                            {voucher.code}
                          </span>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                            {voucher.type === "free_shipping"
                              ? "Miễn phí vận chuyển"
                              : voucher.type === "percentage"
                              ? `Giảm giá ${Number(voucher.value) / 100}%`
                              : `Giảm giá ${Number(voucher.value).toLocaleString(
                                  "en-US"
                                )}đ`}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          {voucher.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>
                            Đơn hàng tối thiểu:{" "}
                            {Number(voucher.minOrderAmount).toLocaleString(
                              "en-US"
                            )}
                            đ
                          </span>
                          {voucher.maxDiscountValue && (
                            <span>
                              Giảm tối đa:{" "}
                              {Number(voucher.maxDiscountValue).toLocaleString(
                                "en-US"
                              )}
                              đ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
