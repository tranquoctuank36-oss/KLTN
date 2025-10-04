export type ProductImage = {
  id: string;
  url: string;
  alt?: string;
};

export type ProductSizeInfo = {
  size: string;
  inventory: number;
  measurements: FrameMeasurements;
};

export type FrameMeasurements = {
  lensWidth: string;
  lensHeight: string;
  bridgeWidth: string;
  templeLength: string;
};

export type ProductImageSet = {
  id: string;
  colors: string[];
  label: string;
  images: ProductImage[];
  sizes: ProductSizeInfo[];
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  sale?: boolean;
  images: ProductImageSet[];
  brandSlug: string;
  description?: string;
};
