export type Category = {
  id: string;
  name: string;
  description?: string;
  relativeUrl: string;
  slug: string;
  parent?: {
    id: string;
    name: string;
    description?: string;
    relativeUrl: string;
    slug: string;
    parent?: string;
  };
  children?: Category[];
};

export type CategoryTreeResponse = {
  success: boolean;
  message: string;
  data: Category[];
  meta: {
    requestId: string;
    timestamptz: string;
    totalItems: number;
  };
};