import api from "./api";
import { Product } from "@/types/product";

export type AggBucket = { key: string; count: number; label?: string };

export interface ElasticAggregation {
  productTypes: AggBucket[];
  genders: AggBucket[];
  frameShapes: AggBucket[];
  frameTypes: AggBucket[];
  frameMaterials: AggBucket[];
  brands: AggBucket[];
  tags: AggBucket[];
  colors: AggBucket[];
  price: { min: number | null; max: number | null };
  size?: { min: number | null; max: number | null }; // For frame width filter
}

export interface ProductSearchResponse {
  data: Product[];
  aggregations?: ElasticAggregation;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

export type ElasticSearchFilters = {
  search?: string;
  productTypes?: string[];
  genders?: string[];
  minLensWidth?: number;
  maxLensWidth?: number;
  minBridgeWidth?: number;
  maxBridgeWidth?: number;
  minTempleLength?: number;
  maxTempleLength?: number;
  minLensHeight?: number;
  maxLensHeight?: number;
  frameShapes?: string[];
  frameTypes?: string[];
  frameMaterials?: string[];
  brands?: string[];
  tags?: string[];
  minPrice?: string;
  maxPrice?: string;
  colors?: string[];
  sortField?: string;
  sortOrder?: string;
};

type SearchQuery = ElasticSearchFilters & { page: number; limit: number };

function buildParams(q: SearchQuery) {
  const usp = new URLSearchParams();

  const append = (k: string, v: any) => {
    if (v === undefined || v === null || v === "") return;

    // nếu là mảng:
    if (Array.isArray(v)) {
      const arr = v
        .map((x) => (x === undefined || x === null ? "" : String(x).trim()))
        .filter((x) => x !== "");

      if (!arr.length) return;

      // Join arrays with comma for better API compatibility
      if (k === "colors" || k === "brands" || k === "tags" || k === "productTypes" || 
          k === "genders" || k === "frameShapes" || k === "frameTypes" || k === "frameMaterials") {
        usp.append(k, arr.join(","));
      } else {
        // default: append repeated params
        arr.forEach((x) => usp.append(k, x));
      }
    } else {
      usp.append(k, String(v));
    }
  };

  Object.entries(q).forEach(([k, v]) => append(k, v));
  return usp.toString();
}

function transformFacetsToAggregations(facets: any[]): ElasticAggregation {
  const agg: any = {
    productTypes: [],
    genders: [],
    frameShapes: [],
    frameTypes: [],
    frameMaterials: [],
    brands: [],
    tags: [],
    colors: [],
    price: { min: null, max: null },
    size: { min: null, max: null },
  };

  facets.forEach((facet: any) => {
    const id = facet.id;
    const type = facet.type;
    const options = facet.options || [];

    if (type === "terms" && Array.isArray(options)) {
      // Map facet IDs to our aggregation keys
      const keyMap: Record<string, keyof ElasticAggregation> = {
        productTypes: "productTypes",
        genders: "genders",
        frameShapes: "frameShapes",
        frameTypes: "frameTypes",
        frameMaterials: "frameMaterials",
        brands: "brands",
        tags: "tags",
        colors: "colors",
      };

      const aggKey = keyMap[id];
      if (aggKey) {
        agg[aggKey] = options.map((opt: any) => ({
          key: opt.value || opt.label,
          count: opt.count || 0,
          label: opt.label,
          ...(opt.hexCode && { hexCode: opt.hexCode }),
        }));
      }
    } else if (type === "range" && id === "price") {
      // Handle price range facet
      agg.price = {
        min: facet.min ?? null,
        max: facet.max ?? null,
      };
    } else if (type === "range" && id === "size") {
      // Handle size range facet - use label to determine which dimension
      const label = (facet.label || "").toLowerCase();
      if (label.includes("chiều rộng gọng kính") || label.includes("frame width")) {
        // This is the total frame width (lensWidth + bridgeWidth)
        // Store it as a combined field for the filter
        (agg as any).size = {
          min: facet.min ?? null,
          max: facet.max ?? null,
        };
      }
    }
  });

  return agg as ElasticAggregation;
}

export async function searchProductsElastic(
  q: SearchQuery
): Promise<ProductSearchResponse> {
  // Map sort values from UI to API format
  let sortField = q.sortField;
  let sortOrder = q.sortOrder;
  
  // Handle UI sort values (popular, newest, price-asc, price-desc)
  if (!sortField && !sortOrder) {
    // Default or no explicit sort
    sortField = undefined;
    sortOrder = undefined;
  }
  
  // Build query with mapped sort
  const queryWithSort = {
    ...q,
    sortField,
    sortOrder,
  };
  
  // Always request facets for aggregations
  const params = buildParams(queryWithSort);
  const url = `/elastic-search/products?${params}&facets=true`;
  const res = await api.get(url);
  
  const root = res.data ?? {};
  const meta = root.meta ?? {};

  // Fix: root.data IS the products array directly
  const products: Product[] = Array.isArray(root.data) ? root.data : [];
  
  // Parse facets from meta.facets and transform to aggregations format
  const aggregations: ElasticAggregation | undefined = meta.facets
    ? transformFacetsToAggregations(meta.facets)
    : undefined;

  const page = Number(meta.currentPage ?? q.page ?? 1);
  const limit = Number(meta.itemsPerPage ?? q.limit ?? 12);
  const total = Number(meta.totalItems ?? products.length);
  const totalPages = Number(
    meta.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1)
  );

  return {
    data: products,
    aggregations,
    pagination: { total, limit, page, totalPages },
  };
}

// Simple in-memory cache for product details
const productCache = new Map<string, { data: Product | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Check cache first
  const cached = productCache.get(slug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await api.get(`/products/${slug}`);
    const product = res.data?.data as Product;
    
    // Store in cache
    productCache.set(slug, { data: product, timestamp: Date.now() });
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const res = await api.get(`/products/id/${id}`);
  return res.data?.data as Product;
}

export async function getSimilarProducts(productId: string, size: number = 20): Promise<Product[]> {
  try {
    const res = await api.get(`/elastic-search/products/similar-frames?productId=${productId}&size=${size}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }
}

export async function getHotProducts(limit: number = 8): Promise<Product[]> {
  try {
    const res = await api.get(`/elastic-search/products/hot`, {
      params: { limit }
    });
    const products = res.data?.data || [];
    
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('Error fetching hot products:', error);
    return [];
  }
}

export async function getBestSellerProducts(limit: number = 8): Promise<Product[]> {
  try {
    const res = await api.get(`/elastic-search/products/best-sellers`, {
      params: { limit }
    });
    const products = res.data?.data || [];
    
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    return [];
  }
}

export async function getTopRatedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const res = await api.get(`/elastic-search/products/top-rated`, {
      params: { limit }
    });
    const products = res.data?.data || [];
    
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('Error fetching top rated products:', error);
    return [];
  }
}

export async function autocompleteSearch(q: string, size: number = 5): Promise<Product[]> {
  try {
    const url = `/elastic-search/autocomplete?q=${encodeURIComponent(q)}&size=${size}`;
    const res = await api.get(url);
    const products = Array.isArray(res.data?.data) ? res.data.data : [];
    return products;
  } catch (error) {
    console.error('Error fetching autocomplete:', error);
    return [];
  }
}

