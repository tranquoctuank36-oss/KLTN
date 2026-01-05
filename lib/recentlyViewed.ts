const RECENTLY_VIEWED_KEY = "recently_viewed_products";
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  viewedAt: number;
}

export function addToRecentlyViewed(productId: string, slug: string): void {
  if (typeof window === "undefined") return;

  try {
    // Get existing items
    const existing = getRecentlyViewed();

    // Remove if already exists
    const filtered = existing.filter((item) => item.id !== productId);

    // Add to beginning
    const updated: RecentlyViewedItem[] = [
      { id: productId, slug, viewedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS);

    // Save to localStorage
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save recently viewed product:", error);
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!data) return [];

    const items: RecentlyViewedItem[] = JSON.parse(data);
    return items;
  } catch (error) {
    console.error("Failed to get recently viewed products:", error);
    return [];
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error("Failed to clear recently viewed products:", error);
  }
}
