"use client";

import { forwardRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAddresses } from "@/services/userService";
import { UserAddress } from "@/types/userAddress";

type Props = {
  onAddAddress: () => void;
  onEditAddress: (address: UserAddress) => void;
  onCountChange?: (count: number) => void;
};

const AddressSection = forwardRef<HTMLDivElement, Props>(
  ({ onAddAddress, onEditAddress, onCountChange }, ref) => {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    useEffect(() => {
      async function load() {
        setLoading(true);
        try {
          const res = await getAddresses();
          const list = Array.isArray(res) ? res : [];

          list.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
          setAddresses(list);
          if (onCountChange) onCountChange(list.length);
        } catch (err) {
          console.error("Không Thể Tải Địa Chỉ:", err);
          setAddresses([]);
        } finally {
          setLoading(false);
        }
      }
      load();
    }, []);

    const totalPages = Math.ceil(addresses.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentAddresses = addresses.slice(startIdx, startIdx + itemsPerPage);

    if (loading) {
      return (
        <div
          ref={ref}
          className="flex flex-col justify-center items-center h-[250px] text-gray-500"
        >
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="bg-white border rounded-lg p-6 shadow-sm scroll-mt-[var(--header-h)]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-6 w-6 text-gray-600" />
          <h3 className="text-2xl font-semibold">Địa chỉ</h3>
          <span className="text-gray-500 text-xl">
            ({currentPage}/{totalPages || 1})
          </span>
        </div>

        {/* Nếu không có địa chỉ */}
        {addresses.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            Bạn chưa lưu địa chỉ nào.
          </div>
        ) : (
          <div>
            {Array.from({ length: itemsPerPage }).map((_, idx) => {
              const addr = currentAddresses[idx];
              const isLastRealItem = idx === currentAddresses.length - 1;

              return addr ? (
                <div
                  key={addr.id || idx}
                  className={`py-4 ${
                    !isLastRealItem ? "border-b border-gray-300" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{addr.recipientName}</p>
                      {addr.isDefault && (
                        <span className="bg-gray-400 text-white text-sm font-medium px-1.5 py-0.5 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">{addr.recipientPhone}</p>
                    <p className="text-gray-700">
                      {addr.addressLine}, {addr.provinceName},{" "}
                      {addr.districtName}, {addr.wardName}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => onEditAddress(addr)}
                      className="text-blue-600 underline text-sm hover:no-underline drop-shadow-none"
                    >
                      Chỉnh sửa
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  key={`empty-${idx}`}
                  className={`py-4 ${
                    idx !== itemsPerPage - 1
                      ? "border-b border-transparent"
                      : ""
                  }`}
                >
                  <div className="h-24 mb-3" />
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center border-t-2 border-gray-300 mt-6 pt-2">
          <div>
            <Button
              className="text-blue-800 font-normal hover:underline drop-shadow-none p-0 text-base"
              onClick={() => {
                onAddAddress();
              }}
            >
              Thêm địa chỉ mới
            </Button>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-6 h-6 rounded-full flex items-center justify-center border border-gray-400 hover:border-gray-800 ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800 cursor-pointer"
                }`}
              >
                <ChevronLeft className="!h-4 !w-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentPage === page
                        ? "bg-gray-200 font-semibold"
                        : "text-gray-500 hover:text-gray-800 cursor-pointer"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`w-6 h-6 rounded-full flex items-center justify-center border border-gray-400 hover:border-gray-800 ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800 cursor-pointer"
                }`}
              >
                <ChevronRight className="!h-4 !w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

AddressSection.displayName = "AddressSection";
export default AddressSection;
