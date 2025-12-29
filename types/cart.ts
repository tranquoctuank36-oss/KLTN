import type { Product } from "./product";
import { ProductVariants } from "./productVariants";

export type CartItem = {
  cartItemId?: string; // ID của item trong cart từ API
  product: Product;
  selectedVariant: ProductVariants;
  quantity: number;
};