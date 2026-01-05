import api from "./api";
import { CreateReviewRequest, UpdateReviewRequest, ReviewResponse } from "@/types/review";

export const createReview = async (
  data: CreateReviewRequest
): Promise<ReviewResponse> => {
  const response = await api.post("/reviews", data);
  return response.data;
};

export const getReviewsByProduct = async (productId: string) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const updateReview = async (reviewId: string, data: UpdateReviewRequest) => {
  const response = await api.patch(`/reviews/${reviewId}`, data);
  return response.data;
};

export const getMyReviews = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get("/reviews/my-reviews", { params });
  return response.data;
};
