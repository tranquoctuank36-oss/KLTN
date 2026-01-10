"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, Search, ChevronDown, ChevronUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMyReturns, cancelReturnRequest } from "@/services/returnService";
import { ReturnRequest } from "@/types/return";
import { Routes } from "@/lib/routes";
import ConfirmPopover from "../../ui-common/ConfirmPopover";
import Pagination from "./Pagination";
import { RETURN_STATUS_API_MAP, RETURN_STATUS_DISPLAY, RETURN_STATUS_OPTIONS, RETURN_STATUS_COLORS } from "./orderStatusMap";

interface ReturnsTabProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const ReturnsTab = ({ containerRef }: ReturnsTabProps) => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnsCurrentPage, setReturnsCurrentPage] = useState(1);
  const [returnsTotalPages, setReturnsTotalPages] = useState(0);
  const [returnsSearchTerm, setReturnsSearchTerm] = useState("");
  const [returnsSearchInput, setReturnsSearchInput] = useState("");
  const [returnsSelectedStatus, setReturnsSelectedStatus] = useState("Tất cả trạng thái");
  const [returnsDropdownOpen, setReturnsDropdownOpen] = useState(false);
  const returnsDropdownRef = useRef<HTMLDivElement>(null);
  const returnsSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);

  const fetchReturns = useCallback(async () => {
    try {
      setReturnsLoading(true);
      let statusParam: string | undefined = undefined;
      if (returnsSelectedStatus !== "Tất cả trạng thái") {
        statusParam = RETURN_STATUS_API_MAP[returnsSelectedStatus.toUpperCase()];
      }
      const result = await getMyReturns({
        search: returnsSearchTerm || undefined,
        page: returnsCurrentPage,
        limit: 10,
        status: statusParam,
      });
      setReturns(result.data || []);
      setReturnsTotalPages(result.meta.totalPages);
    } catch (err) {
      console.error("❌ Failed to fetch returns:", err);
      setReturns([]);
      setReturnsTotalPages(0);
    } finally {
      setReturnsLoading(false);
    }
  }, [returnsSearchTerm, returnsCurrentPage, returnsSelectedStatus]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    if (returnsSearchTimeoutRef.current) {
      clearTimeout(returnsSearchTimeoutRef.current);
    }
    returnsSearchTimeoutRef.current = setTimeout(() => {
      setReturnsSearchTerm(returnsSearchInput);
      setReturnsCurrentPage(1);
    }, 500);
    return () => {
      if (returnsSearchTimeoutRef.current) {
        clearTimeout(returnsSearchTimeoutRef.current);
      }
    };
  }, [returnsSearchInput]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (returnsDropdownRef.current && !returnsDropdownRef.current.contains(e.target as Node)) {
        setReturnsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCancelReturn = async (returnId: string) => {
    try {
      await cancelReturnRequest(returnId);
      await fetchReturns();
    } catch (err) {
      console.error("Failed to cancel return request:", err);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center border border-gray-300 hover:border-gray-800 rounded-md px-3 py-3 flex-1 h-[50px]">
          <Search className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã trả hàng"
            className="outline-none flex-1 text-gray-700 placeholder-gray-400 text-base"
            value={returnsSearchInput}
            onChange={(e) => setReturnsSearchInput(e.target.value)}
          />
        </div>
        <div className="relative" ref={returnsDropdownRef}>
          <button
            onClick={() => setReturnsDropdownOpen(!returnsDropdownOpen)}
            className="flex items-center justify-between gap-2 border border-gray-300 hover:border-gray-800 rounded-md px-3 py-3 text-lg w-[200px] h-[50px] cursor-pointer"
          >
            <span className="truncate text-base">{returnsSelectedStatus}</span>
            {returnsDropdownOpen ? <ChevronUp className="h-4 w-4 text-gray-600" /> : <ChevronDown className="h-4 w-4 text-gray-600" />}
          </button>
          {returnsDropdownOpen && (
            <div className="absolute left-0 mt-2 w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-[400px] overflow-y-auto">
              {RETURN_STATUS_OPTIONS.map((status) => (
                <div
                  key={status}
                  onClick={() => {
                    setReturnsSelectedStatus(status);
                    setReturnsCurrentPage(1);
                    setReturnsDropdownOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${returnsSelectedStatus === status ? "bg-gray-200 font-medium" : ""}`}
                >
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative min-h-[200px]">
        {returnsLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        {returns.length === 0 && !returnsLoading ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">Bạn chưa có yêu cầu trả hàng nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((returnRequest) => (
              <div key={returnRequest.id} className="border border-gray-300 rounded-md p-6 bg-white">
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                  <div>
                    <h3 className="font-bold text-lg mb-2">
                      <span className="text-gray-800">Mã trả hàng: </span>
                      <Link href={Routes.orderDetail(returnRequest.orderId)} className="text-orange-600 uppercase hover:underline cursor-pointer">
                        {returnRequest.returnCode}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Mã đơn hàng: </span>
                      <Link href={Routes.orderDetail(returnRequest.orderId)} className="text-blue-600 hover:underline">
                        {returnRequest.orderCode}
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ngày tạo: {new Date(returnRequest.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        RETURN_STATUS_COLORS[returnRequest.status || ""] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {RETURN_STATUS_DISPLAY[returnRequest.status || ""] || returnRequest.status}
                    </span>
                    {(returnRequest.status === "requested" || returnRequest.status === "approved") && (
                      <ConfirmPopover
                        title={returnRequest.returnCode}
                        description="Bạn có chắc chắn muốn hủy yêu cầu trả hàng với mã hàng"
                        onConfirm={() => handleCancelReturn(returnRequest.id)}
                        confirmText="Xác nhận"
                        cancelText="Đóng"
                      >
                        <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-700 hover:text-red-700 rounded-full px-4 py-2 text-sm">
                          Hủy yêu cầu
                        </Button>
                      </ConfirmPopover>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="font-semibold text-gray-800 mb-1">Lý do trả hàng:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{returnRequest.reason}</p>
                </div>
                {returnRequest.customerNote && (
                  <div className="mb-4">
                    <p className="font-semibold text-gray-800 mb-1">Ghi chú:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{returnRequest.customerNote}</p>
                  </div>
                )}
                {returnRequest.calculatedRefundAmount && (
                  <div className="mb-4">
                    <p className="font-semibold text-gray-800">
                      Số tiền hoàn: <span className="text-green-600 text-lg">{Number(returnRequest.calculatedRefundAmount).toLocaleString("en-US")}đ</span>
                    </p>
                  </div>
                )}
                {returnRequest.images && returnRequest.images.length > 0 && (
                  <div className="mb-4">
                    <p className="font-semibold text-gray-800 mb-2">Hình ảnh đính kèm:</p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {returnRequest.images.map((image) => (
                        <div
                          key={image.id}
                          className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition"
                          onClick={() => setLightboxImage({ url: image.publicUrl, alt: image.altText || "Ảnh trả hàng" })}
                        >
                          <Image src={image.publicUrl} alt={image.altText || "Ảnh trả hàng"} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {returnRequest.status === "rejected" && returnRequest.rejectedReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-900 mb-1">Lý do từ chối:</p>
                    <p className="text-sm text-red-800">{returnRequest.rejectedReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination currentPage={returnsCurrentPage} totalPages={returnsTotalPages} onPageChange={setReturnsCurrentPage} containerRef={containerRef} />

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

export default ReturnsTab;
