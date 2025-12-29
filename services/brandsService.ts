import { Brand } from "@/types/brand";
import api from "./api";

type GetBrandsParams = {
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
};

export async function getBrands(params?: GetBrandsParams): Promise<Brand[]> {
  try {
    const res = await api.get("/brands", { params });
    return res.data?.data || [];
  } catch (err) {
    console.error("❌ getBrands error:", err);
    throw err;
  }
}

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  try {
    const response = await api.get(`/brands/slug/${slug}`);
    return response.data?.data || response.data;
  } catch (err) {
    console.error("❌ getBrandBySlug error:", err);
    throw err;
  }
};

export const getBrandById = async (id: string): Promise<Brand> => {
  try {
    const response = await api.get(`/brands/${id}`);
    return response.data?.data || response.data;
  } catch (err) {
    console.error("❌ getBrandById error:", err);
    throw err;
  }
};