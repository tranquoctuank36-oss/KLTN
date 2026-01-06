"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { createReturnRequest } from "@/services/returnService";
import { uploadImage } from "@/services/imageService";
import toast from "react-hot-toast";

type CreateReturnFormProps = {
  orderItem: {
    id: string;
    productName: string;
    thumbnailUrl: string;
    colors?: string;
  };
  orderId: string;
  paymentMethod: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreateReturnForm({
  orderItem,
  orderId,
  paymentMethod,
  onSuccess,
  onCancel,
}: CreateReturnFormProps) {
  const [reason, setReason] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Bank info - only for COD orders
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");

  const isCOD = paymentMethod?.toLowerCase() === "cod";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    files.forEach((file) => {
      if (newFiles.length < 5) {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          setImagePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });

    setImageFiles(newFiles);
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    
    if (!reason.trim()) {
      setErrorMessage("Vui lòng nhập lý do trả hàng");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload images if exist and get imageIds
      let imageIds: string[] = [];
      if (imageFiles.length > 0) {
        try {
          const uploadPromises = imageFiles.map((file) => uploadImage(file));
          const uploadResults = await Promise.all(uploadPromises);
          imageIds = uploadResults.map((result) => result.id);
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error("Tải ảnh thất bại");
          setIsSubmitting(false);
          return;
        }
      }

      // Create return request
      const payload: any = {
        reason: reason.trim(),
        customerNote: customerNote.trim(),
        imageIds,
      };

      // Add bank info only for COD orders
      if (isCOD) {
        if (!bankAccountName.trim() || !bankAccountNumber.trim() || !bankName.trim()) {
          setErrorMessage("Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng");
          setIsSubmitting(false);
          return;
        }
        payload.bankAccountName = bankAccountName.trim();
        payload.bankAccountNumber = bankAccountNumber.trim();
        payload.bankName = bankName.trim();
        payload.bankBranch = bankBranch.trim();
      }

      await createReturnRequest(orderId, payload);

      toast.success("Gửi yêu cầu trả hàng thành công!");
      onSuccess?.();

      // Reset form
      setReason("");
      setCustomerNote("");
      setImageFiles([]);
      setImagePreviews([]);
      setBankAccountName("");
      setBankAccountNumber("");
      setBankName("");
      setBankBranch("");
    } catch (error: any) {
      console.error("Failed to submit return request:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Không thể gửi yêu cầu trả hàng";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Yêu cầu trả hàng</h2>

      <div className="space-y-6">
        {/* Product Info */}
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-20 h-20 rounded bg-white flex items-center justify-center">
            <Image
              src={orderItem.thumbnailUrl || "/placeholder.png"}
              alt={orderItem.productName}
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{orderItem.productName}</h3>
            {orderItem.colors && (
              <p className="text-sm text-gray-600 mt-1">
                Màu: {orderItem.colors}
              </p>
            )}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Lý do trả hàng <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Vui lòng nhập lý do trả hàng..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {reason.length} / 500
          </div>
        </div>

        {/* Customer Note */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Ghi chú thêm
          </label>
          <textarea
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Nhập thêm thông tin chi tiết..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {customerNote.length} / 500
          </div>
        </div>

        {/* Bank Information - Only for COD orders */}
        {isCOD && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-blue-900 mb-3">
              Thông tin tài khoản ngân hàng để hoàn tiền
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tên chủ tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Nhập tên chủ tài khoản"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Số tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Nhập số tài khoản"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tên ngân hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ví dụ: Vietcombank, BIDV, Techcombank"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Chi nhánh
                </label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="Nhập chi nhánh (nếu có)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Tải lên hình ảnh (tối đa 5 ảnh)
          </label>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-300"
                >
                  <Image
                    src={preview}
                    alt={`Preview ${index}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {imageFiles.length < 5 && (
            <label className="flex flex-col items-center justify-center w-full min-h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Tải lên ảnh</span>
              <span className="text-xs text-gray-400 mt-1">
                {imageFiles.length} / 5 ảnh
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            // disabled={
            //   isSubmitting ||
            //   !reason.trim() ||
            //   (isCOD && (!bankAccountName.trim() || !bankAccountNumber.trim() || !bankName.trim()))
            // }
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </div>
      </div>
    </div>
  );
}
