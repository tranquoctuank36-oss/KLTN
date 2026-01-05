import { Brand } from "./brand";
import { Category } from "./categories";
import { ProductImages } from "./productImage";
import { ProductVariants } from "./productVariants";
import { Tags } from "./tags";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productType: string;
  gender: string;

  frameDetail?: {
    lensWidth?: number;
    bridgeWidth?: number;
    templeLength?: number;
    lensHeight?: number;
    frameShape?: {
      id: string;
      name: string;
      slug: string;
    };
    frameType?: {
      id: string;
      name: string;
      slug: string;
    };
    frameMaterial?: {
      id: string;
      name: string;
      slug: string;
    };
    frameFeatures?: any[];
  };

  brand: Brand;
  categories?: Category[];
  tags: Tags[];

  isFeatured?: boolean;
  averageRating?: number;
  reviewCount?: number;
  totalSold?: number;
  viewCount?: number;

  variants: ProductVariants[];
};
