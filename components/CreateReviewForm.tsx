"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Upload, X } from "lucide-react";
import Image from "next/image";
import { createReview, updateReview } from "@/services/reviewService";
import { uploadImage } from "@/services/imageService";
import toast from "react-hot-toast";
import { Review } from "@/types/review";

type CreateReviewFormProps = {
  orderItem: {
    id: string;
    productName: string;
    thumbnailUrl: string;
    colors?: string;
  };
  existingReview?: Review;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function CreateReviewForm({
  orderItem,
  existingReview,
  onSuccess,
  onCancel,
}: CreateReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [nameDisplay, setNameDisplay] = useState(existingReview?.nameDisplay || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when existingReview changes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
      setNameDisplay(existingReview.nameDisplay || "");
      if (existingReview.image?.publicUrl) {
        setImagePreview(existingReview.image.publicUrl);
      }
    }
  }, [existingReview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!nameDisplay.trim()) {
      toast.error("Vui lòng nhập tên hiển thị của bạn");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn đảnh giá");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image if exists and get imageId
      let imageId: string | undefined;
      if (imageFile) {
        try {
          const uploadResult = await uploadImage(imageFile);
          imageId = uploadResult.id;
        } catch (error) {
          console.error("Tải ảnh thất bại:", error);
          toast.error("Tải ảnh thất bại");
          setIsSubmitting(false);
          return;
        }
      }

      if (existingReview) {
        // Cập nhật đánh giá hiện có
        const updatedReview = await updateReview(existingReview.id, {
          rating,
          comment: comment.trim(),
          newImageId: imageId,
        });
        console.log("Updated review:", updatedReview);
        toast.success("Đánh giá được cập nhật thành công!");
      } else {
        // Create new review
        await createReview({
          nameDisplay: nameDisplay.trim(),
          rating,
          comment: comment.trim(),
          orderItemId: orderItem.id,
          imageId,
        });
        toast.success("Đánh giá được gửi thành công!");
      }
      onSuccess?.();

      // Reset form
      setRating(5);
      setComment("");
      setNameDisplay("");
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast.error(
        error.response?.data?.detail || "Gửi đánh giá thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">
        {existingReview ? "Cập nhật đánh giá" : "Đánh giá sản phẩm"}
      </h2>

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
                Màu Sắc: {orderItem.colors}
              </p>
            )}
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Tên hiển thị <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nameDisplay}
            onChange={(e) => setNameDisplay(e.target.value)}
            placeholder="Nhập tên của bạn..."
            disabled={!!existingReview}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={100}
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Đánh giá <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-lg font-semibold text-gray-700">
              {rating} / 5
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Nhận xét
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {comment.length} / 500
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Tải lên hình ảnh
          </label>
          {imagePreview ? (
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-300">
              <Image
                src={imagePreview}
                alt="Xem trước Đánh Giá"
                fill
                className="object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Tải ảnh lên</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

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
            disabled={isSubmitting || !nameDisplay.trim()}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting 
              ? (existingReview ? "Đang cập nhật..." : "Đang gửi...") 
              : (existingReview ? "Cập nhật " : "Gửi đánh giá")
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
