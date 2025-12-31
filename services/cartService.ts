import api from "./api";

export type CartItemResponse = {
  id: string;
  quantity: number;
  status: "unknown" | string;
  name: string;
  originalPrice: string;
  finalPrice: string;
  productId?: string;
  productVariantId?: string;
  thumbnailImage: {
    id: string;
    publicUrl: string;
    altText: string;
    sortOrder: number;
  };
};

export type CartResponse = {
  id: string;
  anonymousId: string;
  type: "user" | "anonymous";
  items: CartItemResponse[];
};

// Lấy anonymousId từ localStorage (không tạo mới)
export const getAnonymousId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("x-anonymous-id");
};

// Lưu anonymousId vào localStorage
export const saveAnonymousId = (anonymousId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("x-anonymous-id", anonymousId);
  console.log("💾 Saved anonymousId:", anonymousId);
};

// Xóa anonymousId khỏi localStorage (dùng khi logout)
export const clearAnonymousId = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("x-anonymous-id");
  console.log("🗑️ Cleared anonymousId");
};

// Kiểm tra có token hoặc anonymousId không
export const hasCartIdentifier = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  const anonymousId = getAnonymousId();
  return !!(token || anonymousId);
};

// Helper: chỉ add header khi anonymousId tồn tại
const withAnonymousHeader = (anonymousId: string | null) => {
  return anonymousId ? { headers: { "x-anonymous-id": anonymousId } } : {};
};

const emptyCart = (anonymousId: string = ""): CartResponse => ({
  id: "",
  anonymousId,
  type: "anonymous",
  items: [],
});

// Lấy giỏ hàng
export const getCart = async (): Promise<CartResponse> => {
  try {
    if (!hasCartIdentifier()) {
      return emptyCart();
    }

    const anonymousId = getAnonymousId();

    const response = await api.get("/carts", withAnonymousHeader(anonymousId));
    return response.data?.data || response.data;
  } catch (err: any) {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;
    
    console.error("❌ getCart error:", status, detail);

    // 404 = cart không tồn tại (đã bị xóa sau logout hoặc chưa tạo)
    // 400 = bad request (anonymousId không hợp lệ)
    // Với mọi lỗi, trả về empty cart để UI không crash
    if (status === 404 || status === 400) {
      // Clear anonymousId cũ nếu không còn hợp lệ
      if (status === 404 || status === 400) {
        clearAnonymousId();
      }
      return emptyCart();
    }

    return emptyCart(getAnonymousId() || "");
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addItemToCart = async (
  productVariantId: string,
  quantity: number
): Promise<CartResponse> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    // Nếu đã đăng nhập (có token), không cần anonymousId
    if (token) {
      console.log("➕ Adding item to cart (logged in user)");
      const response = await api.post(
        "/carts/items",
        { productVariantId, quantity }
      );
      return response.data?.data || response.data;
    }

    // Guest user - cần anonymousId
    let anonymousId = getAnonymousId();

    // Nếu chưa có anonymousId, gọi GET /carts để lấy từ server
    if (!anonymousId) {
      console.log("🔄 No anonymousId found, fetching from server...");
      const cartResponse = await api.get("/carts");
      const cartData = cartResponse.data?.data || cartResponse.data;

      const serverAnonymousId: unknown = cartData?.anonymousId;
      if (typeof serverAnonymousId === "string" && serverAnonymousId.length > 0) {
        anonymousId = serverAnonymousId;
        saveAnonymousId(anonymousId);
        console.log("✅ Got anonymousId from server:", anonymousId);
      } else {
        throw new Error("Server did not return anonymousId");
      }
    }

    // Tới đây anonymousId chắc chắn là string
    console.log("➕ Adding item to cart with anonymousId:", anonymousId);
    const response = await api.post(
      "/carts/items",
      { productVariantId, quantity },
      { headers: { "x-anonymous-id": anonymousId } }
    );

    return response.data?.data || response.data;
  } catch (err) {
    console.error("❌ addItemToCart error:", err);
    throw err;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeItemFromCart = async (cartItemIds: string | string[]): Promise<CartResponse> => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    // Convert to array if single string
    const items = Array.isArray(cartItemIds) ? cartItemIds : [cartItemIds];
    
    // Nếu đã đăng nhập, không gửi anonymousId header
    if (token) {
      const response = await api.delete("/carts/items", {
        data: { cartItemIds: items },
      });
      return response.data?.data || response.data;
    }
    
    // Guest user - cần anonymousId
    const anonymousId = getAnonymousId();
    const response = await api.delete("/carts/items", {
      data: { cartItemIds: items },
      ...(withAnonymousHeader(anonymousId) as any),
    });
    return response.data?.data || response.data;
  } catch (err) {
    console.error("❌ removeItemFromCart error:", err);
    throw err;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItemQuantity = async (
  cartItemId: string,
  quantity: number
): Promise<CartResponse> => {
  try {
    console.log("🔄 updateCartItemQuantity called with:", { cartItemId, quantity });
    
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    // Nếu đã đăng nhập, không gửi anonymousId header
    if (token) {
      console.log("✅ Logged in user - no anonymousId needed");
      const response = await api.patch(
        "/carts/items/quantity",
        { cartItemId, quantity }
      );
      return response.data?.data || response.data;
    }
    
    // Guest user - cần anonymousId
    const anonymousId = getAnonymousId();
    const response = await api.patch(
      "/carts/items/quantity",
      { cartItemId, quantity },
      withAnonymousHeader(anonymousId)
    );
    return response.data?.data || response.data;
  } catch (err) {
    console.error("❌ updateCartItemQuantity error:", err);
    throw err;
  }
};

// Hợp nhất giỏ hàng anonymous vào giỏ hàng user khi đăng nhập
// FIX: Hàm này chỉ nhận string (không nhận null)
export const mergeCart = async (anonymousId: string): Promise<CartResponse> => {
  const response = await api.patch(
    "/carts/merge",
    {},
    { headers: { "x-anonymous-id": anonymousId } }
  );
  return response.data?.data || response.data;
};

// Helper call merge (nếu bạn muốn dùng nơi đăng nhập):
export const mergeCartIfPossible = async (): Promise<CartResponse | null> => {
  const anonymousId = getAnonymousId();
  if (!anonymousId) return null; // không có thì khỏi merge
  return mergeCart(anonymousId);
};
