import { Product } from "@/types/product";
import { products } from "@/mocks/products-mock";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function fetchProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    return Promise.resolve(products);
  }
  const res = await fetch(`${API_BASE}/api/products`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  return res.json();
}

export async function fetchProduct(slug: string): Promise<Product> {
  if (USE_MOCK) {
    const found = products.find((p) => p.slug === slug);
    if (!found) throw new Error("Product not found (mock)");
    return Promise.resolve(found);
  }

  const res = await fetch(`${API_BASE}/api/products/${slug}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch product ${slug}: ${res.status}`);
  }

  return res.json();
}
