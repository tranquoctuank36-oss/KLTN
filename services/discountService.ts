import api from "./api";

export type Discount = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: "percentage" | "fixed";
  value: string;
  maxDiscountValue: string;
  status: "draft" | "active" | "expired";
  startAt: string;
  endAt: string;
  bannerImage?: {
    id: string;
    publicUrl: string;
    altText: string;
    sortOrder: number;
  };
};

export type Voucher = {
  id: string;
  code: string;
  description: string;
  minOrderAmount: string;
  maxUsage: number;
  usedCount: number;
  type: "fixed" | "percentage";
  value: string;
  maxDiscountValue: string;
  validFrom: string;
  validTo: string;
};

export const getActiveDiscounts = async (): Promise<Discount[]> => {
  try {
    const response = await api.get("/discounts");
    return response.data?.data || [];
  } catch (err) {
    console.error("❌ getActiveDiscounts error:", err);
    throw err;
  }
};

export const getActiveVouchers = async (): Promise<Voucher[]> => {
  try {
    const response = await api.get("/vouchers");
    return response.data?.data || [];
  } catch (err) {
    console.error("❌ getActiveVouchers error:", err);
    throw err;
  }
};

export const getDiscountBySlug = async (slug: string): Promise<Discount> => {
  try {
    const response = await api.get(`/discounts/${slug}`);
    return response.data?.data;
  } catch (err) {
    console.error("❌ getDiscountBySlug error:", err);
    throw err;
  }
};

export const getDiscountProducts = async (
  discountId: string,
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (search) params.append("search", search);

    const response = await api.get(`/discounts/${discountId}/products?${params.toString()}`);
    return {
      data: response.data?.data || [],
      pagination: response.data?.meta || {
        total: 0,
        limit: limit,
        page: page,
        totalPages: 1,
      },
    };
  } catch (err) {
    console.error("❌ getDiscountProducts error:", err);
    throw err;
  }
};
