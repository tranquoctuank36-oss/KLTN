export type Categories = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  children?: string[];
};