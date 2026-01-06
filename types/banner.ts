export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  imageId: string;
  linkUrl: Record<string, unknown> | null;
  sortOrder: number;
}

export interface BannerResponse {
  success: boolean;
  message: string;
  data: Banner[];
  meta: {
    requestId: string;
    timestamp: string;
    totalItems: number;
  };
}
