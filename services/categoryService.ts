import api from "./api";
import { CategoryTreeResponse, Category } from "@/types/categories";

export const getCategoriesTree = async (
  depth: number = 3
): Promise<Category[]> => {
  try {
    const response = await api.get<CategoryTreeResponse>(
      `/categories/tree?depth=${depth}`
    );
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch categories tree:", error);
    return [];
  }
};
