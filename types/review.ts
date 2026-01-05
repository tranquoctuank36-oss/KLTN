export type Review = {
  id: string;
  rating: number;
  comment?: string;
  image?: {
    id: string;
    publicUrl: string;
    altText?: string;
    sortOrder?: number;
  };
  nameDisplay: string;
  colors?: string;
  status?: string;
  productId?: string;
  orderItem?: {
    id: string;
    productVariantId: string;
    productId: string;
    productName: string;
    productVariantName: string;
    sku: string;
    colors: string;
    quantity: number;
    finalPrice: string;
    originalPrice: string;
    thumbnailUrl: string;
    isReviewed: boolean;
  };
  deadlineUpdate?: string;
  createdAt: string;
  isEdited?: boolean;
  updatedAt?: string;
};

export type CreateReviewRequest = {
  nameDisplay: string;
  rating: number;
  comment?: string;
  orderItemId: string;
  imageId?: string;
};

export type UpdateReviewRequest = {
  rating?: number;
  comment?: string;
  newImageId?: string;
};

export type ReviewResponse = {
  success: boolean;
  message: string;
  data: Review;
};
