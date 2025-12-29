import api from "./api";

export type CartItemResponse = {
  id: string;
  quantity: number;
  status: "unknown" | string;
  name: string;
  originalPrice: string;
  finalPrice: string;
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

// Lấy hoặc tạo anonymousId từ localStorage
export const getOrCreateAnonymousId = (): string => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return ''; // Return empty string on server-side
  }
  
  let anonymousId = localStorage.getItem("x-anonymous-id");
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("x-anonymous-id", anonymousId);
    console.log("🆕 Created new anonymousId:", anonymousId);
  } else {
    console.log("♻️ Reusing existing anonymousId:", anonymousId);
  }
  return anonymousId;
};

// Lấy giỏ hàng
export const getCart = async (): Promise<CartResponse> => {
  try {
    const anonymousId = getOrCreateAnonymousId();
    
    if (!anonymousId) {
      // Return empty cart if no anonymousId (SSR)
      return {
        id: '',
        anonymousId: '',
        type: 'anonymous',
        items: []
      };
    }
    
    console.log("📥 Fetching cart with anonymousId:", anonymousId);
    const response = await api.get("/carts", {
      headers: {
        "x-anonymous-id": anonymousId,
      },
    });
    return response.data?.data || response.data;
  } catch (err: any) {
    console.error("❌ getCart error:", err.response?.status, err.response?.data?.message);
    
    // Nếu lỗi 400 hoặc 404, có thể là cart chưa tồn tại
    // Trả về empty cart thay vì crash
    if (err.response?.status === 400 || err.response?.status === 404) {
      console.log("⚠️ Cart not found or DB error, returning empty cart");
      return {
        id: '',
        anonymousId: getOrCreateAnonymousId(),
        type: 'anonymous',
        items: []
      };
    }
    
    // Với các lỗi khác, vẫn return empty cart để UI không crash
    return {
      id: '',
      anonymousId: getOrCreateAnonymousId(),
      type: 'anonymous',
      items: []
    };
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addItemToCart = async (
  productVariantId: string,
  quantity: number
): Promise<CartResponse> => {
  try {
    const anonymousId = getOrCreateAnonymousId();
    const response = await api.post(
      "/carts/items",
      {
        productVariantId,
        quantity,
      },
      {
        headers: {
          "x-anonymous-id": anonymousId,
        },
      }
    );
    return response.data?.data || response.data;
  } catch (err) {
    console.error("❌ addItemToCart error:", err);
    throw err;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeItemFromCart = async (
  cartItemId: string
): Promise<CartResponse> => {
  try {
    const anonymousId = getOrCreateAnonymousId();
    const response = await api.delete("/carts/items", {
      data: { cartItemId },
      headers: {
        "x-anonymous-id": anonymousId,
      },
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
    const anonymousId = getOrCreateAnonymousId();
    const response = await api.patch(
      "/carts/items/quantity",
      {
        cartItemId,
        quantity,
      },
      {
        headers: {
          "x-anonymous-id": anonymousId,
        },
      }
    );
    return response.data?.data || response.data;
  } catch (err) {
    console.error("❌ updateCartItemQuantity error:", err);
    throw err;
  }
};

// Hợp nhất giỏ hàng anonymous vào giỏ hàng user khi đăng nhập
export const mergeCart = async (
  anonymousId: string
): Promise<CartResponse> => {
  try {
    const response = await api.patch(
      "/carts/merge",
      {},
      {
        headers: {
          "x-anonymous-id": anonymousId,
        },
      }
    );
    return response.data?.data || response.data;
  } catch (err) {
    console.error("❌ mergeCart error:", err);
    throw err;
  }
};
