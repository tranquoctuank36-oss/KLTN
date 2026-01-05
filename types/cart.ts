import type { Product } from "./product";
import { ProductVariants } from "./productVariants";

export type CartItem = {
  cartItemId?: string; // ID của item trong cart từ API
  product: Product;
  selectedVariant: ProductVariants;
  quantity: number;
  status?: "unknown" | "out_of_stock" | "low_stock" | "in_stock" | "unavailable"; // Status của item trong cart từ API
};