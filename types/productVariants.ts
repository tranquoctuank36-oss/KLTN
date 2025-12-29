
import { ProductColor } from "./productColor";
import { ProductImages } from "./productImage";

export type ProductVariants = {
  id: string;
  name: string;
  sku: string;
  quantityAvailable: number;
  availableQuantity?: number; // backward compatibility
  stockStatus: "in_stock" | "out_of_stock" | "low_stock" | "unknown";
  finalPrice: string;
  originalPrice: string;
  isDefault?: boolean;
  colors?: Array<{
    id: string;
    name: string;
    slug: string;
    hexCode: string;
  }>;
  lensFeatures?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  images?: ProductImages[];
  productImages?: ProductImages[]; // backward compatibility
  sortOrder?: number;
};
