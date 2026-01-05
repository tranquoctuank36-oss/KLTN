"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem } from "@/types/cart";
import { 
  getCart, 
  addItemToCart, 
  removeItemFromCart, 
  updateCartItemQuantity,
  mergeCart,
  hasCartIdentifier,
  type CartResponse,
  type CartItemResponse
} from "@/services/cartService";
import { getProductById } from "@/services/productService";
import { useAuth } from "./AuthContext";

type CartContextType = {
  cart: CartItem[];
  cartLoading: boolean;
  addToCart: (item: CartItem, options?: { autoOpenDrawer?: boolean }) => Promise<void>; 
  removeFromCart: (cartItemIds: string | string[]) => Promise<void>;
  clearCart: () => Promise<void>;
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
  const { user, isLoggedIn } = useAuth();
  const [prevIsLoggedIn, setPrevIsLoggedIn] = useState<boolean | null>(null);

  // Map API cart response to CartItem format
  const mapCartResponseToItems = async (apiCart: CartResponse): Promise<CartItem[]> => {
    // Fetch product details for all items in parallel to get slugs
    const itemsWithSlugs = await Promise.all(
      apiCart.items.map(async (item: CartItemResponse) => {
        let productSlug = "";
        let productId = item.productId || "";
        let actualQuantityAvailable = 99; // Default fallback
        
        // Nếu có productId, fetch product details để lấy slug và quantityAvailable
        if (productId && item.productVariantId) {
          try {
            const product = await getProductById(productId);
            if (product) {
              productSlug = product.slug;
              
              // Find the matching variant to get actual quantityAvailable
              const matchingVariant = product.variants?.find(
                (v) => v.id === item.productVariantId
              );
              
              if (matchingVariant) {
                actualQuantityAvailable = matchingVariant.quantityAvailable || 99;
              }
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
          }
        }

        return {
          cartItemId: item.id,
          product: {
            id: productId,
            name: item.name,
            slug: productSlug,
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
            id: item.productVariantId || "",
            name: item.name || "",
            sku: "",
            finalPrice: item.finalPrice,
            originalPrice: item.originalPrice,
            stock: 0,
            quantityAvailable: actualQuantityAvailable,
            stockStatus: (item.status === "in_stock" ? "in_stock" : item.status === "out_of_stock" ? "out_of_stock" : item.status === "low_stock" ? "low_stock" : "unknown") as "in_stock" | "out_of_stock" | "low_stock" | "unknown",
            colors: [],
            images: item.thumbnailImage ? [{
              ...item.thumbnailImage,
              alt: item.thumbnailImage.altText,
              isDefault: true,
            }] : [],
          },
          quantity: item.quantity,
          status: item.status as "unknown" | "out_of_stock" | "low_stock" | "in_stock", // Cast status to correct type
        };
      })
    );

    return itemsWithSlugs;
  };

  // Load cart từ API khi mount hoặc khi user thay đổi
  const refreshCart = async () => {
    try {
      setCartLoading(true);
      
      // Chỉ gọi API nếu có cart identifier (token hoặc anonymousId)
      if (!hasCartIdentifier()) {
        console.log("⚠️ No cart identifier, skipping cart fetch");
        setCart([]);
        setCartLoading(false);
        return;
      }
      
      const apiCart = await getCart();
      const mappedCart = await mapCartResponseToItems(apiCart);
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
      // Detect logout: isLoggedIn changed from true to false
      if (prevIsLoggedIn === true && isLoggedIn === false) {
        console.log("🧹 Logout detected, clearing cart immediately");
        setCart([]);
        setDiscountCode(null);
        setDiscountAmount(0);
        localStorage.removeItem("cartDiscount");
        setCartLoading(false);
        setPrevIsLoggedIn(isLoggedIn);
        return;
      }

      // Update previous state
      setPrevIsLoggedIn(isLoggedIn);

      // Nếu không có cart identifier => clear cart
      if (!hasCartIdentifier()) {
        console.log("⚠️ No cart identifier, clearing cart");
        setCart([]);
        setCartLoading(false);
      } else {
        // Nếu có cart identifier => refresh cart từ API
        refreshCart();
      }
      setIsLoaded(true);
    }
  }, [user, isLoggedIn]);

  // Listen to logout event from other tabs
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "__app:logout") {
        console.log("🧹 Logout detected from another tab, clearing cart");
        setCart([]);
        setDiscountCode(null);
        setDiscountAmount(0);
        localStorage.removeItem("cartDiscount");
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

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
      console.error("Không thể thêm vào giỏ hàng: Không có ID biến thể");
      throw new Error("ID biến thể sản phẩm là bắt buộc");
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

  const removeFromCart = async (cartItemIds: string | string[]) => {
    try {
      setCartLoading(true);
      await removeItemFromCart(cartItemIds);
      await refreshCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setCartLoading(true);
      // Lấy tất cả cartItemIds
      const allCartItemIds = cart
        .map(item => item.cartItemId)
        .filter((id): id is string => !!id);
      
      if (allCartItemIds.length > 0) {
        // Gọi API để xóa tất cả items
        await removeItemFromCart(allCartItemIds);
      }
      
      await refreshCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    } finally {
      setCartLoading(false);
    }
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
    throw new Error("useCart phải được sử dụng trong CartProvider");
  }
  return context;
}
