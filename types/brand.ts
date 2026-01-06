export type Brand = {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  description: string;
  bannerImage?: {
    id: string;
    publicUrl: string;
    altText: string;
    sortOrder: number;
  };
};
