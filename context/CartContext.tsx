"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "@/types/cart";
import { 
  getCart, 
  addItemToCart, 
  removeItemFromCart, 
  updateCartItemQuantity,
  mergeCart,
  getOrCreateAnonymousId,
  type CartResponse,
  type CartItemResponse
} from "@/services/cartService";
import { useAuth } from "./AuthContext";

type CartContextType = {
  cart: CartItem[];
  cartLoading: boolean;
  addToCart: (item: CartItem, options?: { autoOpenDrawer?: boolean }) => Promise<void>; 
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
  setItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  subtotal: number;
  totalQuantity: number;
  discountCode: string | null;
  discountAmount: number;
  applyDiscount: (code: string, amount: number) => void;
  clearDiscount: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth();

  // Map API cart response to CartItem format
  const mapCartResponseToItems = (apiCart: CartResponse): CartItem[] => {
    return apiCart.items.map((item: CartItemResponse) => ({
      cartItemId: item.id,
      product: {
        id: "",
        name: item.name,
        slug: "",
        description: "",
        productType: "",
        gender: "",
        basePrice: item.originalPrice,
        salePrice: Number(item.finalPrice) < Number(item.originalPrice) ? item.finalPrice : null,
        images: [],
        variants: [],
        brand: { 
          id: "", 
          name: "", 
          slug: "",
          websiteUrl: "",
          description: "",
        },
        categories: [],
        tags: [],
        frameGroup: null,
        createdAt: "",
        updatedAt: "",
      },
      selectedVariant: {
        id: "",
        name: item.name || "",
        sku: "",
        finalPrice: item.finalPrice,
        originalPrice: item.originalPrice,
        stock: 0,
        quantityAvailable: item.quantity || 0,
        stockStatus: (item.status === "available" ? "in_stock" : "unknown") as "in_stock" | "out_of_stock" | "low_stock" | "unknown",
        colors: [],
        images: item.thumbnailImage ? [{
          ...item.thumbnailImage,
          alt: item.thumbnailImage.altText,
          isDefault: true,
        }] : [],
      },
      quantity: item.quantity,
    }));
  };

  // Load cart từ API khi mount hoặc khi user thay đổi
  const refreshCart = async () => {
    try {
      setCartLoading(true);
      const apiCart = await getCart();
      
      // Debug log
      console.log("📦 Cart data received:", apiCart);
      console.log("📦 Cart items count:", apiCart.items?.length || 0);
      
      const mappedCart = mapCartResponseToItems(apiCart);
      setCart(mappedCart);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      refreshCart();
      setIsLoaded(true);
    }
  }, [user]);

  // Merge cart khi user đăng nhập
  useEffect(() => {
    const handleMergeCart = async () => {
      if (user) {
        const anonymousId = localStorage.getItem("x-anonymous-id");
        if (anonymousId) {
          try {
            await mergeCart(anonymousId);
            await refreshCart();
          } catch (error) {
            console.error("Error merging cart:", error);
          }
        }
      }
    };
    handleMergeCart();
  }, [user]);

  // Load discount từ localStorage
  useEffect(() => {
    const savedDiscount = localStorage.getItem("cartDiscount");
    if (savedDiscount) {
      try {
        const { code, amount } = JSON.parse(savedDiscount);
        setDiscountCode(code);
        setDiscountAmount(amount);
      } catch (error) {
        console.error("Error loading discount:", error);
      }
    }
  }, []);

  // Lưu discount vào localStorage
  useEffect(() => {
    if (isLoaded) {
      if (discountCode && discountAmount > 0) {
        localStorage.setItem(
          "cartDiscount",
          JSON.stringify({ code: discountCode, amount: discountAmount })
        );
      } else {
        localStorage.removeItem("cartDiscount");
      }
    }
  }, [discountCode, discountAmount, isLoaded]);

  const addToCart = async (item: CartItem, options?: { autoOpenDrawer?: boolean }) => {
    const { autoOpenDrawer = true } = options || {};
    
    if (!item.selectedVariant?.id) {
      console.error("Cannot add to cart: No variant ID");
      throw new Error("Product variant ID is required");
    }
    
    try {
      setCartLoading(true);
      // Gọi API để thêm vào cart với product variant ID
      await addItemToCart(item.selectedVariant.id, item.quantity);
      // Refresh cart từ server
      await refreshCart();
      if (autoOpenDrawer) setIsDrawerOpen(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const removeFromCart = async (cartItemId: string) => {
    try {
      setCartLoading(true);
      await removeItemFromCart(cartItemId);
      await refreshCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    // TODO: Gọi API để xóa cart nếu cần
  };

  const setItemQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setCartLoading(true);
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }
      await updateCartItemQuantity(cartItemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  };

  const applyDiscount = (code: string, amount: number) => {
    setDiscountCode(code);
    setDiscountAmount(amount);
  };

  const clearDiscount = () => {
    setDiscountCode(null);
    setDiscountAmount(0);
    localStorage.removeItem("cartDiscount");
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.selectedVariant.finalPrice) || 0;
    return sum + price * item.quantity;
  }, 0);

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        addToCart,
        removeFromCart,
        clearCart,
        setItemQuantity,
        subtotal,
        totalQuantity,
        discountCode,
        discountAmount,
        applyDiscount,
        clearDiscount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
