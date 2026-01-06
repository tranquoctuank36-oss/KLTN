import api from "./api";
import { BannerResponse } from "@/types/banner";

export const bannerService = {
  // Lấy danh sách banner đang active
  getActiveBanners: async (): Promise<BannerResponse> => {
    const response = await api.get<BannerResponse>("/banners");
    return response.data;
  },
};
